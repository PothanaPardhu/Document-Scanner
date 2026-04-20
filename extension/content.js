let fabContainer = null;
let currentSelection = '';
let isDemoMode = false;

// Smart Nudge Tracking
let inactiveTime = 0;
let lastActivityTime = Date.now();
let nudgeInterval = null;
let noTaskStarted = true;

function resetActivity() {
  lastActivityTime = Date.now();
  inactiveTime = 0;
  hideNudge();
}

window.addEventListener('mousemove', resetActivity);
window.addEventListener('keydown', resetActivity);
window.addEventListener('scroll', resetActivity);
window.addEventListener('click', resetActivity);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // User switched tabs - accelerate nudge in demo mode
    if (isDemoMode && noTaskStarted) {
      setTimeout(showNudge, 1000);
    }
  } else {
    resetActivity();
  }
});

function startNudgeTimer() {
  if (nudgeInterval) clearInterval(nudgeInterval);
  nudgeInterval = setInterval(() => {
    const threshold = isDemoMode ? 10000 : 60000; // 10s for demo, 60s for normal
    if (Date.now() - lastActivityTime > threshold && noTaskStarted) {
      showNudge();
    }
  }, 1000);
}

function showNudge() {
  if (document.getElementById('ff-nudge-overlay')) return;
  
  const nudge = document.createElement('div');
  nudge.id = 'ff-nudge-overlay';
  nudge.innerHTML = `
    <div>You’re 70% done. Just 2 minutes left!</div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="ff-btn ff-btn-primary" id="ff-nudge-yes">Let's finish it</button>
      <button class="ff-btn ff-btn-secondary" id="ff-nudge-no">Later</button>
    </div>
  `;
  document.body.appendChild(nudge);
  
  document.getElementById('ff-nudge-yes').addEventListener('click', () => {
    hideNudge();
    noTaskStarted = false; // They started
  });
  document.getElementById('ff-nudge-no').addEventListener('click', () => {
    hideNudge();
    resetActivity();
  });
}

function hideNudge() {
  const nudge = document.getElementById('ff-nudge-overlay');
  if (nudge) nudge.remove();
}

startNudgeTimer();

// Listen for messages from popup (Demo Mode, Panic/Gesture Mode)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDemoMode") {
    isDemoMode = request.isDemo;
    console.log("Focus-Flow Demo Mode:", isDemoMode);
  } else if (request.action === "triggerGestureCleanup") {
    enableSmartReadingMode();
  }
});

// Text Selection Handling
document.addEventListener('mouseup', (e) => {
  // Don't trigger if clicking inside the FAB
  if (fabContainer && fabContainer.contains(e.target)) return;
  
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 20) {
      currentSelection = text;
      showFAB(e.pageX, e.pageY);
      
      if (isDemoMode) {
        // Auto-suggest highlight in demo mode
        setTimeout(() => {
          if (fabContainer && !document.getElementById('ff-demo-suggest')) {
            const hint = document.createElement('div');
            hint.id = 'ff-demo-suggest';
            hint.style.color = '#4f46e5';
            hint.style.fontSize = '12px';
            hint.style.marginBottom = '4px';
            hint.innerText = '💡 This looks important. Simplify it?';
            fabContainer.insertBefore(hint, fabContainer.firstChild);
          }
        }, 500);
      }
    } else {
      hideFAB();
    }
  }, 10);
});

function showFAB(x, y) {
  hideFAB();
  
  fabContainer = document.createElement('div');
  fabContainer.id = 'focus-flow-fab-container';
  
  // Position near cursor
  fabContainer.style.left = `${x}px`;
  fabContainer.style.top = `${y + 20}px`;
  
  fabContainer.innerHTML = `
    <div style="display:flex;gap:8px;">
      <button class="ff-btn ff-btn-primary" id="ff-simplify-btn">✨ Simplify</button>
      <button class="ff-btn ff-btn-secondary" id="ff-tasks-btn">📋 Micro-Tasks</button>
    </div>
    <div class="ff-loading" id="ff-loading">Simplifying locally...</div>
    <div id="ff-result-area" style="display:none;"></div>
  `;
  
  document.body.appendChild(fabContainer);
  
  document.getElementById('ff-simplify-btn').addEventListener('click', () => handleAction('simplify'));
  document.getElementById('ff-tasks-btn').addEventListener('click', () => handleAction('tasks'));
}

function hideFAB() {
  if (fabContainer) {
    fabContainer.remove();
    fabContainer = null;
  }
}

function handleAction(action) {
  const loading = document.getElementById('ff-loading');
  const resultArea = document.getElementById('ff-result-area');
  
  loading.style.display = 'block';
  loading.innerText = action === 'simplify' ? 'Simplifying locally...' : 'Generating micro-tasks...';
  resultArea.style.display = 'none';
  
  // Get difficulty from storage
  chrome.storage.sync.get(['difficulty'], (result) => {
    const level = result.difficulty || 'Medium';
    
    chrome.runtime.sendMessage({
      action: action,
      text: currentSelection,
      level: level
    }, (response) => {
      loading.style.display = 'none';
      resultArea.style.display = 'block';
      
      if (response && response.error) {
        resultArea.innerHTML = `<span style="color:red">Error: ${response.error}</span>`;
      } else if (response) {
        if (action === 'simplify') {
          resultArea.innerHTML = `<strong>Simplified:</strong><p>${response.summary}</p>`;
          noTaskStarted = false; // Mark as active usage
        } else if (action === 'tasks') {
          let tasksHtml = '<strong>Micro-Tasks:</strong><ul style="padding-left:20px;margin:5px 0;">';
          response.tasks.forEach(t => {
            tasksHtml += `<li><input type="checkbox"> ${t}</li>`;
          });
          tasksHtml += '</ul>';
          resultArea.innerHTML = tasksHtml;
          noTaskStarted = false;
        }
      } else {
        resultArea.innerHTML = `<span style="color:red">No response from AI</span>`;
      }
    });
  });
}

function enableSmartReadingMode() {
  // Very basic reading mode implementation
  document.querySelectorAll('header, footer, nav, aside, iframe, .ad, .sidebar').forEach(el => {
    el.classList.add('ff-hidden');
  });
  
  const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
  mainContent.classList.add('ff-reading-mode');
}
