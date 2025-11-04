# Vercel Deployment Fix - Blank Page Issue

## 🚨 Problem: Blank Page on Vercel

Your app shows a blank page because the **Gemini API key** is not set in Vercel's environment variables.

## ✅ Solution: Add Environment Variable

### Step 1: Go to Vercel Dashboard

1. Open your Vercel project: https://vercel.com/dashboard
2. Click on your project name
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add API Key

Add this environment variable:

```
Name:  GEMINI_API_KEY
Value: [Your Gemini API Key from .env.local]
```

**Important**: 
- Name must be exactly `GEMINI_API_KEY`
- Value should be your actual API key (starts with `AIza...`)
- Select all environments: Production, Preview, Development

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **3 dots** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## 🔍 How to Find Your API Key

Your API key is in `.env.local`:

```bash
# Open .env.local
cat .env.local

# You should see:
GEMINI_API_KEY=AIza...your_key_here
```

Copy the value after `GEMINI_API_KEY=`

## 📋 Quick Checklist

- [ ] Open Vercel project settings
- [ ] Go to Environment Variables
- [ ] Add `GEMINI_API_KEY` with your key
- [ ] Select all environments
- [ ] Save
- [ ] Redeploy

## 🎯 Alternative: Use Mock Data (No API Key)

If you don't want to use the API key, the app will automatically use mock data. But you still need to:

1. Make sure the app builds successfully
2. Check browser console for errors
3. Verify the build output

## 🔧 Verify Build Locally

Test the production build locally:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

If this works locally but not on Vercel, it's definitely the environment variable issue.

## 📊 Common Issues

### Issue 1: Blank Page
**Cause**: Missing environment variable
**Fix**: Add `GEMINI_API_KEY` in Vercel settings

### Issue 2: Build Fails
**Cause**: TypeScript errors or missing dependencies
**Fix**: Run `npm run build` locally to see errors

### Issue 3: 404 Error
**Cause**: Routing issue
**Fix**: Vercel should auto-detect Vite/React, but you can add `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🚀 Expected Result

After adding the API key and redeploying:
- ✅ App loads successfully
- ✅ Heatmap displays
- ✅ Portfolio works
- ✅ Market data loads

## 📱 Check Deployment

After redeploying, check:
1. Open your Vercel URL
2. Open browser console (F12)
3. Look for any errors
4. Verify data is loading

## 💡 Pro Tip

You can also deploy without the API key - the app will use mock data automatically. This is useful for:
- Testing the deployment
- Demos
- Development

The app is designed to work with or without the API key!

---

**Next Steps**:
1. Add `GEMINI_API_KEY` to Vercel environment variables
2. Redeploy
3. Refresh your Vercel URL
4. App should work! 🎉
