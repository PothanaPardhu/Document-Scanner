# Quick Setup Guide

## Prerequisites
- Node.js installed
- Chrome browser
- GEMINI API Key (already in backend/secret.txt)

## 1. Start the Backend ⚙️

```bash
cd backend
npm install
node server.js
```

You should see:
```
Server running on port 5000
MongoDB Connection Error: ... (OK if MongoDB isn't needed for demo)
```

## 2. Load the Extension 🔌

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Navigate to the `extension` folder in this project
5. Click Select

You should see "Focus-Flow" in the extensions list.

## 3. Open Frontend (Optional) 🎨

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`

## 4. Test the Feature ✅

1. Open any website or PDF reader
2. Select some text (at least 20 characters)
3. You should see a floating menu with buttons:
   - ✨ Simplify
   - 📋 Micro-Tasks
   - 💡 Example
   - 🧠 Test Me
   - 🌐 Translate
4. Click "Simplify"
5. Wait for the AI to process (~3-5 seconds)
6. See the simplified text

## File Structure

```
backend/
  ├─ server.js (Express server with CORS ✓)
  ├─ routes/
  │  └─ ai.js (Simplify, Tasks, Quiz endpoints ✓)
  ├─ services/
  │  └─ aiService.js (Gemini AI integration)
  ├─ secret.txt (GEMINI API KEY ✓)
  └─ package.json

extension/
  ├─ manifest.json (Extension config)
  ├─ background.js (API calls handler ✓)
  ├─ content.js (Text selection UI ✓)
  ├─ popup.html/js (Settings)
  └─ gesture.html/js (Gesture controls)

frontend/
  ├─ vite.config.js
  ├─ src/
  │  ├─ App.jsx
  │  ├─ pages/
  │  │  └─ PdfReader.jsx
  │  └─ components/
  │     └─ AIPanel.jsx
  └─ package.json
```

## What Was Fixed ✅

| Issue | Fix | Location |
|-------|-----|----------|
| CORS errors | Added Chrome extension + localhost origins | server.js |
| Poor error messages | Added error details & timestamp | routes/ai.js |
| API call failures | Better error parsing & logging | background.js |
| User confusion | Helpful error UI with troubleshooting | content.js |

## Common Issues & Quick Fixes

| Problem | Solution |
|---------|----------|
| "Can't reach localhost:5000" | Run `node backend/server.js` |
| Extension buttons don't appear | Reload extension in chrome://extensions/ |
| "Error: API processing failed" | Check backend console logs |
| Text not selected | Need to select at least 20 characters |
| Red error box with troubleshooting | Open DevTools (F12) and check logs |

## Testing Each Endpoint

Use the TROUBLESHOOTING.md file's curl commands to test API endpoints directly.

## Logs to Check

1. **Backend logs**: Terminal where you ran `node server.js`
   - Look for: `${DATE} - POST /api/ai/simplify`
   - Look for: `Simplify endpoint error:` if there's an error

2. **Extension logs**: DevTools → Console (F12)
   - Look for: `Focus-Flow: Calling http://localhost:5000/api/ai/simplify`
   - Look for: `Focus-Flow: ...success`

## Next Steps

1. ✓ Verify backend is running
2. ✓ Reload the extension
3. ✓ Select text and click Simplify
4. ✓ Check both backend console and DevTools for errors
5. ✓ Use TROUBLESHOOTING.md if issues persist
