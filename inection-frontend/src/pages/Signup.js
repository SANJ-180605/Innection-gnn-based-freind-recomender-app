import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    ageGroup: '16-25',
    location: '',
    interests: [],
    hobbies: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = ['Gaming', 'Music', 'Reading', 'Fitness', 'Cooking', 'Travel', 'Business', 'Art'];
  const hobbyOptions = ['Drawing', 'Coding', 'Photography', 'Writing'];

  const toggleInterest = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const toggleHobby = (hobby) => {
    if (formData.hobbies.includes(hobby)) {
      setFormData({ ...formData, hobbies: formData.hobbies.filter(h => h !== hobby) });
    } else {
      setFormData({ ...formData, hobbies: [...formData.hobbies, hobby] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // After successful registration, navigate to login
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '500px' }}>
        <h2 className="auth-title">Join Inection 🚀</h2>
        <p className="auth-subtitle">Create your account and find your tribe</p>
        
        {error && (
          <div style={{ 
            background: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '15px',
            color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="input" required />
            <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="input" required />
          </div>
          
          <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" required />
          <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" required />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" required />
          <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="input" required />
          <input type="text" placeholder="Location (City)" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" required />
          
          <select value={formData.ageGroup} onChange={(e) => setFormData({...formData, ageGroup: e.target.value})} className="input">
            <option>10-16</option><option>16-25</option><option>25-38</option><option>38+</option>
          </select>
          
          <div>
            <label>Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #4a5568',
                    background: formData.interests.includes(interest) ? '#7c5cfc' : '#2d3748',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label>Hobbies</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {hobbyOptions.map(hobby => (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => toggleHobby(hobby)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #4a5568',
                    background: formData.hobbies.includes(hobby) ? '#7c5cfc' : '#2d3748',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {hobby}
                </button>
              ))}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;