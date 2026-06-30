import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  
  const interests = ['🎮 Gaming', '🎵 Music', '📚 Reading', '💪 Fitness', '🍳 Cooking', '✈️ Travel', '💼 Business', '🎨 Art'];
  
  // Inline styles for the page
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    content: {
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    },
    title: {
      fontSize: '48px',
      marginBottom: '20px',
      color: '#fff',
      fontWeight: 'bold'
    },
    subtitle: {
      fontSize: '20px',
      marginBottom: '30px',
      color: 'rgba(255,255,255,0.9)'
    },
    description: {
      fontSize: '16px',
      marginBottom: '40px',
      color: 'rgba(255,255,255,0.8)',
      lineHeight: '1.6'
    },
    interestContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '40px'
    },
    interestPill: {
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '25px',
      fontSize: '14px',
      color: '#fff'
    },
    buttonGroup: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      marginBottom: '40px'
    },
    btnPrimary: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    btnSecondary: {
      padding: '12px 24px',
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    footer: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '14px'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Inection</h1>
        <p style={styles.subtitle}>Interest-Based Connection</p>
        <p style={styles.description}>
          Building connections between similar minds based on habits, interests, and favourites.
          Discover people who think like you.
        </p>
        
        <div style={styles.interestContainer}>
          {interests.map((interest, idx) => (
            <span key={idx} style={styles.interestPill}>{interest}</span>
          ))}
        </div>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => navigate('/signup')} 
            style={styles.btnPrimary}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate('/login')} 
            style={styles.btnSecondary}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Sign In
          </button>
        </div>
        
        <div style={styles.footer}>
          <span>Help Desk</span>
          <span>Terms & Conditions</span>
          <span>Contacts</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;