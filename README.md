# Khabari - Dynamic API Integration

A responsive news web application that fetches and displays real-time news from multiple APIs. Built with modern web technologies to demonstrate API integration and responsive design.

## 🌟 Features

- **Real-time News**: Fetches live news from NewsAPI, GNews, and RSS feeds
- **Search Functionality**: Search for specific news topics across all sources  
- **Category Navigation**: Browse by General, Technology, Business, Sports, and Health
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Multiple API Sources**: Automatic fallback system for reliable news delivery
- **Modern UI**: Clean card-based design with smooth animations

## 🛠️ Technologies Used

- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with Grid, Flexbox, and animations
- **JavaScript (ES6+)** - Dynamic functionality and API integration
- **Font Awesome** - Professional icons
- **Google Fonts** - Inter typography

## 🌐 APIs Integrated

- **NewsAPI** - Top headlines and search functionality
- **GNews API** - Alternative news source with global coverage
- **RSS Feeds** - CNN, BBC, Guardian, and other reliable sources
- **RSS2JSON** - Converts RSS feeds to JSON format
- **Hacker News API** - Technology news and discussions

## 🚀 How It Works

1. **Multi-Source Fetching**: The app tries NewsAPI first, then GNews, then RSS feeds
2. **Smart Image Handling**: Extracts images from articles or provides category-appropriate placeholders
3. **Search Integration**: Searches across all API sources for comprehensive results
4. **Error Handling**: Graceful fallback to alternative sources if one fails
5. **Responsive Display**: Automatically adjusts layout for different screen sizes

## 📱 Quick Start

1. Clone or download the project
2. Open `index.html` in your web browser
3. Start browsing the latest news!

For development:
```bash
# Using Live Server
npx live-server --port=3000

# Or using any static server
npx serve .
```

## 🎨 Design Highlights

- **Mobile-First**: Optimized for mobile devices first
- **Card Layout**: Clean, organized news presentation  
- **Loading States**: Professional loading animations
- **Error Handling**: User-friendly error messages with retry options
- **Smooth Animations**: CSS transitions for better user experience

## 📁 Project Structure

```
khabari/
├── index.html          # Main application structure
├── styles.css          # Responsive styling and animations  
├── script.js           # Core functionality and API integration
├── config.js           # API keys and configuration
└── README.md           # Project documentation
```

## 🔑 API Configuration

Real API keys are included for demonstration. For production use:

1. Get your own API keys from [NewsAPI](https://newsapi.org) and [GNews](https://gnews.io)
2. Update `config.js` with your keys
3. Deploy to your preferred hosting platform

## 🌐 Browser Support

Works on all modern browsers including Chrome, Firefox, Safari, and Edge on desktop and mobile.

## 👨‍� Author

**Rajat Dua**  
- GitHub: [@rajatxdua](https://github.com/rajatxdua)  
- Instagram: [@therajatdua](https://instagram.com/therajatdua)

*Built as part of a web development internship to demonstrate modern API integration, responsive design, and JavaScript programming skills.*

## 📄 License

MIT License - feel free to use this project for learning and development purposes.
