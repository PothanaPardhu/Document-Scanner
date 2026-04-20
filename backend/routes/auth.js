const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Route to sync user login/signup
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email,
        displayName: name || ''
      });
      await user.save();
    }
    
    res.json({ message: 'User synced', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  router,
  verifyToken
};
