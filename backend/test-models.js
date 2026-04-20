require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  try {
    console.log("Testing API Key:", process.env.GEMINI_API_KEY ? "Key exists" : "Missing");
    
    // Test fetch directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }
    
    const models = data.models.map(m => m.name.replace('models/', ''));
    console.log("AVAILABLE MODELS:");
    console.log(models.filter(m => m.includes('gemini')).join('\n'));
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testModels();
