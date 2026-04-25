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

function checkResume() {
  const url = window.location.href;
  const title = document.title;
  
  // Save current session to backend
  chrome.runtime.sendMessage({ 
    action: 'saveSession', 
    session: { url, title } 
  });

  // Check if we should show "Welcome back" nudge
  // For demo, we just show it if they haven't started a task yet
  setTimeout(() => {
    if (noTaskStarted) {
      showResumePrompt();
    }
  }, 2000);
}

function showResumePrompt() {
  if (document.getElementById('ff-resume-prompt')) return;
  
  const prompt = document.createElement('div');
  prompt.id = 'ff-resume-prompt';
  prompt.style.cssText = 'position:fixed; bottom:20px; right:20px; background:white; padding:16px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1px solid #e2e8f0; z-index:2147483647; width:280px; animation:ff-slide-up 0.5s ease-out;';
  
  prompt.innerHTML = `
    <div style="font-weight:bold; margin-bottom:4px; color:#1f2937;">Continue learning?</div>
    <div style="font-size:12px; color:#64748b; margin-bottom:12px;">You were halfway through this page last time.</div>
    <div style="display:flex; gap:8px;">
      <button class="ff-btn ff-btn-primary" id="ff-resume-yes" style="flex:1; font-size:12px;">Resume</button>
      <button class="ff-btn ff-btn-secondary" id="ff-resume-no" style="flex:1; font-size:12px;">Dismiss</button>
    </div>
  `;
  
  document.body.appendChild(prompt);
  
  document.getElementById('ff-resume-yes').addEventListener('click', () => {
    prompt.remove();
    enableSmartReadingMode();
  });
  document.getElementById('ff-resume-no').addEventListener('click', () => {
    prompt.remove();
  });
}

startNudgeTimer();
checkResume();

// Listen for messages from popup (Demo Mode, Panic/Gesture Mode)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDemoMode") {
    isDemoMode = request.isDemo;
    console.log("Focus-Flow Demo Mode:", isDemoMode);
  } else if (request.action === "triggerGestureCleanup") {
    enableSmartReadingMode();
  } else if (request.action === "triggerPanicMode") {
    showPanicScreen();
  }
});

