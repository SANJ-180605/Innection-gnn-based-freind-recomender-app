import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MyPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    interestTag: ''
  });
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch feed posts (from connected people)
      const feedResponse = await fetch('http://localhost:5000/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const feedData = await feedResponse.json();
      if (feedData.success) {
        setPosts(feedData.posts);
      }
      
      // Fetch my own posts
      const myResponse = await fetch('http://localhost:5000/api/posts/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const myData = await myResponse.json();
      if (myData.success) {
        setMyPosts(myData.posts);
      }
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      setError('Please fill in title and content');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewPost({ title: '', content: '', interestTag: '' });
        setShowForm(false);
        fetchPosts();
        setError('');
      } else {
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Create post error:', err);
      setError('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post');
    }
  };

  const PostCard = ({ post, isMyPost = false }) => (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {post.author?.profilePicture || '📝'}
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {post.author?.firstName} {post.author?.lastName}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
        {isMyPost && (
          <button 
            onClick={() => handleDelete(post._id)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '18px' }}
          >
            🗑️
          </button>
        )}
      </div>
      
      <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{post.title}</h3>
      <p style={{ marginBottom: '15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>{post.content}</p>
      
      {post.interestTag && (
        <span className="tag" style={{ marginBottom: '15px', display: 'inline-block' }}>
          #{post.interestTag}
        </span>
      )}
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={() => handleLike(post._id)} 
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          👍 {post.likes?.length || 0} Likes
        </button>
        <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading posts...</p>
        </div>
      </>
    );
  }

  const displayPosts = activeTab === 'feed' ? posts : myPosts;

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '28px' }}>📝 Posts</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Create Post'}
          </button>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              padding: '8px 20px',
              background: activeTab === 'feed' ? '#667eea' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === 'feed' ? 'bold' : 'normal'
            }}
          >
            📰 Feed ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              padding: '8px 20px',
              background: activeTab === 'my' ? '#667eea' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === 'my' ? 'bold' : 'normal'
            }}
          >
            ✏️ My Posts ({myPosts.length})
          </button>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(255,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#ff6b6b' }}>
            {error}
          </div>
        )}
        
        {/* Create Post Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Create New Post</h3>
            <form onSubmit={handleCreatePost}>
              <input
                type="text"
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="input"
                style={{ marginBottom: '10px' }}
                required
              />
              <textarea
                placeholder="What's on your mind? Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="input"
                rows="4"
                style={{ marginBottom: '10px' }}
                required
              />
              <input
                type="text"
                placeholder="Interest Tag (e.g., Gaming, Music, Travel...)"
                value={newPost.interestTag}
                onChange={(e) => setNewPost({ ...newPost, interestTag: e.target.value })}
                className="input"
                style={{ marginBottom: '15px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Publish Post</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}
        
        {/* Posts List */}
        {displayPosts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            {activeTab === 'feed' ? (
              <>
                <p style={{ fontSize: '18px', marginBottom: '20px' }}>📭 No posts from your connections yet.</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                  Connect with people to see their posts here!
                </p>
                <button onClick={() => navigate('/connect')} className="btn btn-primary">
                  🔗 Find People to Connect
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '18px', marginBottom: '20px' }}>✏️ You haven't created any posts yet.</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                  Share your thoughts and interests with your connections!
                </p>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                  + Create Your First Post
                </button>
              </>
            )}
          </div>
        ) : (
          displayPosts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              isMyPost={activeTab === 'my'} 
            />
          ))
        )}
      </div>
    </>
  );
};

export default MyPosts;