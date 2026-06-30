import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import all pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Connect from './pages/Connect';
import Profile from './pages/Profile';
import MyNetworks from './pages/MyNetworks';
import Communication from './pages/Communication';
import HelpDesk from './pages/HelpDesk';
import MyPosts from './pages/MyPosts';
 import AddPost from './pages/AddPost';

// Protected Route Component - Only accessible when logged in
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Login Required */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/helpdesk" element={<HelpDesk />} />
        
        {/* Protected Routes - Login Required */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/connect" element={<ProtectedRoute><Connect /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mynetworks" element={<ProtectedRoute><MyNetworks /></ProtectedRoute>} />
        <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
        <Route path="/myposts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
       

// Inside Routes
<Route path="/addpost" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home if logged in, else to welcome */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;