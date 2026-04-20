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

// Using gemini-2.5-flash as requested for the user's specific tier
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
async function callGemini(systemPrompt, userText, level = "Medium") {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: { responseMimeType: "application/json" }
    });

    const fullPrompt = `
      ${systemPrompt}
      Difficulty Level: ${level}
      
      Input Text:
      "${userText}"
      
      Return the response in this exact JSON format:
      {
        "summary": "string",
        "key_points": ["string"],
        "tasks": ["string"],
        "quiz": ["string"]
      }
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return validateAIResponse(response.text());
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to error message in summary
    return {
      summary: "⚠️ AI service is temporarily unavailable. Please check your internet connection.",
      key_points: [],
      tasks: [],
      quiz: []
    };
  }
}

async function translateText(text, targetLang = "Hindi") {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Translate the following text into ${targetLang}. Only return the translated text without any explanations or markdown: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { translatedText: response.text().trim() };
  } catch (error) {
    console.error("Translation Error:", error);
    return { error: "Translation failed" };
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

async function explainExample(text) {
  return callGemini(
    "Provide a simple, real-life analogy or practical example to explain this specific concept to a beginner. Put the example in the 'summary' field.",
    text,
    "Easy"
  );
}

module.exports = {
  simplifyText,
  generateTasks,
  generateNotes,
  generateQuiz,
  explainExample,
  translateText,
  callGemini
};
