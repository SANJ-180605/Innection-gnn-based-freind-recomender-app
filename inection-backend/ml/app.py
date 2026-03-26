# backend/ml/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from gnn_model import RecommendationService, build_user_graph
import pymongo
import json

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['inection']
users_collection = db['users']
interactions_collection = db['interactions']

# Initialize recommendation service
recommendation_service = RecommendationService()

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get recommendations for a user"""
    data = request.json
    user_id = data.get('userId')
    filters = data.get('filters', {})
    
    # Get all users
    users = list(users_collection.find({}, {'password': 0}))
    
    # Get interactions
    interactions = list(interactions_collection.find({}))
    interaction_list = [
        {'user_i': i['user'], 'user_j': i['targetUser'], 'weight': i['weight']}
        for i in interactions
    ]
    
    # Convert ObjectId to string for JSON serialization
    for user in users:
        user['_id'] = str(user['_id'])
    
    # Get recommendations
    recommendations = recommendation_service.get_recommendations(
        user_id, users, interaction_list, filters
    )
    
    return jsonify({'recommendations': recommendations})

@app.route('/train', methods=['POST'])
def train_model():
    """Train or update the GNN model"""
    # Get all users and interactions
    users = list(users_collection.find({}, {'password': 0}))
    interactions = list(interactions_collection.find({}))
    
    # Convert for training
    user_data = []
    for user in users:
        user_data.append({
            '_id': str(user['_id']),
            'ageGroup': user.get('ageGroup', '16-25'),
            'interests': user.get('interests', []),
            'hobbies': user.get('hobbies', [])
        })
    
    interaction_data = [
        {'user_i': str(i['user']), 'user_j': str(i['targetUser']), 'weight': i['weight']}
        for i in interactions
    ]
    
    # Build graph and update embeddings
    x, edge_index, edge_weights = build_user_graph(user_data, interaction_data)
    
    # Update model (simplified)
    # In practice, you'd train the model here
    
    return jsonify({'status': 'training completed'})

if __name__ == '__main__':
    app.run(port=5001)