import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    age: '',
    ageGroup: '',
    interests: [],
    hobbies: []
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get user from localStorage first (from login)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setEditForm({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          bio: parsedUser.bio || '',
          location: parsedUser.location || '',
          age: parsedUser.age || '',
          ageGroup: parsedUser.ageGroup || '16-25',
          interests: parsedUser.interests || [],
          hobbies: parsedUser.hobbies || []
        });
        setLoading(false);
      }

      // Also fetch fresh data from backend
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setEditForm({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            bio: data.user.bio || '',
            location: data.user.location || '',
            age: data.user.age || '',
            ageGroup: data.user.ageGroup || '16-25',
            interests: data.user.interests || [],
            hobbies: data.user.hobbies || []
          });
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userId = user?._id || user?.id;

      const response = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          bio: editForm.bio,
          location: editForm.location,
          age: parseInt(editForm.age),
          ageGroup: editForm.ageGroup,
          interests: editForm.interests,
          hobbies: editForm.hobbies
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (editForm.interests.includes(interest)) {
      setEditForm({
        ...editForm,
        interests: editForm.interests.filter(i => i !== interest)
      });
    } else {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, interest]
      });
    }
  };

  const toggleHobby = (hobby) => {
    if (editForm.hobbies.includes(hobby)) {
      setEditForm({
        ...editForm,
        hobbies: editForm.hobbies.filter(h => h !== hobby)
      });
    } else {
      setEditForm({
        ...editForm,
        hobbies: [...editForm.hobbies, hobby]
      });
    }
  };

  const interestOptions = ['Gaming', 'Music', 'Reading', 'Fitness', 'Cooking', 'Travel', 'Business', 'Art', 'E-Sports', 'Coding'];
  const hobbyOptions = ['Drawing', 'Coding', 'Photography', 'Writing', 'Gaming', 'Reading'];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#ff6b6b' }}>{error}</p>
          <button onClick={() => fetchUserProfile()} className="btn btn-primary">Try Again</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          {!isEditing ? (
            // View Mode
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn btn-secondary"
                >
                  ✏️ Edit Profile
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '48px' 
                }}>
                  {user?.profilePicture || '👤'}
                </div>
                <div>
                  <h1>{user?.firstName} {user?.lastName}</h1>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.location || 'Location not set'}</p>
                  {user?.bio && <p style={{ marginTop: '10px', fontStyle: 'italic' }}>"{user.bio}"</p>}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.connections?.length || 0}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Connections</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.posts?.length || 0}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Posts</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user?.interests?.length || 0}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Interests</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>📋 Personal Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div><strong>Age:</strong> {user?.age || 'Not set'}</div>
                  <div><strong>Age Group:</strong> {user?.ageGroup || 'Not set'}</div>
                  <div><strong>Location:</strong> {user?.location || 'Not set'}</div>
                  <div><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</div>
                </div>
              </div>
              
              <div>
                <h3>🎯 Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {user?.interests?.length > 0 ? (
                    user.interests.map(i => (
                      <span key={i} className="tag" style={{ background: '#667eea', padding: '5px 12px' }}>{i}</span>
                    ))
                  ) : (
                    <p>No interests added yet</p>
                  )}
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h3>🎨 Hobbies</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {user?.hobbies?.length > 0 ? (
                    user.hobbies.map(h => (
                      <span key={h} className="tag" style={{ background: '#764ba2', padding: '5px 12px' }}>{h}</span>
                    ))
                  ) : (
                    <p>No hobbies added yet</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Edit Mode
            <>
              <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
              {error && <div style={{ color: '#ff6b6b', marginBottom: '15px' }}>{error}</div>}
              
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Bio (tell us about yourself)"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="input"
                  rows="3"
                  style={{ marginBottom: '15px' }}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="number"
                    placeholder="Age"
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    className="input"
                  />
                  <select
                    value={editForm.ageGroup}
                    onChange={(e) => setEditForm({...editForm, ageGroup: e.target.value})}
                    className="input"
                  >
                    <option value="10-16">10-16 years</option>
                    <option value="16-25">16-25 years</option>
                    <option value="25-38">25-38 years</option>
                    <option value="38+">38+ years</option>
                  </select>
                </div>
                
                <input
                  type="text"
                  placeholder="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="input"
                  style={{ marginBottom: '15px' }}
                />
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Interests</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid #4a5568',
                          background: editForm.interests.includes(interest) ? '#667eea' : '#2d3748',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Hobbies</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {hobbyOptions.map(hobby => (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleHobby(hobby)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid #4a5568',
                          background: editForm.hobbies.includes(hobby) ? '#764ba2' : '#2d3748',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {hobby}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;