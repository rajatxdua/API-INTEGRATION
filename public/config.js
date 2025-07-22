// API Configuration


const API_CONFIG = {
    // NewsAPI.org - Get free API key at https://newsapi.org/
    NEWS_API_KEY: 'e61b3f4220c448858d8b16ec6dcdca72',
    
    // GNews.io - Get free API key at https://gnews.io/
    GNEWS_API_KEY: '21f073052f927f3b849f58ce6d0370c4',
    
    // Alternative free APIs (no key required)
    RSS_TO_JSON_API: 'https://api.rss2json.com/v1/api.json',
    
    // CORS Proxy for browser requests (if needed)
    CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
    
    // Default settings
    DEFAULT_COUNTRY: 'in',
    DEFAULT_LANGUAGE: 'en',
    ARTICLES_PER_PAGE: 12
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
