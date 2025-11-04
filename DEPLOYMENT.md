# Deployment Guide - Investment Portfolio Tracker

## Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Investment Portfolio Tracker"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new **public** repository (to showcase in portfolio)
   - Don't initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/investment-portfolio.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign up/login with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your `investment-portfolio` repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variable** (CRITICAL):
   - In project settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_api_key_here`
   - Apply to: Production, Preview, and Development
   - ⚠️ **NEVER commit API keys to GitHub!**

5. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain (e.g., `portfolio.yourdomain.com`)
3. Follow DNS configuration instructions

## Alternative: Deploy to Netlify

1. Go to https://netlify.com
2. Drag & drop your `dist` folder (after running `npm run build`)
3. Add environment variable in Site Settings → Environment Variables
4. Set build command: `npm run build`
5. Set publish directory: `dist`

## Security Checklist ✅

- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] API key is set in Vercel/Netlify environment variables
- [ ] Repository is public (for portfolio showcase)
- [ ] No sensitive data in code
- [ ] API key has usage limits set in Google Cloud Console

## For Your Portfolio

### What to Include:

1. **Live Demo Link**: 
   - `https://your-project.vercel.app`

2. **GitHub Repository Link**:
   - `https://github.com/YOUR_USERNAME/investment-portfolio`

3. **Project Description**:
   ```
   Investment Portfolio Tracker
   
   A full-stack web application for tracking stock and cryptocurrency investments
   with real-time market data, AI-powered analysis, and interactive visualizations.
   
   Tech Stack: React, TypeScript, Vite, Google Gemini AI, Recharts, TailwindCSS
   
   Features:
   - Real-time portfolio tracking with P&L calculations
   - Live market data integration via Gemini AI
   - Interactive charts and market heatmap
   - Transaction management system
   - AI-powered stock analysis
   ```

4. **Screenshots**:
   - Take screenshots of the dashboard, heatmap, and portfolio views
   - Add to README or portfolio site

## Continuous Deployment

Once connected to Vercel:
- Every `git push` to `main` branch automatically deploys
- Pull requests create preview deployments
- Instant rollbacks available

## Monitoring

- Check Vercel Analytics for visitor stats
- Monitor API usage in Google Cloud Console
- Set up alerts for API quota limits

## Cost

- **Vercel**: Free for personal projects
- **Gemini API**: Free tier (60 requests/minute)
- **GitHub**: Free for public repositories
- **Total**: $0/month for personal use
