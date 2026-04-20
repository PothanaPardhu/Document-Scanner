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
        let contentHtml = '';
        if (action === 'simplify') {
          contentHtml = `<strong>Simplified:</strong><p>${response.summary}</p>`;
          noTaskStarted = false; // Mark as active usage
        } else if (action === 'tasks') {
          let tasksHtml = '<strong>Micro-Tasks:</strong><ul style="padding-left:20px;margin:5px 0;">';
          response.tasks.forEach(t => {
            tasksHtml += `<li><input type="checkbox"> ${t}</li>`;
          });
          tasksHtml += '</ul>';
          contentHtml = tasksHtml;
          noTaskStarted = false;
        }

        // Add the Export to PDF button
        resultArea.innerHTML = `
          ${contentHtml}
          <button class="ff-btn ff-btn-primary" id="ff-export-pdf" style="margin-top: 10px; width: 100%; background: #10b981;">📄 Export Exam PDF</button>
        `;

        document.getElementById('ff-export-pdf').addEventListener('click', () => {
          // Open a new window for lightning-fast native PDF printing
          const printWindow = window.open('', '_blank');
          
          const title = action === 'simplify' ? 'Simplified Executive Summary' : 'Actionable Micro-Tasks';
          const bodyContent = action === 'simplify' 
            ? `<div class="highlight-box">${response.summary}</div>`
            : `<ul>${response.tasks.map(t => `<li><span class="checkbox"></span>${t}</li>`).join('')}</ul>`;

          printWindow.document.write(`
            <html>
              <head>
                <title>Focus-Flow Exam Notes</title>
                <style>
                  body { font-family: 'Inter', 'Helvetica', sans-serif; margin: 0; padding: 0; color: #1f2937; background: #f9fafb; }
                  .container { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; display: grid; grid-template-columns: 250px 1fr; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
                  .sidebar { background: #4f46e5; color: white; padding: 40px 20px; }
                  .sidebar h1 { font-size: 24px; margin: 0 0 10px 0; }
                  .sidebar p { opacity: 0.8; font-size: 14px; }
                  .hero-img { width: 100%; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                  .content { padding: 50px 40px; }
                  .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 20px; font-weight: bold; }
                  .highlight-box { background: #f3f4f6; border-left: 4px solid #4f46e5; padding: 20px; font-size: 16px; line-height: 1.6; border-radius: 0 8px 8px 0; }
                  ul { list-style-type: none; padding: 0; }
                  li { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px; font-size: 16px; line-height: 1.5; }
                  .checkbox { width: 18px; height: 18px; border: 2px solid #4f46e5; border-radius: 4px; display: inline-block; flex-shrink: 0; margin-top: 2px; }
                  @media print {
                    body { background: white; }
                    .container { box-shadow: none; max-width: 100%; grid-template-columns: 200px 1fr; }
                    .sidebar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .highlight-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="sidebar">
                    <h1>Focus-Flow<br>Study Notes</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    <p style="margin-top: 40px; font-style: italic;">"Minimize the start gap. Maximize your focus."</p>
                  </div>
                  <div class="content">
                    <img class="hero-img" src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80" alt="Study Image" crossorigin="anonymous">
                    <div class="section-title">${title}</div>
                    ${bodyContent}
                    <div style="margin-top: 50px;" class="section-title">Original Context Length</div>
                    <p style="color: #6b7280; font-size: 14px;">${currentSelection.length} characters successfully compressed.</p>
                  </div>
                </div>
                <script>
                  // Wait a split second for the image to load before triggering print
                  setTimeout(() => {
                    window.print();
                  }, 500);
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        });

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
