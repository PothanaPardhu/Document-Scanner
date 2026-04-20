document.addEventListener('DOMContentLoaded', () => {
  const difficultySelect = document.getElementById('difficulty');
  const demoModeToggle = document.getElementById('demo-mode-toggle');
  const btnLogin = document.getElementById('btn-login');
  const btnGesture = document.getElementById('btn-gesture');
  const gestureStatus = document.getElementById('gesture-status');
  
  // Load saved settings
  chrome.storage.sync.get(['difficulty', 'demoMode'], (result) => {
    if (result.difficulty) {
      difficultySelect.value = result.difficulty;
    }
    if (result.demoMode !== undefined) {
      demoModeToggle.checked = result.demoMode;
    }
  });

  // Save settings on change
  difficultySelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ difficulty: e.target.value });
  });

  demoModeToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ demoMode: e.target.checked });
    // Notify content script about demo mode change
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDemoMode", isDemo: e.target.checked });
      }
    });
  });

  btnLogin.addEventListener('click', () => {
    // Implement Firebase login flow here
    btnLogin.innerText = 'Logged In';
  });

  // Simplify Gesture to open a dedicated Background Tab (Gesture Hub)
  // This solves the "Camera Access Denied" issue in Manifest V3 popups.
  btnGesture.addEventListener('click', () => {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('gesture.html'),
      active: true // Open and focus the tab so they can click 'Allow'
    });
    window.close(); // Close the popup
  });
});
