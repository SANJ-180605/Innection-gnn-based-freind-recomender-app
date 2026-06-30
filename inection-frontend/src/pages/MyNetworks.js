import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MyNetworks = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnections(data.connections);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
      // Mock data for testing
      setConnections([
        { _id: '1', firstName: 'Priya', lastName: 'M.', interests: ['Music', 'Fitness'], location: 'Bangalore' },
        { _id: '2', firstName: 'Rohan', lastName: 'V.', interests: ['Gaming', 'E-Sports'], location: 'Mysore' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/connections/remove/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnections(connections.filter(c => c._id !== userId));
        alert('Connection removed');
      } else {
        alert(data.message || 'Failed to remove connection');
      }
    } catch (err) {
      console.error('Remove error:', err);
      alert('Failed to remove connection');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading your connections...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>My Networks</h1>
        <div className="card">
          <h2>Your Connections ({connections.length})</h2>
          {connections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>You haven't connected with anyone yet.</p>
              <button onClick={() => navigate('/connect')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Find People to Connect With
              </button>
            </div>
          ) : (
            connections.map(conn => (
              <div key={conn._id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                padding: '15px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '10px', 
                marginBottom: '10px' 
              }}>
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
                  {conn.profilePicture || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div><strong>{conn.firstName} {conn.lastName}</strong></div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {conn.interests?.slice(0, 3).join(' · ') || 'No interests'} • {conn.location}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => navigate('/communication')} 
                    className="btn btn-primary" 
                    style={{ padding: '5px 15px' }}
                  >
                    Message
                  </button>
                  <button 
                    onClick={() => handleRemoveConnection(conn._id)} 
                    className="btn btn-secondary" 
                    style={{ padding: '5px 15px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default MyNetworks;