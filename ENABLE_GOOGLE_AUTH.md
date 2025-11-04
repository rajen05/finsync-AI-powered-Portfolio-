# 🔧 Enable Google Sign In - Quick Fix

## ⚠️ Error You're Seeing
```
"Unsupported provider: provider is not enabled"
```

This means Google OAuth is not enabled in Supabase yet.

---

## ✅ Quick Fix (5 Minutes)

### **Step 1: Go to Supabase Auth Settings**
👉 https://supabase.com/dashboard/project/nvaagwxwseiwcxdzhxzj/auth/providers

### **Step 2: Enable Google Provider**

1. **Scroll down** to find "Google" in the providers list
2. **Toggle ON** the "Enable Sign in with Google" switch
3. You'll see two options:

#### **Option A: Use Supabase's Google OAuth (Easiest)** ⭐ RECOMMENDED
- Supabase provides pre-configured Google OAuth
- Just toggle it on
- Click **Save**
- **Done!** ✅

#### **Option B: Use Your Own Google OAuth App**
If you want your own branding:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   
2. **Create/Select Project**
   - Click "Select a project" → "New Project"
   - Name it: "FinSync"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "FinSync Auth"
   
5. **Add Authorized Redirect URIs**
   Add these URLs:
   ```
   https://nvaagwxwseiwcxdzhxzj.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback (for local testing)
   https://your-app.vercel.app/auth/callback (your production URL)
   ```

6. **Copy Credentials**
   - Copy "Client ID"
   - Copy "Client Secret"

7. **Paste in Supabase**
   - Go back to Supabase Auth Providers
   - Paste Client ID
   - Paste Client Secret
   - Click **Save**

---

## 🎯 Recommended: Use Option A (Supabase's OAuth)

**Why?**
- ✅ Instant setup (30 seconds)
- ✅ No Google Cloud Console needed
- ✅ Works immediately
- ✅ Maintained by Supabase

**How?**
1. Go to: https://supabase.com/dashboard/project/nvaagwxwseiwcxdzhxzj/auth/providers
2. Find "Google"
3. Toggle ON
4. Click Save
5. **Done!** ✅

---

## 🧪 Test It

After enabling:

1. **Refresh your app**
2. **Click "Continue with Google"**
3. **Select Google account**
4. **Authorize**
5. **You're logged in!** ✅

---

## 🔐 Other Providers (Optional)

While you're there, you can also enable:

### **GitHub** (Easy)
1. Toggle ON "GitHub"
2. Uses Supabase's GitHub OAuth
3. Click Save

### **Apple** (Requires Apple Developer Account - $99/year)
1. Need Apple Developer account
2. Create Services ID
3. Add credentials to Supabase

---

## ⚡ Quick Summary

**For Google Sign In to work:**

1. ✅ Go to Supabase Dashboard
2. ✅ Navigate to Auth → Providers
3. ✅ Toggle ON "Google"
4. ✅ Click Save
5. ✅ Refresh your app
6. ✅ Test Google Sign In

**That's it!** 🎉

---

## 🆘 Still Not Working?

### **Check 1: Supabase URL**
Make sure your `.env.local` has:
```env
VITE_SUPABASE_URL=https://nvaagwxwseiwcxdzhxzj.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Check 2: Restart Dev Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Check 3: Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux)
- Or: `Cmd + Shift + R` (Mac)

### **Check 4: Check Console**
- Open browser console (F12)
- Look for errors
- Share screenshot if still not working

---

## 📸 Visual Guide

### What You Should See:

**In Supabase Dashboard:**
```
Auth → Providers → Google
[✓] Enable Sign in with Google
[Save] button
```

**After Enabling:**
```
✅ Google provider enabled
✅ No configuration needed (using Supabase OAuth)
```

**In Your App:**
```
Click "Continue with Google"
→ Google login popup
→ Select account
→ Authorize
→ Redirected back
→ Logged in! ✅
```

---

## 🎯 Next Steps After Enabling

Once Google Sign In works:

1. **Test it** - Sign up with Google
2. **Check database** - Profile auto-created in `profiles` table
3. **Enable other providers** - GitHub, Apple (optional)
4. **Deploy** - Push to production

---

**Enable Google OAuth in Supabase and you're good to go!** 🚀

The error will disappear once you toggle it ON in the dashboard.
