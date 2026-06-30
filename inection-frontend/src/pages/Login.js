import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || 'logged_in');
        navigate('/home');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    box: {
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      fontSize: '28px',
      marginBottom: '10px',
      textAlign: 'center',
      color: '#fff'
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: '30px',
      color: 'rgba(255,255,255,0.8)'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      fontSize: '16px'
    },
    button: {
      padding: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer'
    },
    errorMessage: {
      background: 'rgba(255,0,0,0.2)',
      border: '1px solid rgba(255,0,0,0.5)',
      borderRadius: '8px',
      padding: '10px',
      marginBottom: '15px',
      color: '#ff6b6b',
      textAlign: 'center'
    },
    link: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#667eea'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Welcome back 👋</h2>
        <p style={styles.subtitle}>Sign in to your Inection account</p>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={styles.input} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.input} 
            required 
          />
          <button 
            type="submit" 
            style={styles.button} 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.link}>
          New user? <Link to="/signup" style={{ color: '#667eea' }}>Register →</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;