# Troubleshooting Guide

## Heatmap Not Working

### Step 1: Check Browser Console

1. Open your browser (http://localhost:3002)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for these messages:

**✅ Good Signs:**
```
🔑 API Key Check: { hasApiKey: true, API_KEY_length: 39, ... }
✅ Gemini API key loaded successfully
📊 MarketDataProvider: Starting data fetch
🌐 Fetching live heatmap data from Gemini API...
✅ Heatmap data fetched successfully: 50 stocks
```

**❌ Problem Signs:**
```
⚠️ Gemini API key not found
🎭 Using mock heatmap data (no API key)
❌ Error fetching heatmap data: [error details]
```

### Step 2: Verify API Key

Check if the API key is loaded:
1. Look for the console message: `🔑 API Key Check`
2. Verify `hasApiKey: true` and `API_KEY_length: 39`
3. If false, the `.env.local` file is not being read

### Step 3: Hard Refresh

Sometimes the browser caches old code:
1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. Or press **Ctrl + F5**
3. This forces a full page reload

### Step 4: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for any failed requests (red entries)
5. Check if there are any CORS errors

### Step 5: Verify .env.local File

The file should contain:
```
GEMINI_API_KEY=AIzaSyA3DLrlWpnWjlJ6v80NulKtobZel6MDKZw
```

Make sure:
- File is named exactly `.env.local` (not `.env.local.txt`)
- No spaces around the `=` sign
- No quotes around the API key
- File is in the project root directory

### Step 6: Restart Dev Server

If changes aren't being picked up:
```bash
# Stop the server (Ctrl + C in terminal)
# Then restart:
npm run dev
```

### Step 7: Clear Cache

If the issue persists:
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Common Issues & Solutions

### Issue: "Using mock heatmap data (no API key)"

**Solution:**
- API key is not being loaded
- Check `.env.local` file exists
- Restart dev server
- Check vite config console output for: `GEMINI_API_KEY_exists: true`

### Issue: API Error "Invalid API Key"

**Solution:**
- API key might be incorrect
- Go to https://aistudiocdn.google.com/apikey
- Generate a new key
- Update `.env.local`
- Restart server

### Issue: API Error "Quota Exceeded"

**Solution:**
- You've hit the free tier limit (60 requests/minute)
- Wait a few minutes
- The app uses caching to reduce API calls

### Issue: Heatmap Shows "No heatmap data available"

**Solution:**
- Check console for error messages
- API call might have failed
- Try refreshing the page
- Check internet connection

### Issue: Yellow Warning Banner Still Showing

**Solution:**
- The API key check happens at build time
- Restart the dev server
- Hard refresh the browser (Ctrl + Shift + R)

### Issue: "Failed to parse heatmap data"

**Solution:**
- Gemini API returned invalid JSON
- This is rare, usually resolves on retry
- Refresh the page
- Check console for the actual response

## Debug Mode

To see all API calls and responses, add this to your console:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

## Still Not Working?

1. **Check Terminal Output:**
   - Look for the vite config message
   - Should show: `GEMINI_API_KEY_exists: true`

2. **Verify API Key is Valid:**
   - Go to https://aistudio.google.com/apikey
   - Check if the key is active
   - Try generating a new one

3. **Test API Key Manually:**
   Open browser console and run:
   ```javascript
   fetch('https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY')
     .then(r => r.json())
     .then(console.log)
   ```
   Replace `YOUR_API_KEY` with your actual key

4. **Check for Firewall/Proxy:**
   - Some networks block API calls
   - Try on a different network
   - Check if VPN is interfering

## Expected Behavior

When working correctly:
1. Page loads with loading spinner
2. After 2-5 seconds, heatmap appears
3. Shows 50+ stocks in different sectors
4. Colors indicate gains (green) and losses (red)
5. No yellow warning banner at top
6. Console shows: "✅ Heatmap data fetched successfully"

## Contact

If none of these solutions work, check:
- GitHub Issues: [your-repo]/issues
- Gemini API Status: https://status.cloud.google.com/
