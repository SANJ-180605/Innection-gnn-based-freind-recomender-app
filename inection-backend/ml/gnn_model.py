# backend/ml/gnn_model.py
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, SAGEConv, GATConv
import numpy as np

class UserInterestGNN(nn.Module):
    """Graph Neural Network for user interest-based recommendations"""
    
    def __init__(self, input_dim, hidden_dim, output_dim, num_layers=2, dropout=0.3):
        super(UserInterestGNN, self).__init__()
        
        self.num_layers = num_layers
        self.dropout = dropout
        
        # First layer: Graph Convolution
        self.conv1 = GCNConv(input_dim, hidden_dim)
        
        # Second layer: Graph Attention
        self.conv2 = GATConv(hidden_dim, hidden_dim, heads=4, concat=False)
        
        # Third layer (optional)
        if num_layers > 2:
            self.conv3 = SAGEConv(hidden_dim, output_dim)
        else:
            self.conv3 = nn.Linear(hidden_dim, output_dim)
        
        self.batch_norm1 = nn.BatchNorm1d(hidden_dim)
        self.batch_norm2 = nn.BatchNorm1d(hidden_dim)
        
    def forward(self, x, edge_index):
        # First convolution
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.batch_norm1(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        
        # Second convolution (GAT)
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = self.batch_norm2(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        
        # Final layer
        x = self.conv3(x, edge_index) if hasattr(self.conv3, 'forward') and hasattr(self.conv3, 'edge_index') else self.conv3(x)
        
        return F.normalize(x, p=2, dim=1)

class InterestEncoder(nn.Module):
    """Encode user interests into embeddings"""
    
    def __init__(self, interest_vocab_size, embedding_dim=64):
        super(InterestEncoder, self).__init__()
        self.embedding = nn.Embedding(interest_vocab_size, embedding_dim)
        self.fc = nn.Linear(embedding_dim, embedding_dim)
        
    def forward(self, interest_indices):
        # interest_indices: batch_size x num_interests
        embeddings = self.embedding(interest_indices)
        # Average pooling over interests
        pooled = embeddings.mean(dim=1)
        return self.fc(pooled)

def build_user_graph(users, interactions):
    """
    Build graph from users and their interactions
    
    users: list of user objects with interests
    interactions: list of (user_i, user_j, weight) edges
    """
    num_users = len(users)
    
    # Create feature matrix
    user_features = []
    user_id_to_idx = {user['_id']: i for i, user in enumerate(users)}
    
    # Feature engineering from user attributes
    for user in users:
        features = []
        
        # Age encoding
        age_groups = ['10-16', '16-25', '25-38', '38+']
        age_one_hot = [1 if user['ageGroup'] == ag else 0 for ag in age_groups]
        features.extend(age_one_hot)
        
        # Interest encoding (simplified - in practice use embeddings)
        all_interests = ['Gaming', 'Music', 'Reading', 'Fitness', 'Cooking', 
                        'Travel', 'Business', 'Art', 'E-Sports', 'Devotional', 
                        'News', 'Series/TV', 'Coding', 'Photography', 'Writing']
        
        interest_vector = [1 if interest in user['interests'] else 0 for interest in all_interests]
        features.extend(interest_vector)
        
        # Hobby encoding
        hobbies = ['Drawing', 'Coding', 'Photography', 'Writing']
        hobby_vector = [1 if hobby in user['hobbies'] else 0 for hobby in hobbies]
        features.extend(hobby_vector)
        
        user_features.append(features)
    
    # Build edge index
    edge_index = []
    edge_weights = []
    
    for interaction in interactions:
        if interaction['user_i'] in user_id_to_idx and interaction['user_j'] in user_id_to_idx:
            i = user_id_to_idx[interaction['user_i']]
            j = user_id_to_idx[interaction['user_j']]
            edge_index.append([i, j])
            edge_index.append([j, i])  # undirected
            edge_weights.append(interaction['weight'])
            edge_weights.append(interaction['weight'])
    
    edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
    x = torch.tensor(user_features, dtype=torch.float)
    
    return x, edge_index, edge_weights

class RecommendationService:
    """Service for generating recommendations using GNN"""
    
    def __init__(self, model_path=None):
        self.model = None
        self.user_embeddings = {}
        self.interest_vocab = self._create_interest_vocab()
        
    def _create_interest_vocab(self):
        return {
            'Gaming': 0, 'Music': 1, 'Reading': 2, 'Fitness': 3,
            'Cooking': 4, 'Travel': 5, 'Business': 6, 'Art': 7,
            'E-Sports': 8, 'Devotional': 9, 'News': 10, 'Series/TV': 11,
            'Coding': 12, 'Photography': 13, 'Writing': 14
        }
    
    def compute_similarity(self, user_embedding, target_embeddings):
        """Compute cosine similarity between user and all target users"""
        user_norm = user_embedding / np.linalg.norm(user_embedding)
        target_norm = target_embeddings / np.linalg.norm(target_embeddings, axis=1, keepdims=True)
        return np.dot(target_norm, user_norm)
    
    async def get_recommendations(self, user_id, users_data, interactions_data, filters=None):
        """
        Get personalized recommendations using GNN
        
        Args:
            user_id: ID of target user
            users_data: List of all users
            interactions_data: List of all interactions
            filters: Dict with ageGroup, interests, location filters
        
        Returns:
            List of recommended user IDs with scores
        """
        # Build graph
        x, edge_index, edge_weights = build_user_graph(users_data, interactions_data)
        
        # Initialize and train model (simplified - in practice, train periodically)
        input_dim = x.shape[1]
        hidden_dim = 128
        output_dim = 64
        
        self.model = UserInterestGNN(input_dim, hidden_dim, output_dim)
        self.model.eval()
        
        with torch.no_grad():
            embeddings = self.model(x, edge_index).numpy()
        
        # Store embeddings
        for i, user in enumerate(users_data):
            self.user_embeddings[user['_id']] = embeddings[i]
        
        # Get target user embedding
        target_embedding = self.user_embeddings.get(user_id)
        if target_embedding is None:
            return []
        
        # Compute similarities with all other users
        recommendations = []
        for user in users_data:
            if user['_id'] == user_id:
                continue
            
            # Apply filters
            if filters:
                if filters.get('ageGroup') and user['ageGroup'] != filters['ageGroup']:
                    continue
                if filters.get('interests') and not any(i in user['interests'] for i in filters['interests']):
                    continue
                if filters.get('location') and user['location'] != filters['location']:
                    continue
            
            # Calculate similarity
            similarity = self.compute_similarity(
                target_embedding, 
                self.user_embeddings[user['_id']].reshape(1, -1)
            )[0]
            
            # Boost score based on common interests
            common_interests = set(target_embedding.get('interests', [])) & set(user['interests'])
            interest_boost = len(common_interests) * 0.05
            
            final_score = similarity + interest_boost
            
            recommendations.append({
                'user_id': user['_id'],
                'score': float(final_score),
                'common_interests': list(common_interests),
                'user': user
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations[:20]  # Top 20 recommendations