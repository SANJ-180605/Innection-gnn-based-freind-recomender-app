// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  ageGroup: { type: String, enum: ['10-16', '16-25', '25-38', '38+'], required: true },
  location: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  interests: [{ type: String }],
  hobbies: [{ type: String }],
  bio: { type: String, maxLength: 500 },
  profilePicture: { type: String, default: '' },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  embedding: { type: [Number] } // For GNN
});

module.exports = mongoose.model('User', userSchema);