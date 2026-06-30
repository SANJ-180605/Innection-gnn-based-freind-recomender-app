import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function Home() {

  const navigate = useNavigate();
const [posts, setPosts] = useState([]); 
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Graph data
  const graphData = [
    { name: 'Mon', connections: 2 },
    { name: 'Tue', connections: 5 },
    { name: 'Wed', connections: 3 },
    { name: 'Thu', connections: 6 },
    { name: 'Fri', connections: 4 },
    { name: 'Sat', connections: 7 },
    { name: 'Sun', connections: 5 },
  ];
// In Home.js, update the fetch suggestions part
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
  
  // Fetch users for suggestions (people not connected yet)
  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.users) {
        // Filter out current user and get users not connected
        const filtered = data.users.filter(u => u.email !== user?.email);
        setSuggestions(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
    setLoading(false);
  };
  
  fetchSuggestions();
}, []);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let parsedUser = null;

    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    fetch('http://localhost:5000/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          const filtered = data.users.filter(u => u.email !== parsedUser?.email);
          setSuggestions(filtered.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="container">

        {/* Welcome */}
        <div className="card welcome-card">
          <h2>Hi, {user?.firstName || 'User'} 👋</h2>
          <p>We are exploring new people to connect with you.</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
    
<button 
  onClick={() => navigate('/addpost')} 
  className="btn btn-primary"
>
  ✏️ Create New Post
</button>

          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/myposts')}
          >
            📂 My Posts
          </button>
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

          {/* LEFT */}
          <div>
  <h3>My Posts</h3>

  {posts.length === 0 ? (
    <p>No posts yet</p>
  ) : (
    posts.map((post, index) => (
      <div key={index} className="post">
        
        <div className="post-header">
          <div className="post-avatar">👤</div>
          <div>
            <div className="post-author">{post.author}</div>
            <div className="post-time">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="post-content">
          <h4>{post.title}</h4>
          <p>{post.description}</p>
        </div>

        <div className="post-actions">
          <button className="post-action">👍 Like</button>
          <button className="post-action">💬 Comment</button>
        </div>

      </div>
    ))
  )}

              <div className="post-content">
                Start connecting with people who share your interests.
              </div>

              <div className="post-actions">
                <button className="post-action">👍 Like</button>
                <button className="post-action">💬 Comment</button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Graph */}
            <div className="card">
              <h3>Your Connections</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={graphData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="connections" stroke="#4CAF50" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Suggestions */}
            <div className="suggestions-card">
              <h3>Suggested for You</h3>

              {suggestions.length === 0 ? (
                <p>No suggestions yet</p>
              ) : (
                suggestions.map((s, idx) => (
                  <div key={idx} className="suggestion-item">
                    <div className="suggestion-avatar">👤</div>

                    <div style={{ flex: 1 }}>
                      <div><strong>{s.firstName} {s.lastName}</strong></div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {s.interests?.join(', ') || 'No interests'} · {s.location}
                      </div>
                    </div>

                    <button className="btn btn-primary">Connect</button>
                  </div>
                ))
              )}

            </div>

          </div>
        </div>
    </>
  );
}

export default Home;