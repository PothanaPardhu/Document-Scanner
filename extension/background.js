const API_URL = 'http://localhost:5000/api';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'simplify') {
    handleApiCall(`${API_URL}/ai/simplify`, { text: request.text, level: request.level })
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // Indicates async response
  }
  
  if (request.action === 'tasks') {
    handleApiCall(`${API_URL}/ai/tasks`, { text: request.text })
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleApiCall(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}