function showPanicScreen() {
  if (document.getElementById('ff-panic-overlay')) return;
  
  const panic = document.createElement('div');
  panic.id = 'ff-panic-overlay';
  panic.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(255,255,255,0.98); z-index:2147483647; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(10px); animation:ff-fade-in 0.8s ease-out;';
  
  panic.innerHTML = `
    <div style="text-align:center; max-width: 500px;">
      <h1 style="font-size:32px; color:#1f2937; margin-bottom:16px;">Take a deep breath.</h1>
      <p style="font-size:18px; color:#4b5563; line-height:1.6;">You're doing great. Let's clear the distractions and start small.</p>
      <div style="margin:40px 0;">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" style="animation:ff-pulse 2s infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
      </div>
      <button class="ff-btn ff-btn-primary" id="ff-panic-reset" style="padding:12px 32px; font-size:16px;">I'm Ready Now</button>
    </div>
  `;
  
  document.body.appendChild(panic);
  
  document.getElementById('ff-panic-reset').addEventListener('click', () => {
    panic.style.opacity = '0';
    setTimeout(() => {
      panic.remove();
      enableSmartReadingMode(); // Transition to focus mode after reset
    }, 500);
  });
}

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
    <div style="display:flex;gap:8px; flex-wrap: wrap;">
      <button class="ff-btn ff-btn-primary" id="ff-simplify-btn">✨ Simplify</button>
      <button class="ff-btn ff-btn-secondary" id="ff-tasks-btn">📋 Micro-Tasks</button>
      <button class="ff-btn ff-btn-secondary" id="ff-example-btn" style="background:#e0e7ff;color:#4f46e5;">💡 Example</button>
      <button class="ff-btn ff-btn-secondary" id="ff-quiz-btn" style="background:#fef3c7;color:#d97706;">🧠 Test Me</button>
      <button class="ff-btn ff-btn-secondary" id="ff-translate-btn" style="background:#f0fdf4;color:#166534;">🌐 Translate</button>
    </div>
    <div style="margin-top: 8px; font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Privacy-First AI (Encrypted)
    </div>
    <div class="ff-loading" id="ff-loading">Processing...</div>
    <div id="ff-result-area" style="display:none;"></div>
  `;
  
  document.body.appendChild(fabContainer);
  
  document.getElementById('ff-simplify-btn').addEventListener('click', () => handleAction('simplify'));
  document.getElementById('ff-tasks-btn').addEventListener('click', () => handleAction('tasks'));
  document.getElementById('ff-example-btn').addEventListener('click', () => handleAction('example'));
  document.getElementById('ff-quiz-btn').addEventListener('click', () => handleAction('quiz'));
  document.getElementById('ff-translate-btn').addEventListener('click', () => handleAction('translate'));
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
  loading.innerText = action === 'simplify' ? 'Simplifying locally...' : 'Processing...';
  resultArea.style.display = 'none';
  
  // Safety check for Chrome Extension environment
  if (!chrome || !chrome.storage || !chrome.storage.sync) {
    console.error("Focus-Flow: Chrome storage not found. Ensure the extension is loaded correctly.");
    return;
  }
  
  chrome.storage.sync.get(['difficulty', 'targetLang'], (result) => {
    const level = result.difficulty || 'Medium';
    const lang = result.targetLang || 'hi';
    
    const langNames = {
      'hi': 'Hindi',
      'te': 'Telugu',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German'
    };
    const langName = langNames[lang] || lang;
    
    chrome.runtime.sendMessage({
      action: action,
      text: currentSelection,
      level: level,
      targetLang: lang
    }, (response) => {
      console.log(`Focus-Flow: Received response for ${action}`, response);
      loading.style.display = 'none';
      resultArea.style.display = 'block';
      
      if (!response) {
        resultArea.innerHTML = `<span style="color:red">Error: No response from extension background. Try reloading the extension.</span>`;
        return;
      }

      if (response.error) {
        const errorDetail = response.details ? ` (${response.details})` : '';
        resultArea.innerHTML = `
          <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px;color:#991b1b;">
            <div style="font-weight:bold;margin-bottom:4px;">⚠️ Error</div>
            <div style="font-size:12px;line-height:1.4;">
              ${response.error}${errorDetail}
              <br/><br/>
              <strong>Troubleshooting:</strong>
              <ul style="margin:8px 0;padding-left:20px;">
                <li>Make sure the backend server is running on port 5000</li>
                <li>Check if GEMINI_API_KEY is set in your .env file</li>
                <li>Try reloading the extension</li>
                <li>Open Developer Tools (F12) to see detailed logs</li>
              </ul>
            </div>
          </div>
        `;
      } else {
        let contentHtml = '';
        let audioText = '';
        
        if (action === 'simplify') {
          contentHtml = `<strong>Simplified:</strong><p>${response.summary}</p>`;
          audioText = response.summary;
          noTaskStarted = false; // Mark as active usage
        } else if (action === 'translate') {
          contentHtml = `<strong>Translated (${langName}):</strong><p>${response.translatedText}</p>`;
          audioText = response.translatedText;
        } else if (action === 'tasks') {
          let tasksHtml = '<strong>Micro-Tasks:</strong><ul style="padding-left:20px;margin:5px 0;">';
          response.tasks.forEach(t => {
            tasksHtml += `<li><input type="checkbox"> ${t}</li>`;
          });
          tasksHtml += '</ul>';
          contentHtml = tasksHtml;
          audioText = "Here are your tasks: " + response.tasks.join(". ");
          noTaskStarted = false;
        } else if (action === 'example') {
          contentHtml = `<strong>Real-Life Example:</strong><p>${response.summary}</p>`;
          audioText = response.summary;
          noTaskStarted = false;
        } else if (action === 'quiz') {
          let quizHtml = '<strong>Quick Check:</strong><ul style="padding-left:20px;margin:5px 0;">';
          response.quiz.forEach((q, idx) => {
            quizHtml += `<li style="margin-bottom:8px;"><strong>Q${idx+1}:</strong> ${q}<br><input type="text" id="ff-quiz-ans-${idx}" placeholder="Your answer..." style="width:100%;margin-top:4px;padding:4px;border:1px solid #ccc;border-radius:4px;"></li>`;
          });
          quizHtml += '</ul>';
          quizHtml += `<button class="ff-btn ff-btn-primary" id="ff-quiz-submit" style="width:100%;margin-top:8px;">Submit Answers</button>`;
          contentHtml = quizHtml;
          audioText = "Quiz time! " + response.quiz.join(". ");
          noTaskStarted = false;
        }

        // Add Audio, PDF Export, and Community Insight Badge
        resultArea.innerHTML = `
          ${contentHtml}
          <div id="ff-feedback-loop" style="display:none; margin-top: 10px; padding: 10px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <p style="margin:0 0 8px 0; font-size: 12px; font-weight: bold;">Did you understand this concept?</p>
            <div style="display:flex; gap: 8px;">
              <button class="ff-btn ff-btn-primary" id="ff-feedback-yes" style="flex:1; font-size: 11px; padding: 4px;">Yes, clear!</button>
              <button class="ff-btn ff-btn-secondary" id="ff-feedback-no" style="flex:1; font-size: 11px; padding: 4px;">Still confused</button>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button class="ff-btn ff-btn-primary" id="ff-export-pdf" style="flex:1; background: #10b981;">📄 PDF</button>
            <button class="ff-btn ff-btn-secondary" id="ff-audio-btn" style="flex:1;">🔊 Listen</button>
          </div>
          <div style="margin-top: 12px; font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 6px;">
            🌍 50+ students simplified this topic
          </div>
        `;

        if (action === 'quiz') {
          document.getElementById('ff-quiz-submit').addEventListener('click', () => {
            document.getElementById('ff-feedback-loop').style.display = 'block';
            document.getElementById('ff-quiz-submit').disabled = true;
            document.getElementById('ff-quiz-submit').innerText = 'Submitted!';
          });
        }

        document.getElementById('ff-feedback-yes')?.addEventListener('click', () => {
          document.getElementById('ff-feedback-loop').innerHTML = '✨ Awesome! Keep going.';
          setTimeout(() => document.getElementById('ff-feedback-loop').style.display = 'none', 2000);
        });

        document.getElementById('ff-feedback-no')?.addEventListener('click', () => {
          document.getElementById('ff-feedback-loop').innerHTML = '💡 Try the <strong>Example</strong> button for a simpler analogy!';
        });

        document.getElementById('ff-audio-btn').addEventListener('click', () => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(audioText);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          } else {
            alert("Audio not supported in your browser.");
          }
        });

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

      } 
    });
  });
}

function enableSmartReadingMode() {
  // Create or get the sweep overlay
  let sweep = document.getElementById('ff-sweep-overlay');
  if (!sweep) {
    sweep = document.createElement('div');
    sweep.id = 'ff-sweep-overlay';
    document.body.appendChild(sweep);
  }

  // Trigger the "WOW" animation
  sweep.classList.remove('ff-sweep-active');
  void sweep.offsetWidth; // Force reflow
  sweep.classList.add('ff-sweep-active');

  // Cinematic removal of unnecessary content
  const targets = 'header, footer, nav, aside, iframe, .ad, .sidebar, #comments, [role="complementary"]';
  document.querySelectorAll(targets).forEach(el => {
    el.classList.add('ff-hidden');
    // Completely remove from layout after fade finishes
    setTimeout(() => {
      el.classList.add('ff-hidden-final');
    }, 800);
  });
  
  // Transition main content to Focus Mode
  const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
  mainContent.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
  mainContent.classList.add('ff-reading-mode');
  
  // Create a "Focus Reset" notification
  const status = document.createElement('div');
  status.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#4f46e5; color:white; padding:10px 20px; border-radius:30px; font-weight:bold; z-index:2147483647; box-shadow:0 4px 15px rgba(0,0,0,0.2); animation:ff-slide-up 0.5s ease-out;';
  status.innerHTML = '✨ Focus Mode Active';
  document.body.appendChild(status);
  setTimeout(() => status.remove(), 3000);
}
// Keyboard Shortcut: Alt + S to trigger the WOW Sweep (for easy demoing)
window.addEventListener('keydown', (e) => {
  if (e.altKey && e.key.toLowerCase() === 's') {
    console.log("Focus-Flow: Manual Gesture Sweep Triggered!");
    enableSmartReadingMode();
  }
});
