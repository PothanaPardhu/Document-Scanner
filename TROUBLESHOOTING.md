# Troubleshooting Guide: Copy & Simplify API Issues

## The Issue
When copying text and clicking "Simplify" in the extension, you're getting an API fetch error.

## Root Causes & Solutions

### 1. **Backend Server Not Running** ❌
**Error**: `API returned 0 - Can't reach localhost:5000`

**Fix**:
```bash
cd backend
npm install  # if dependencies not installed
node server.js
```
Expected output: `Server running on port 5000`

### 2. **CORS Configuration Issue** ❌
**Error**: `Failed to fetch - CORS policy`

**Fix**: ✅ ALREADY FIXED in the latest server.js
- Updated CORS configuration to accept requests from:
  - `http://localhost:3000` (Frontend)
  - `http://localhost:5173` (Vite dev server)
  - Chrome extension origins
  - `http://localhost:5000` (API)

### 3. **Missing or Invalid GEMINI_API_KEY** ❌
**Error**: `Gemini API Error` or `Could not generate summary`

**Fix**:
```bash
# The key should be in backend/secret.txt
# Current value: AIzaSyDB9O-2LaRsuVEoNjlzvLhP0omYnE1e8_4

# Verify the file exists and is readable:
cat backend/secret.txt

# If missing, get a valid key from:
# https://makersuite.google.com/app/apikey
```

### 4. **Incorrect API URL in Extension** ❌
**Error**: `API returned 404`

**Fix**: ✅ ALREADY VERIFIED
- Extension background.js uses: `http://localhost:5000/api`
- Backend routes mounted at:
  - `/api/ai/simplify` ✓
  - `/api/ai/tasks` ✓
  - `/api/ai/quiz` ✓
  - `/api/ai/example` ✓
  - `/api/ai/translate` ✓

### 5. **Extension Not Reloaded After Changes** ❌
**Error**: Still getting old errors after code changes

**Fix**:
1. Go to `chrome://extensions/`
2. Find "Focus-Flow" extension
3. Click the reload icon 🔄
4. Try the action again

## Debugging Steps

### Step 1: Check if Backend is Running
```bash
# Test the health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","service":"Focus-Flow AI Backend"}
```

### Step 2: Test API Endpoint Directly
```bash
# Test simplify endpoint
curl -X POST http://localhost:5000/api/ai/simplify \
  -H "Content-Type: application/json" \
  -d '{"text":"Your test text here","level":"Medium"}'
```

### Step 3: Check Browser Console for Extension Errors
1. Right-click → Inspect Element
2. Go to Console tab
3. Look for errors starting with "Focus-Flow:"

### Step 4: Check Extension Logs
1. Go to `chrome://extensions/`
2. Click "Details" on Focus-Flow
3. Scroll to "Inspect extension" 
4. Click "service worker" or "background page"
5. Check Console tab for errors

## Changes Made to Fix Issues

### ✅ server.js - Improved CORS
- Added explicit origin whitelist
- Added Chrome extension support
- Increased JSON body limit to 50MB

### ✅ routes/ai.js - Better Error Handling  
- Added detailed error messages
- Includes error details and timestamp in responses
- Console logging for debugging

### ✅ extension/background.js - Enhanced API Calls
- Better error parsing from API responses
- Displays server error details to user
- Added timeout handling
- Improved logging

### ✅ extension/content.js - User-Friendly Errors
- Shows detailed troubleshooting steps in UI
- Displays error details from server
- Includes quick-fix checklist

## Quick Checklist ✓

- [ ] Backend running: `node backend/server.js`
- [ ] Port 5000 is free and accessible
- [ ] GEMINI_API_KEY in `backend/secret.txt` is valid
- [ ] Extension reloaded in `chrome://extensions/`
- [ ] Frontend running (if needed): `npm run dev` from frontend folder
- [ ] No firewall blocking localhost:5000
- [ ] Browser console shows no CORS errors

## Still Having Issues?

1. Open DevTools (F12) → Console
2. Look for errors with "Focus-Flow:" prefix
3. Check the exact error message and details
4. Verify backend logs show the API call being received
5. Ensure GEMINI_API_KEY has quotes removed and no trailing spaces

## Test Commands

```bash
# 1. Test backend health
curl http://localhost:5000/health

# 2. Test simplify endpoint
curl -X POST http://localhost:5000/api/ai/simplify \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Artificial Intelligence is a rapidly evolving field\",\"level\":\"Medium\"}"

# 3. Test tasks endpoint
curl -X POST http://localhost:5000/api/ai/tasks \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Machine Learning involves training algorithms on data\"}"
```

## Success Indicators ✓

When working correctly, you should see:
1. Extension shows "Simplifying locally..." message
2. After ~3-5 seconds, simplified text appears
3. No red error box in the results area
4. Browser console has "Focus-Flow: ...success" messages
