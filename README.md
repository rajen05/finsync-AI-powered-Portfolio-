# 📊 FinSync - Investment Portfolio Tracker

A modern, full-stack web application for tracking stock and cryptocurrency investments with real-time market data, AI-powered chatbot, interactive visualizations, and cloud database sync.

![Portfolio Dashboard](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 📈 Portfolio Management
- **Real-time Portfolio Tracking** - Monitor stocks and crypto with live market data
- **P&L Calculations** - Automatic profit/loss tracking with percentage gains
- **Transaction Management** - Track buy/sell transactions across brokers
- **Holdings Overview** - Current positions with market values
- **Performance Charts** - Historical portfolio value over time
- **Asset Allocation** - Visual breakdown by stocks/crypto

### 📊 Data Visualization
- **Market Heatmap** - S&P 500 performance visualization
- **Interactive Charts** - Portfolio performance over time (1M, 3M, 6M, 1Y, ALL)
- **Allocation Pie Chart** - Asset distribution
- **Price Trends** - Historical data with Recharts

### 👀 Watchlist (Wishlist)
- **Track Tickers** - Monitor stocks/crypto you're interested in
- **Price Alerts** - Set target prices with visual indicators
- **Alert Notifications** - "Target Hit!" when price reaches goal
- **Notes** - Add personal investment notes

### 🤖 AI Investment Assistant
- **Chat Interface** - Floating chatbot button
- **Gemini AI Powered** - Google's Gemini 2.0 Flash
- **Investment Focused** - Stocks, crypto, trading, market analysis
- **Markdown Formatting** - Rich text responses with tables, lists, emojis
- **Conversation History** - Maintains context

### 🔍 Search & Filter
- **Transaction Search** - Find by ticker, type, broker, date range
- **Holdings Sort** - Sort by value, P&L, quantity, ticker
- **Performance Filter** - Show only profitable or losing positions
- **Live Stats** - Real-time filtered results count

### 📤 Import/Export
- **CSV Export** - Download all transactions
- **CSV Import** - Bulk upload transactions
- **Sample Template** - Pre-formatted CSV template
- **Data Validation** - Error checking on import

### 🔐 Authentication & Database
- **Supabase Auth** - Secure user authentication
- **PostgreSQL Database** - Cloud-synced data
- **Row Level Security** - Users only see their own data
- **Auto-sync** - Data synced across devices

### 🎨 User Experience
- **Dark/Light Mode** - Theme toggle
- **Responsive Design** - Mobile, tablet, desktop
- **Modern UI** - TailwindCSS styling
- **Loading States** - Skeleton screens
- **Empty States** - Helpful messages

## 🚀 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

### APIs & Services
- **Google Gemini AI** - AI chatbot
- **Supabase Auth** - Authentication
- **Market Data** - Real-time prices

### State Management
- **React Context API** - Global state
- **Custom Hooks** - Reusable logic
- **LocalStorage** - Client-side cache

## 📸 App Sections

### 1. Heatmap (Home)
- S&P 500 market visualization
- Color-coded performance
- Sector grouping

### 2. Portfolio
- Portfolio summary cards
- Performance chart (time range filters)
- Holdings table (sortable, filterable)
- Asset allocation chart

### 3. Transactions
- All buy/sell transactions
- Search & filter (ticker, type, broker, date)
- CSV import/export
- Transaction statistics

### 4. Watchlist
- Tracked tickers with current prices
- Price alert indicators
- Target price tracking
- Personal notes

### 5. Market Data
- Individual stock/crypto details
- Price charts
- News articles
- AI-powered analysis

### 6. AI Assistant (Floating)
- Chat interface
- Investment Q&A
- Market insights
- Trading terminology

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Gemini API Key ([Get one free](https://aistudio.google.com/apikey))
- Supabase Account ([Sign up free](https://supabase.com))

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/finsync-portfolio.git
cd finsync-portfolio
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Set Up Supabase Database

**A. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait 2-3 minutes for provisioning

**B. Run Database Schema**
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy entire `database.sql` file
4. Paste and click "Run"
5. Verify tables created in Table Editor

**C. Enable Authentication**
1. Go to Authentication → Providers
2. Enable Email provider

**D. Get API Credentials**
1. Go to Settings → API
2. Copy Project URL
3. Copy anon/public key

#### 4. Configure Environment Variables

Create `.env.local` in root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

#### 5. Start Development Server
```bash
npm run dev
```

#### 6. Open in Browser
Navigate to `http://localhost:5173`

### Database Schema

The app uses 5 main tables:

1. **profiles** - User profile information
2. **transactions** - All buy/sell transactions
3. **wishlist** - Watchlist items with price alerts
4. **user_preferences** - User settings (theme, currency, etc.)
5. **price_alerts** - Price alert conditions

**Security Features:**
- Row Level Security (RLS) enabled
- Users only see their own data
- Automatic profile creation on signup
- Password hashing by Supabase Auth

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Deploy to Netlify

1. **Connect Repository**
2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**
   - Add same variables as Vercel
4. **Deploy**

### Other Platforms
Works on any static hosting:
- GitHub Pages
- Cloudflare Pages
- AWS Amplify
- Firebase Hosting

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**
   - Create account with email/password
   - Profile auto-created
   - Start adding transactions

2. **Add Transactions**
   - Click "Add Transaction" button
   - Fill in: ticker, type (buy/sell), quantity, price, date, broker
   - Transaction saved to database

3. **View Portfolio**
   - See all holdings with current values
   - Check P&L (profit/loss)
   - View performance chart
   - Sort and filter holdings

4. **Create Watchlist**
   - Navigate to Watchlist page
   - Click "Add to Watchlist"
   - Set target price for alerts
   - Add notes about why you're watching

5. **Search & Filter**
   - **Transactions**: Search by ticker, filter by type/broker/date
   - **Holdings**: Sort by value/P&L, filter by performance
   - Clear filters anytime

6. **Import/Export Data**
   - **Export**: Download all transactions as CSV
   - **Import**: Upload CSV file (bulk add)
   - **Template**: Download sample CSV format

7. **Chat with AI**
   - Click floating chat button
   - Ask about stocks, crypto, trading
   - Get market insights
   - Learn investment terminology

### Features in Detail

#### Portfolio Performance Chart
- View portfolio value over time
- Time ranges: 1M, 3M, 6M, 1Y, ALL
- Toggle cost basis line
- See highest/lowest values
- Track gains/losses

#### Price Alerts
- Set target prices on watchlist items
- Visual "Target Hit!" indicator
- Shows % distance to target
- Animated pulse when triggered

#### Search & Filter
- **Transaction filters**: Type, Asset, Broker, Date range
- **Holdings filters**: Asset type, Performance (profit/loss)
- **Sorting**: Click column headers to sort
- **Stats**: Live count of filtered results

#### CSV Import/Export
- **Export**: One-click download
- **Import**: Drag & drop or select file
- **Validation**: Error checking on import
- **Format**: Date, Ticker, Asset Type, Type, Quantity, Price, Broker

## 🔒 Security

### Authentication
- **Supabase Auth** - Industry-standard authentication
- **Password Hashing** - bcrypt encryption
- **JWT Tokens** - Secure session management
- **Email Verification** - Optional email confirmation

### Database Security
- **Row Level Security (RLS)** - Users only access their own data
- **PostgreSQL** - Enterprise-grade database
- **Automatic Backups** - Supabase handles backups
- **SSL Encryption** - All connections encrypted

### API Keys
- **Environment Variables** - Never committed to Git
- **`.env.local`** - Gitignored by default
- **Anon Key** - Safe for client-side (RLS protects data)
- **Service Key** - Never exposed to client

### Best Practices
- ✅ Passwords never stored in your tables
- ✅ API keys in environment variables only
- ✅ RLS policies on all tables
- ✅ Input validation on all forms
- ✅ XSS protection built-in
- ✅ CSRF protection via Supabase

## 📁 Project Structure

```
finsync-portfolio/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Heatmap.tsx      # Market heatmap
│   │   ├── PortfolioSummary.tsx
│   │   ├── HoldingsTable.tsx
│   │   ├── TransactionsTable.tsx
│   │   ├── Wishlist.tsx     # Watchlist
│   │   ├── PerformanceChart.tsx
│   │   ├── AIAssistant.tsx  # AI chatbot
│   │   ├── ImportExportModal.tsx
│   │   └── icons/           # Icon components
│   ├── context/             # React Context
│   │   ├── ThemeContext.tsx
│   │   └── MarketDataProvider.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── usePortfolio.ts
│   │   └── usePortfolioPerformance.ts
│   ├── lib/                 # Utilities
│   │   └── supabase.ts      # Supabase client
│   ├── services/            # API services
│   │   └── aiAssistant.ts   # Gemini AI
│   ├── utils/               # Helper functions
│   │   └── csvUtils.ts      # CSV import/export
│   ├── types.ts             # TypeScript types
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── database.sql             # Database schema
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add TypeScript types
- Test your changes
- Update documentation
- Keep commits atomic

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot find module @supabase/supabase-js"**
```bash
npm install @supabase/supabase-js
```

**Issue: "Missing environment variables"**
- Ensure `.env.local` exists
- Check variable names start with `VITE_`
- Restart dev server after changes

**Issue: "Table doesn't exist"**
- Run `database.sql` in Supabase SQL Editor
- Verify tables in Table Editor

**Issue: "Authentication error"**
- Check Supabase URL and anon key
- Verify Email provider is enabled
- Check RLS policies are active

**Issue: "Data not syncing"**
- Check internet connection
- Verify Supabase project is active
- Check browser console for errors

## 🚀 Roadmap

### Planned Features
- [ ] Multi-currency support
- [ ] Dividend tracking
- [ ] Tax reporting
- [ ] Portfolio comparison
- [ ] Social features (share portfolios)
- [ ] Mobile app (React Native)
- [ ] Advanced charting
- [ ] Automated trading integration
- [ ] Portfolio rebalancing suggestions
- [ ] Risk analysis tools

### Recently Added ✅
- ✅ Watchlist with price alerts
- ✅ Portfolio performance chart
- ✅ CSV import/export
- ✅ Search & filter
- ✅ AI chatbot assistant
- ✅ Supabase database integration
- ✅ Dark/light mode
- ✅ Market heatmap

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- **Supabase** - Backend and authentication
- **Google Gemini AI** - AI-powered chatbot
- **Recharts** - Data visualization
- **TailwindCSS** - UI styling
- **Vite** - Lightning-fast build tool
- **React** - UI framework

## 📚 Documentation

For detailed setup and usage:
- `database.sql` - Complete database schema
- `.env.example` - Environment variable template
- Code comments - Inline documentation

## 📧 Support

For questions or feedback:
- Open an issue on GitHub
- Email: your.email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using React, TypeScript, Supabase, and Gemini AI**
