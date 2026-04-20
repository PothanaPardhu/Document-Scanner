const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;
try {
  // Try to read from a local file that the IDE won't automatically share with the AI
  const secretPath = path.join(__dirname, '..', 'secret.txt');
  if (fs.existsSync(secretPath)) {
    apiKey = fs.readFileSync(secretPath, 'utf8').trim();
  }
} catch (e) {
  // ignore
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-2.5-flash since their key is on the early access tier
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Validates and normalizes the JSON response from Gemini
 */
function validateAIResponse(responseStr) {
  try {
    // Strip markdown formatting if Gemini returns ```json ... ```
    let cleanStr = responseStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanStr);
    
    return {
      summary: parsed.summary || "",
      key_points: parsed.key_points || [],
      tasks: parsed.tasks || [],
      quiz: parsed.quiz || []
    };
  } catch (error) {
    console.error("AI Response Parsing Error:", error, "Raw Response:", responseStr);
    // Return safe fallback
    return {
      summary: "Could not generate summary.",
      key_points: [],
      tasks: [],
      quiz: []
    };
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Base function to call Gemini with a specific prompt and expect JSON
 */
async function callGemini(prompt, text, level = "Medium", retries = 3) {
  const fullPrompt = `
    ${prompt}
    Difficulty Level: ${level}
    
    You MUST output valid JSON only, using this exact schema:
    {
      "summary": "String, short simplified explanation",
      "key_points": ["String", "String"],
      "tasks": ["String", "String"],
      "quiz": ["String", "String"]
    }
    
    Content:
    ${text}
  `;

  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      return validateAIResponse(responseText);
    } catch (error) {
      console.error(`Gemini API Error (Attempt ${i+1}/${retries}):`, error.message);
      if (i === retries - 1) {
        throw error;
      }
      // Wait for 1.5 seconds before retrying if it's a 503 error
      await sleep(1500);
    }
  }
}

async function simplifyText(text, level) {
  return callGemini(
    "Simplify this text into easy language. Reduce cognitive load.",
    text,
    level
  );
}

async function generateTasks(text) {
  return callGemini(
    "Break this content into small, actionable 2-5 minute tasks for a student to overcome the 'start gap'.",
    text,
    "Medium"
  );
}

async function generateNotes(text) {
  return callGemini(
    "Convert this into structured study notes. Focus on summary and key_points.",
    text,
    "Medium"
  );
}

async function generateQuiz(text) {
  return callGemini(
    "Generate 3 simple questions to test understanding of the content. Put them in the 'quiz' array.",
    text,
    "Medium"
  );
}

module.exports = {
  simplifyText,
  generateTasks,
  generateNotes,
  generateQuiz,
  callGemini
};
