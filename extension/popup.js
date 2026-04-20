document.addEventListener('DOMContentLoaded', () => {
  const difficultySelect = document.getElementById('difficulty');
  const langSelect = document.getElementById('target-lang');
  const demoModeToggle = document.getElementById('demo-mode-toggle');
  const btnLogin = document.getElementById('btn-login');
  const btnGesture = document.getElementById('btn-gesture');
  const btnPanic = document.getElementById('btn-panic');
  
  // Load saved settings
  chrome.storage.sync.get(['difficulty', 'targetLang', 'demoMode', 'isLoggedIn'], (result) => {
    if (result.difficulty) difficultySelect.value = result.difficulty;
    if (result.targetLang) langSelect.value = result.targetLang;
    if (result.demoMode !== undefined) demoModeToggle.checked = result.demoMode;
    if (result.isLoggedIn) {
      btnLogin.innerText = 'Syncing Profile...';
      setTimeout(() => btnLogin.innerText = 'Logged In', 1000);
    }
  });

  // Save settings on change
  difficultySelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ difficulty: e.target.value });
  });

  langSelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ targetLang: e.target.value });
  });

  demoModeToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ demoMode: e.target.checked });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDemoMode", isDemo: e.target.checked });
      }
    });
  });

  btnLogin.addEventListener('click', () => {
    btnLogin.innerText = 'Authorizing...';
    setTimeout(() => {
      chrome.storage.sync.set({ isLoggedIn: true });
      btnLogin.innerText = 'Logged In';
    }, 1500);
  });

  btnPanic.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "triggerPanic" });
  });

  btnGesture.addEventListener('click', () => {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('gesture.html'),
      active: true
    });
    window.close();
  });
});
