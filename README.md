# 📊 Investment Portfolio Tracker

A modern, full-stack web application for tracking stock and cryptocurrency investments with real-time market data, AI-powered analysis, and interactive visualizations.

![Portfolio Dashboard](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- 📈 **Real-time Portfolio Tracking** - Monitor stocks and crypto with live market data
- 💰 **P&L Calculations** - Automatic profit/loss tracking with percentage gains
- 🗺️ **Market Heatmap** - Visual representation of S&P 500 performance
- 📊 **Interactive Charts** - Historical price data and allocation breakdowns
- 🤖 **AI-Powered Analysis** - Stock insights using Google Gemini AI
- 📰 **News Integration** - Latest news articles for tracked assets
- 💼 **Transaction Management** - Track buy/sell transactions across brokers
- 🎨 **Modern UI** - Responsive design with TailwindCSS

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **AI Integration**: Google Gemini AI API
- **State Management**: React Context API
- **Data Persistence**: LocalStorage

## 📸 Screenshots

### Portfolio Dashboard
*Track your investments with real-time data and P&L calculations*

### Market Heatmap
*Visualize market movements across sectors*

### Transaction History
*Manage all your buy/sell transactions*

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Gemini API Key ([Get one free](https://aistudio.google.com/apikey))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/investment-portfolio.git
   cd investment-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deployment

This app is optimized for deployment on Vercel, Netlify, or any static hosting service.

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/investment-portfolio)

1. Connect your GitHub repository
2. Add `GEMINI_API_KEY` environment variable
3. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🎯 Usage

1. **Add Transactions**: Click "Add Transaction" to record buy/sell orders
2. **View Portfolio**: See your holdings with current values and P&L
3. **Explore Market**: Check the heatmap for market trends
4. **Analyze Stocks**: Click any holding for AI-powered analysis

## 🔒 Security

- API keys are stored in environment variables (never committed)
- `.env.local` is gitignored by default
- All API calls are made server-side (in production)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Market data powered by [Google Gemini AI](https://ai.google.dev/)
- Charts built with [Recharts](https://recharts.org/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)

## 📧 Contact

For questions or feedback, reach out at: your.email@example.com

---

⭐ Star this repo if you find it helpful!
