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
  
  if (request.action === 'translate') {
    handleApiCall(`${API_URL}/ai/translate`, { text: request.text, targetLang: request.targetLang })
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (request.action === 'triggerPanic') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "triggerPanicMode" });
      }
    });
    return false;
  }

  if (request.action === 'saveSession') {
    handleApiCall(`${API_URL}/progress/session`, request.session)
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
    console.log(`Focus-Flow: Calling ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error(`Focus-Flow: ${url} returned ${response.status}`);
      throw new Error(`API returned ${response.status} (${url})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Focus-Flow: API Call Error:", error);
    throw error;
  }
}
