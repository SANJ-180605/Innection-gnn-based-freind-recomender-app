import React, { useState } from 'react'
import Navbar from '../components/Navbar'

const Communication = () => {
  const [message, setMessage] = useState('')
  const [activeChat, setActiveChat] = useState(1)

  const [messages, setMessages] = useState({
    1: [
      { id: 1, text: 'Hey! How are you?', sender: 'other', time: '10:30 AM' },
      { id: 2, text: "I'm good! Thanks for reaching out.", sender: 'me', time: '10:32 AM' }
    ],
    2: [
      { id: 1, text: "Let's play sometime!", sender: 'other', time: '1 hour ago' }
    ]
  })

  const conversations = [
    { id: 1, name: 'Priya M.', avatar: '😄', lastMessage: 'Hey! How are you?', time: '10:30 AM', status: 'online' },
    { id: 2, name: 'Rohan V.', avatar: '😎', lastMessage: "Let's play sometime!", time: '1 hour ago', status: 'offline' }
  ]

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages[activeChat].length + 1,
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages({
      ...messages,
      [activeChat]: [...messages[activeChat], newMessage]
    })

    setMessage('')
  }

  const currentChat = conversations.find(c => c.id === activeChat)
  const currentMessages = messages[activeChat] || []

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="messages-container">

          {/* LEFT SIDE - CONVERSATIONS */}
          <div className="conversations-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`conversation-item ${activeChat === conv.id ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {conv.avatar}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div><strong>{conv.name}</strong></div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {conv.lastMessage}
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', opacity: 0.5 }}>
                    {conv.time}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - CHAT */}
          <div className="chat-window">

            <div className="chat-header">
              <h3>{currentChat?.name}</h3>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                {currentChat?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>

            <div className="chat-messages">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    <div>{msg.text}</div>
                    <div style={{
                      fontSize: '10px',
                      marginTop: '5px',
                      opacity: 0.7
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="btn btn-primary">
                Send
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Communication