const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { verifyToken } = require('./auth');

// Optional: you can add verifyToken middleware here if you want these to be authenticated.
// For demo purposes, we might keep them open or use a simpler check, but verifyToken is recommended for production.
// router.use(verifyToken);

router.post('/simplify', async (req, res) => {
  try {
    const { text, level } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.simplifyText(text, level || 'Medium');
    res.json(result);
  } catch (error) {
    console.error('Simplify endpoint error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.generateTasks(text);
    res.json(result);
  } catch (error) {
    console.error('Tasks endpoint error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.generateNotes(text);
    res.json(result);
  } catch (error) {
    console.error('Notes endpoint error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/quiz', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.generateQuiz(text);
    res.json(result);
  } catch (error) {
    console.error('Quiz endpoint error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/example', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.explainExample(text);
    res.json(result);
  } catch (error) {
    console.error('Example endpoint error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const result = await aiService.translateText(text, targetLang || 'hi');
    res.json(result);
  } catch (error) {
    console.error('Translate endpoint error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
