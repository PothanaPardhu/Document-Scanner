/**
 * Utility to safely split text and handle token limits for AI processing.
 */

const MAX_CHUNK_LENGTH = 15000; // rough character limit to stay within token limits

function splitTextIntoChunks(text, maxLength = MAX_CHUNK_LENGTH) {
  if (!text) return [];
  
  const chunks = [];
  let currentChunk = '';
  
  // Split by paragraphs to avoid breaking sentences
  const paragraphs = text.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph + '\n\n';
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Fallback if a single paragraph is too large
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength));
    }
  }
  
  return chunks;
}

/**
 * Merges multiple AI JSON responses into a single combined response.
 */
function mergeAIResponses(responses) {
  const merged = {
    summary: '',
    key_points: [],
    tasks: [],
    quiz: []
  };

  responses.forEach(res => {
    if (res.summary) merged.summary += res.summary + ' ';
    if (res.key_points && Array.isArray(res.key_points)) {
      merged.key_points.push(...res.key_points);
    }
    if (res.tasks && Array.isArray(res.tasks)) {
      merged.tasks.push(...res.tasks);
    }
    if (res.quiz && Array.isArray(res.quiz)) {
      merged.quiz.push(...res.quiz);
    }
  });

  return merged;
}

module.exports = {
  splitTextIntoChunks,
  mergeAIResponses
};
