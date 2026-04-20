const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Task = require('../models/Task');
const { verifyToken } = require('./auth');

// Note: For demo we might not always have a user object if auth is skipped,
// so we'll use a hardcoded 'demo-user' if req.user is missing.

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user ? req.user.uid : 'demo-user';
    
    // In a real app, we'd query the DB for actual stats
    // For presentation, we'll return a mix of real DB counts and dynamic values
    const taskCount = await Task.countDocuments({ status: 'completed' });
    const sessionCount = await Session.countDocuments({});
    
    res.json({
      tasksCompleted: taskCount + 12, // Adding base demo data
      timeActive: sessionCount * 15 + 45, 
      inactivity: 12,
      pagesSimplified: sessionCount + 28,
      timeSaved: (taskCount + sessionCount) * 5 + 30
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/session', async (req, res) => {
  try {
    const { url, title, duration } = req.body;
    const userId = req.user ? req.user.uid : 'demo-user';
    
    const session = new Session({
      userId,
      url,
      title,
      startTime: new Date(),
      duration: duration || 0
    });
    
    await session.save();
    res.json({ message: 'Session saved', session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.get('/resume', async (req, res) => {
  try {
    const userId = req.user ? req.user.uid : 'demo-user';
    const lastSession = await Session.findOne({ userId }).sort({ startTime: -1 });
    res.json(lastSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume data' });
  }
});

module.exports = router;
