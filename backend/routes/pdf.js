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
    
    // Process chunks sequentially or in parallel depending on rate limits
    // For safety with rate limits, sequential is often better:
    const aiResponses = [];
    for (const chunk of chunks) {
      // Get notes for each chunk
      const result = await aiService.generateNotes(chunk);
      aiResponses.push(result);
    }
    
    const mergedResult = mergeAIResponses(aiResponses);
    
    res.json(mergedResult);
  } catch (error) {
    console.error("Large PDF Processing Error:", error);
    res.status(500).json({ error: 'Failed to process large PDF' });
  }
});

module.exports = router;
