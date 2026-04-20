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

  // MediaPipe Gesture Detection implementation
  let isGestureActive = false;
  let camera = null;
  const videoElement = document.getElementById('video-feed');

  btnGesture.addEventListener('click', async () => {
    if (isGestureActive) {
      // Stop gesture
      if (camera) camera.stop();
      videoElement.srcObject.getTracks().forEach(track => track.stop());
      isGestureActive = false;
      btnGesture.innerText = 'Enable Gesture Sweep';
      gestureStatus.innerText = 'Gestures: Off';
      return;
    }

    // Start gesture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      let lastSwipeTime = 0;

      hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          gestureStatus.innerText = 'Hand detected...';
          const landmarks = results.multiHandLandmarks[0];
          
          // Simple swipe detection: hand moving rapidly horizontally
          // We can check the delta of wrist position or index finger tip
          const wrist = landmarks[0];
          // For a real implementation, we'd track previous positions.
          // For demo, we just trigger when hand is far left or right quickly
          
          const now = Date.now();
          if (now - lastSwipeTime > 2000) {
            if (wrist.x < 0.2 || wrist.x > 0.8) {
              lastSwipeTime = now;
              gestureStatus.innerText = 'Swipe Detected! Clearing UI...';
              
              // Send message to content script to trigger panic/focus mode
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                  chrome.tabs.sendMessage(tabs[0].id, { action: "triggerGestureCleanup" });
                }
              });
              
              setTimeout(() => {
                gestureStatus.innerText = 'Tracking...';
              }, 2000);
            }
          }
        } else {
          gestureStatus.innerText = 'Tracking...';
        }
      });
      
      camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({image: videoElement});
        },
        width: 320,
        height: 240
      });
      
      camera.start();
      isGestureActive = true;
      btnGesture.innerText = 'Disable Gesture Sweep';
      gestureStatus.innerText = 'Gestures: On';

    } catch (err) {
      console.error("Camera access error:", err);
      gestureStatus.innerText = 'Camera access denied';
    }
  });
});
