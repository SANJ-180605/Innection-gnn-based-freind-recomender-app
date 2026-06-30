// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inection');
    console.log('✅ MongoDB connected successfully');
    console.log('📁 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// ============= USER SCHEMA =============
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  ageGroup: { type: String, enum: ['10-16', '16-25', '25-38', '38+'], required: true },
  location: { type: String, required: true },
  interests: [String],
  hobbies: [String],
  bio: { type: String, maxlength: 500, default: '' },
  profilePicture: { type: String, default: '' },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ============= POST SCHEMA =============
const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  interestTag: { type: String },
  imageUrl: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// ============= TEST & HEALTH ROUTES =============

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// ============= AUTH ROUTES =============

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      age, 
      ageGroup, 
      location, 
      interests, 
      hobbies 
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !age || !ageGroup || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email or phone number' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      age,
      ageGroup,
      location,
      interests: interests || [],
      hobbies: hobbies || []
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup,
        location: user.location,
        interests: user.interests,
        hobbies: user.hobbies
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    user.lastActive = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup,
        location: user.location,
        interests: user.interests,
        hobbies: user.hobbies,
        bio: user.bio,
        connections: user.connections
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// Get all users
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user by ID
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user profile (from token)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search users by name, interest, location, or ageGroup
app.get('/api/auth/search', async (req, res) => {
  try {
    const { q, interest, location, ageGroup } = req.query;
    let query = {};
    
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (interest) {
      query.interests = interest;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (ageGroup) {
      query.ageGroup = ageGroup;
    }
    
    const users = await User.find(query).select('-password').limit(50);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
app.put('/api/auth/user/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;
    delete updates.phone;
    delete updates._id;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
app.delete('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= CONNECTION ROUTES =============

// Send connection request (Add to connections)
app.post('/api/connections/request/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const currentUserId = decoded.id;
    const targetUserId = req.params.userId;
    
    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }
    
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Already connected' });
    }
    
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { connections: targetUserId }
    });
    
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { connections: currentUserId }
    });
    
    res.json({ 
      success: true, 
      message: 'Connected successfully!' 
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove connection
app.delete('/api/connections/remove/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const currentUserId = decoded.id;
    const targetUserId = req.params.userId;
    
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { connections: targetUserId }
    });
    
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { connections: currentUserId }
    });
    
    res.json({ 
      success: true, 
      message: 'Connection removed successfully' 
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's connections
app.get('/api/connections', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const user = await User.findById(userId).populate('connections', '-password');
    
    res.json({ 
      success: true, 
      connections: user.connections || []
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get connection status with a user
app.get('/api/connections/status/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const currentUserId = decoded.id;
    const targetUserId = req.params.userId;
    
    const currentUser = await User.findById(currentUserId);
    const isConnected = currentUser?.connections?.includes(targetUserId) || false;
    
    res.json({ 
      success: true, 
      isConnected 
    });
  } catch (error) {
    console.error('Connection status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= POST ROUTES =============

// Create a post
app.post('/api/posts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const { title, content, interestTag, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    const post = new Post({
      author: userId,
      title,
      content,
      interestTag,
      imageUrl
    });
    
    await post.save();
    
    // Add post to user's posts array
    await User.findByIdAndUpdate(userId, {
      $push: { posts: post._id }
    });
    
    // Populate author details
    const populatedPost = await Post.findById(post._id).populate('author', 'firstName lastName profilePicture');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get posts from connected people (feed)
app.get('/api/posts/feed', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const user = await User.findById(userId);
    const connectedUserIds = user.connections || [];
    
    // Get posts from connected users and the current user
    const posts = await Post.find({ 
      author: { $in: [...connectedUserIds, userId] } 
    })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all posts (for testing)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's own posts
app.get('/api/posts/my', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const posts = await Post.find({ author: userId })
      .populate('author', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like a post
app.post('/api/posts/:postId/like', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to post
app.post('/api/posts/:postId/comment', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    post.comments.push({
      user: userId,
      text
    });
    
    await post.save();
    
    const updatedPost = await Post.findById(req.params.postId)
      .populate('author', 'firstName lastName profilePicture')
      .populate('comments.user', 'firstName lastName profilePicture');
    
    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete post
app.delete('/api/posts/:postId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;
    
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    if (post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.postId);
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: req.params.postId }
    });
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// ============= ERROR HANDLING MIDDLEWARE =============
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============= START SERVER =============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Get users: GET http://localhost:${PORT}/api/auth/users`);
  console.log(`🔗 Connections: POST http://localhost:${PORT}/api/connections/request/:userId`);
  console.log(`📋 My Networks: GET http://localhost:${PORT}/api/connections`);
  console.log(`📝 Create Post: POST http://localhost:${PORT}/api/posts`);
  console.log(`📰 Feed Posts: GET http://localhost:${PORT}/api/posts/feed`);
  console.log(`👤 My Posts: GET http://localhost:${PORT}/api/posts/my\n`);
});