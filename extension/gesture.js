const videoElement = document.getElementById('video-feed');
const statusElement = document.getElementById('gesture-status');

async function setupGestureTracking() {
  try {
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
        statusElement.innerText = 'Hand Tracking Active';
        statusElement.classList.add('active');
        
        const landmarks = results.multiHandLandmarks[0];
        const wrist = landmarks[0];
        
        const now = Date.now();
        // Detect horizontal swipe (hand moving to the far edges)
        if (now - lastSwipeTime > 2000) {
          if (wrist.x < 0.2 || wrist.x > 0.8) {
            lastSwipeTime = now;
            statusElement.innerText = 'SWIPE DETECTED!';
            
            // Send message to background script
            chrome.runtime.sendMessage({ action: "swipeDetected" });
            
            setTimeout(() => {
              statusElement.innerText = 'Hand Tracking Active';
            }, 2000);
          }
        }
      } else {
        statusElement.innerText = 'Looking for hand...';
        statusElement.classList.remove('active');
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({image: videoElement});
      },
      width: 640,
      height: 480
    });

    camera.start();
    statusElement.innerText = 'Camera Ready - Waiting for Hand';

  } catch (err) {
    console.error("Gesture Hub Error:", err);
    statusElement.innerText = 'Error: ' + err.message;
  }
}

// Start tracking as soon as the page loads
setupGestureTracking();
