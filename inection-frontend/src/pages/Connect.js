import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Connect = () => {
  const [activeTab, setActiveTab] = useState('16-25');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch users based on age tab
  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/search?ageGroup=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter out current user
        const filteredUsers = data.users.filter(u => u._id !== currentUser?._id && u.email !== currentUser?.email);
        setPeople(filteredUsers);
        
        // Check connection status for each user
        checkConnectionStatus(filteredUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback to mock data
      setPeople(getMockData(activeTab));
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async (users) => {
    const status = {};
    const token = localStorage.getItem('token');
    
    for (const user of users) {
      try {
        const response = await fetch(`http://localhost:5000/api/connections/status/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        status[user._id] = data.isConnected;
      } catch (err) {
        console.error('Error checking connection status:', err);
        status[user._id] = false;
      }
    }
    setConnectionStatus(status);
  };

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/connections/request/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update connection status
        setConnectionStatus(prev => ({
          ...prev,
          [userId]: true
        }));
        
        // Show success message
        alert('Connected successfully! 🎉');
        
        // Refresh user list to update suggestions
        fetchUsers();
      } else {
        alert(data.message || 'Failed to connect');
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert('Failed to connect. Please try again.');
    }
  };

  const handleRemoveConnection = async (userId) => {
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
        setConnectionStatus(prev => ({
          ...prev,
          [userId]: false
        }));
        alert('Connection removed');
        fetchUsers();
      } else {
        alert(data.message || 'Failed to remove connection');
      }
    } catch (err) {
      console.error('Remove connection error:', err);
      alert('Failed to remove connection');
    }
  };

  const getMockData = (tab) => {
    const mockPeople = {
      '16-25': [
        { _id: '1', name: 'Rohan V.', age: 21, emoji: '😎', interests: ['Gaming', 'Coding'], location: 'Bengaluru' },
        { _id: '2', name: 'Priya S.', age: 22, emoji: '📚', interests: ['Reading', 'Music'], location: 'Pune' }
      ],
      '10-16': [{ _id: '3', name: 'Aarav S.', age: 14, emoji: '🎮', interests: ['Gaming'], location: 'Bengaluru' }],
      '25-38': [{ _id: '4', name: 'Dev K.', age: 30, emoji: '💼', interests: ['Business', 'Coding'], location: 'Bengaluru' }],
      '38+': [{ _id: '5', name: 'Suresh B.', age: 45, emoji: '🙏', interests: ['Devotional'], location: 'Bengaluru' }]
    };
    return mockPeople[tab] || mockPeople['16-25'];
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading people...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Connect with People</h1>
        <p>Find and connect with people who share your interests</p>
        
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
          {['10-16', '16-25', '25-38', '38+'].map(age => (
            <button 
              key={age} 
              onClick={() => setActiveTab(age)} 
              className={activeTab === age ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Age {age}
            </button>
          ))}
        </div>
        
        <div className="grid">
          {people.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', gridColumn: '1/-1' }}>
              <p>No users found in this age group. Check back later!</p>
            </div>
          ) : (
            people.map(person => (
              <div key={person._id} className="card">
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
                    {person.emoji || '👤'}
                  </div>
                  <div>
                    <h3>{person.firstName} {person.lastName}</h3>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>{person.age || person.ageGroup} years • {person.location}</p>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  {person.interests?.map(i => (
                    <span key={i} className="tag">{i}</span>
                  ))}
                </div>
                
                {connectionStatus[person._id] ? (
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => handleRemoveConnection(person._id)}
                  >
                    ✓ Connected • Remove
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => handleConnect(person._id)}
                  >
                    Connect
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Connect;