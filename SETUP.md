# Investment Portfolio Setup Guide

## Current Status
✅ The app is running with **mock data** on http://localhost:3001

## To Enable Live Market Data

1. **Get a Gemini API Key**
   - Visit: https://aistudio.google.com/apikey
   - Create a new API key (free tier available)

2. **Create .env.local file**
   - In the project root directory, create a file named `.env.local`
   - Add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Restart the dev server**
   ```bash
   npm run dev
   ```

## Features

### With Mock Data (Current)
- ✅ Portfolio tracking
- ✅ Transaction management
- ✅ Basic charts and visualizations
- ✅ Sample market data
- ⚠️ Data is static/simulated

### With API Key
- ✅ Real-time market prices
- ✅ Live stock data
- ✅ Market heatmap
- ✅ Top movers
- ✅ AI-powered stock analysis
- ✅ Recent news articles

## Troubleshooting

### App shows empty/blank page
- Check browser console for errors (F12)
- Make sure dependencies are installed: `npm install`
- Clear browser cache and reload

### API Key not working
- Verify the key is correct in `.env.local`
- Restart the dev server after adding the key
- Check console for API error messages

### Port already in use
- The app will automatically use the next available port
- Check the terminal output for the actual port number
