import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      
      {/* Logo */}
      <Link to="/home" className="navbar-brand">Inection</Link>

      {/* Links */}
      <div className="nav-links">
        <Link to="/home">🏠 Home</Link>
        <Link to="/connect">🔗 Connect</Link>
        <Link to="/myposts">📝 My Posts</Link> {/* ✅ FIXED */}
        <Link to="/profile">👤 Profile</Link>
        <Link to="/mynetworks">👥 Networks</Link>
        <Link to="/communication">💬 Messages</Link>

        <button onClick={handleLogout} className="btn btn-secondary">
          🚪 Logout
        </button>
      </div>

      {/* User */}
      <div className="user-info">
        Welcome, {user?.firstName || 'User'}!
      </div>

    </nav>
  );
};

export default Navbar;