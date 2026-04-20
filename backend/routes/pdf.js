const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { splitTextIntoChunks, mergeAIResponses } = require('../utils/chunkProcessor');
const aiService = require('../services/aiService');

// Use memory storage for quick processing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/extract', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text;
    
    res.json({ text, pages: data.numpages });
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

router.post('/process-large', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const data = await pdfParse(req.file.buffer);
    const chunks = splitTextIntoChunks(data.text);
    
    // Speed Optimization: Process chunks in parallel using Promise.all
    // We batch them to avoid hitting rate limits instantly
    const aiResponses = [];
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(chunk => aiService.generateNotes(chunk));
      
      const batchResults = await Promise.all(batchPromises);
      aiResponses.push(...batchResults);
    }
    
    const mergedResult = mergeAIResponses(aiResponses);
    
    res.json(mergedResult);
  } catch (error) {
    console.error("Large PDF Processing Error:", error);
    res.status(500).json({ error: 'Failed to process large PDF' });
  }
});

module.exports = router;
