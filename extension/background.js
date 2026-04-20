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
  
  if (request.action === 'example') {
    handleApiCall(`${API_URL}/ai/example`, { text: request.text })
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  
  if (request.action === 'quiz') {
    handleApiCall(`${API_URL}/ai/quiz`, { text: request.text })
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  // GESTURE HUB BRIDGE:
  // When the Gesture Hub tab detects a swipe, it sends this message.
  // We then broadcast it to the ACTIVE tab so the website sweeps clean.
  if (request.action === 'swipeDetected') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "triggerGestureCleanup" });
      }
    });
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
