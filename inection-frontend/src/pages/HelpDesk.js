import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HelpDesk = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormData({ name: '', email: '', message: '' })
  }
  
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Inection</div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Back to Home</button>
      </nav>
      
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Help Desk</h1>
        
        <div className="help-cards">
          <div className="card help-card"><div style={{ fontSize: '32px', marginBottom: '10px' }}>📧</div><h3>Email Support</h3><p>support@inection.app</p></div>
          <div className="card help-card"><div style={{ fontSize: '32px', marginBottom: '10px' }}>📞</div><h3>Phone Support</h3><p>+91 80 1234 5678</p></div>
          <div className="card help-card"><div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div><h3>Live Chat</h3><p>Available 24/7</p></div>
        </div>
        
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Send us a Message</h2>
          {submitted ? (
            <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              Message sent successfully! We will get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" style={{ marginBottom: '15px' }} required />
              <input type="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" style={{ marginBottom: '15px' }} required />
              <textarea placeholder="Your Message" rows="5" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="input" style={{ marginBottom: '15px' }} required></textarea>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default HelpDesk
