// Khabari - Dynamic API Integration Script
// This application demonstrates modern web development practices with API integration

class Khabari {
    constructor() {
        // API configuration - using real news sources
        this.currentCategory = 'general';
        this.currentPage = 1;
        this.articlesPerPage = 12;
        this.isLoading = false;
        this.allArticles = [];
        
        // Use real APIs that don't require authentication for demo
        this.USE_REAL_API = true;
        
        // DOM elements
        this.elements = {
            loadingContainer: document.getElementById('loadingContainer'),
            errorContainer: document.getElementById('errorContainer'),
            newsContainer: document.getElementById('newsContainer'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            retryBtn: document.getElementById('retryBtn'),
            loadMoreBtn: document.getElementById('loadMoreBtn'),
            loadMoreContainer: document.getElementById('loadMoreContainer'),
            navBtns: document.querySelectorAll('.nav-btn'),
            errorMessage: document.getElementById('errorMessage')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNews();
    }

    bindEvents() {
        // Category navigation
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target.dataset.category);
            });
        });

        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Refresh and retry
        this.elements.refreshBtn.addEventListener('click', () => this.refreshNews());
        this.elements.retryBtn.addEventListener('click', () => this.loadNews());
        
        // Load more articles
        this.elements.loadMoreBtn.addEventListener('click', () => this.loadMoreArticles());

        // Clear search when input is empty
        this.elements.searchInput.addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                // Reset section title when search is cleared
                const sectionTitle = document.querySelector('.section-title');
                if (sectionTitle) {
                    sectionTitle.textContent = 'Latest News';
                }
                this.loadNews(this.currentCategory, '');
            }
        });
    }

    async loadNews(category = this.currentCategory, query = '') {
        this.showLoading();
        this.isLoading = true;
        
        try {
            const articles = await this.fetchNewsData(category, query);
            this.allArticles = articles;
            this.displayArticles(articles);
            this.showLoadMoreIfNeeded();
        } catch (error) {
            this.showError(error.message);
            console.error('Error loading news:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async fetchNewsData(category = 'general', query = '') {
        console.log('Fetching news data for category:', category, 'query:', query);
        
        try {
            // First try NewsAPI with the real API key from config
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.NEWS_API_KEY && API_CONFIG.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY_HERE') {
                console.log('Using NewsAPI with key:', API_CONFIG.NEWS_API_KEY.substring(0, 10) + '...');
                const articles = await this.fetchFromNewsAPI(category, query);
                console.log('NewsAPI returned', articles.length, 'articles');
                if (articles.length > 0) return articles;
            }
            
            // Then try GNews API with real key
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.GNEWS_API_KEY && API_CONFIG.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
                console.log('Using GNews API with key:', API_CONFIG.GNEWS_API_KEY.substring(0, 10) + '...');
                const articles = await this.fetchFromGNewsAPI(category, query);
                console.log('GNews API returned', articles.length, 'articles');
                if (articles.length > 0) return articles;
            }
            
            console.log('No API keys found or APIs failed, using RSS feeds');
            // Fallback to RSS feeds with search capability
            const articles = await this.fetchFromRSSFeeds(category, query);
            console.log('RSS feeds returned', articles.length, 'articles');
            if (articles.length > 0) return articles;
            
        } catch (error) {
            console.warn('Primary APIs failed:', error.message);
        }
        
        try {
            // Try news aggregator with search
            console.log('Trying news aggregator with search capability');
            const articles = await this.fetchFromNewsAggregator(category, query);
            console.log('News aggregator returned', articles.length, 'articles');
            if (articles.length > 0) return articles;
        } catch (finalError) {
            console.error('All real APIs failed, using enhanced mock data:', finalError);
        }
        
        // Final fallback with search-aware mock data
        return await this.fetchMockNews(category, query);
    }

    async fetchFromNewsAPI(category, query) {
        const apiKey = typeof API_CONFIG !== 'undefined' ? API_CONFIG.NEWS_API_KEY : 'e61b3f4220c448858d8b16ec6dcdca72';
        const baseUrl = 'https://newsapi.org/v2';
        
        console.log('NewsAPI request - Category:', category, 'Query:', query, 'API Key:', apiKey.substring(0, 10) + '...');
        
        let url;
        if (query) {
            url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&pageSize=${this.articlesPerPage}&apiKey=${apiKey}&sortBy=publishedAt&language=en`;
        } else {
            url = `${baseUrl}/top-headlines?country=us&pageSize=${this.articlesPerPage}&apiKey=${apiKey}`;
            if (category && category !== 'general') {
                url += `&category=${category}`;
            }
        }
        
        console.log('Making request to:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('NewsAPI error:', response.status, response.statusText);
            throw new Error(`NewsAPI error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('NewsAPI response:', data);
        
        if (data.status !== 'ok') {
            console.error('NewsAPI returned error:', data.message);
            throw new Error(data.message || 'NewsAPI returned an error');
        }
        
        console.log('NewsAPI returned', data.articles.length, 'articles');
        return this.formatNewsAPIData(data.articles || []);
    }

    async fetchFromGNewsAPI(category, query) {
        const apiKey = typeof API_CONFIG !== 'undefined' ? API_CONFIG.GNEWS_API_KEY : '21f073052f927f3b849f58ce6d0370c4';
        const baseUrl = 'https://gnews.io/api/v4';
        
        console.log('GNews request - Category:', category, 'Query:', query, 'API Key:', apiKey.substring(0, 10) + '...');
        
        let url;
        if (query) {
            url = `${baseUrl}/search?q=${encodeURIComponent(query)}&token=${apiKey}&lang=en&max=${this.articlesPerPage}`;
        } else {
            url = `${baseUrl}/top-headlines?token=${apiKey}&lang=en&country=us&max=${this.articlesPerPage}`;
            if (category && category !== 'general') {
                url += `&category=${category}`;
            }
        }
        
        console.log('Making request to:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('GNews API error:', response.status, response.statusText);
            throw new Error(`GNews API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('GNews response:', data);
        
        return this.formatGNewsData(data.articles || []);
    }

    async fetchFromRSSFeeds(category, query) {
        // RSS feeds for different categories
        const rssFeeds = {
            general: [
                'http://rss.cnn.com/rss/edition.rss',
                'https://feeds.bbci.co.uk/news/rss.xml',
                'https://www.theguardian.com/world/rss'
            ],
            technology: [
                'http://rss.cnn.com/rss/edition_technology.rss',
                'https://feeds.feedburner.com/TechCrunch',
                'https://www.wired.com/feed/rss'
            ],
            business: [
                'http://rss.cnn.com/rss/money_latest.rss',
                'https://feeds.bloomberg.com/markets/news.rss',
                'https://feeds.reuters.com/reuters/businessNews'
            ],
            sports: [
                'http://rss.cnn.com/rss/edition_sport.rss',
                'https://feeds.skysports.com/feeds/11095',
                'https://www.espn.com/espn/rss/news'
            ],
            health: [
                'http://rss.cnn.com/rss/edition_health.rss',
                'https://feeds.medicalnewstoday.com/medicalnewstoday',
                'https://www.reuters.com/rssFeed/healthNews'
            ]
        };

        let feeds = rssFeeds[category] || rssFeeds.general;
        let allArticles = [];

        // If searching, try multiple feeds to get more results
        if (query) {
            console.log('Searching across multiple RSS feeds for:', query);
            // Search across all categories when there's a query
            const allFeeds = Object.values(rssFeeds).flat();
            feeds = allFeeds.slice(0, 3); // Limit to 3 feeds for performance
        }

        // Try multiple feeds in parallel
        const feedPromises = feeds.slice(0, 2).map(async (feedUrl) => {
            try {
                const rssToJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=${this.articlesPerPage}`;
                console.log('Fetching RSS feed:', feedUrl);
                
                const response = await fetch(rssToJsonUrl);
                
                if (!response.ok) {
                    console.warn(`RSS API error for ${feedUrl}:`, response.status);
                    return [];
                }
                
                const data = await response.json();
                
                if (data.status !== 'ok') {
                    console.warn(`RSS conversion failed for ${feedUrl}`);
                    return [];
                }

                return data.items || [];
            } catch (error) {
                console.warn(`Failed to fetch RSS feed ${feedUrl}:`, error.message);
                return [];
            }
        });

        const feedResults = await Promise.allSettled(feedPromises);
        feedResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allArticles = allArticles.concat(result.value);
            }
        });

        // Filter by query if provided
        if (query && query.trim()) {
            const queryLower = query.toLowerCase();
            allArticles = allArticles.filter(item => {
                const titleMatch = item.title && item.title.toLowerCase().includes(queryLower);
                const descMatch = item.description && item.description.toLowerCase().includes(queryLower);
                const contentMatch = item.content && item.content.toLowerCase().includes(queryLower);
                
                return titleMatch || descMatch || contentMatch;
            });
            
            console.log(`Filtered ${allArticles.length} articles matching "${query}"`);
        }

        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Return top articles
        return this.formatRSSData(allArticles.slice(0, this.articlesPerPage));
    }

    async fetchFromNewsAggregator(category, query) {
        // Using a different approach - fetch from GitHub trending or other public APIs
        try {
            if (query && query.trim()) {
                // For search queries, try to get relevant content
                console.log('Searching Hacker News for:', query);
                return await this.searchHackerNews(query);
            } else {
                // HackerNews API - always works, no auth required
                const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
                const storyIds = await response.json();
                
                // Get first 10 stories
                const stories = await Promise.all(
                    storyIds.slice(0, 10).map(async (id) => {
                        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                        return await storyResponse.json();
                    })
                );
                
                return this.formatHackerNewsData(stories, category);
            }
        } catch (error) {
            throw new Error('News aggregator API failed');
        }
    }

    async searchHackerNews(query) {
        try {
            // Use Algolia HN Search API for better search results
            const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${this.articlesPerPage}`;
            console.log('Searching HackerNews via Algolia:', searchUrl);
            
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error('Algolia search failed');
            }
            
            const data = await response.json();
            const hits = data.hits || [];
            
            console.log(`Found ${hits.length} search results for "${query}"`);
            
            return hits.map(hit => ({
                title: hit.title,
                description: `Score: ${hit.points || 0} points | Comments: ${hit.num_comments || 0} | ${hit.url ? 'External Link' : 'Discussion'}`,
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                urlToImage: this.generateNewsPlaceholder(hit.title),
                publishedAt: new Date(hit.created_at).toISOString(),
                source: { name: 'Hacker News Search' }
            }));
            
        } catch (error) {
            console.warn('HackerNews search failed:', error.message);
            // Fallback to regular top stories
            return await this.fetchFromNewsAggregator('general', '');
        }
    }

    generateMockNewsData(category, query) {
        // This function is no longer needed, but kept for compatibility
        const sources = ['Reuters', 'BBC News', 'CNN', 'Associated Press', 'The Guardian', 'NPR'];
        
        return Array.from({ length: this.articlesPerPage }, (_, index) => ({
            title: query 
                ? `${query}: Latest developments and analysis from industry experts`
                : `${category.charAt(0).toUpperCase() + category.slice(1)} News: Breaking story ${index + 1}`,
            description: `Comprehensive coverage of ${query || category} with detailed analysis, expert opinions, and the latest updates from our newsroom. This story explores the implications and provides context for understanding the broader impact.`,
            url: '#',
            urlToImage: `https://picsum.photos/400/250?random=${Date.now() + index}`,
            publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
            source: { 
                name: sources[Math.floor(Math.random() * sources.length)] 
            }
        }));
    }

    async fetchFromNewsAPI(category, query) {
        // Using NewsAPI.org with API key
        let url = `${this.NEWS_API_URL}/top-headlines?country=us&pageSize=${this.articlesPerPage}&apiKey=${this.API_KEY}`;
        
        if (query) {
            url = `${this.NEWS_API_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${this.articlesPerPage}&apiKey=${this.API_KEY}&sortBy=publishedAt`;
        } else if (category && category !== 'general') {
            url += `&category=${category}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 426) {
                throw new Error('NewsAPI requires HTTPS. Please use a secure connection.');
            }
            throw new Error(`NewsAPI error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error(data.message || 'NewsAPI returned an error');
        }
        
        return data.articles || [];
    }

    async fetchFromAlternativeAPI(category, query) {
        // Using a free RSS to JSON service as fallback
        const rssUrls = {
            general: 'https://rss.cnn.com/rss/edition.rss',
            technology: 'https://rss.cnn.com/rss/edition_technology.rss',
            business: 'https://rss.cnn.com/rss/money_latest.rss',
            sports: 'https://rss.cnn.com/rss/edition_sport.rss',
            health: 'https://rss.cnn.com/rss/edition_health.rss'
        };
        
        const rssUrl = rssUrls[category] || rssUrls.general;
        const rssToJsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(rssToJsonUrl);
        
        if (!response.ok) {
            throw new Error(`RSS API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error('RSS API returned an error');
        }
        
        return this.formatRSSData(data.items || []);
    }

    formatGNewsData(articles) {
        return articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.image,
            publishedAt: article.publishedAt,
            source: { name: article.source.name }
        }));
    }

    formatNewsAPIData(articles) {
        console.log('Formatting NewsAPI data:', articles.length, 'articles');
        return articles.filter(article => article.title && article.title !== '[Removed]').map((article, index) => {
            const imageUrl = this.getValidImageUrl(article.urlToImage, article.title);
            console.log(`Article ${index + 1}: "${article.title.substring(0, 50)}..." - Image: ${imageUrl}`);
            
            return {
                title: article.title,
                description: article.description || 'Click to read the full article',
                url: article.url,
                urlToImage: imageUrl,
                publishedAt: article.publishedAt,
                source: { name: article.source.name }
            };
        });
    }

    formatGNewsData(articles) {
        console.log('Formatting GNews data:', articles.length, 'articles');
        return articles.map((article, index) => {
            const imageUrl = this.getValidImageUrl(article.image, article.title);
            console.log(`Article ${index + 1}: "${article.title.substring(0, 50)}..." - Image: ${imageUrl}`);
            
            return {
                title: article.title,
                description: article.description || 'Click to read the full article',
                url: article.url,
                urlToImage: imageUrl,
                publishedAt: article.publishedAt,
                source: { name: article.source.name }
            };
        });
    }

    formatRSSData(items) {
        console.log('Formatting RSS data:', items.length, 'items');
        return items.slice(0, this.articlesPerPage).map((item, index) => {
            // Clean up description HTML
            const description = item.description ? 
                item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
                'Click to read the full article';
            
            const imageUrl = this.extractImageFromRSSItem(item, item.title);
            console.log(`RSS Article ${index + 1}: "${item.title.substring(0, 50)}..." - Image: ${imageUrl}`);
            
            return {
                title: item.title,
                description: description,
                url: item.link,
                urlToImage: imageUrl,
                publishedAt: item.pubDate,
                source: { name: this.extractSourceName(item.link) }
            };
        });
    }

    getValidImageUrl(imageUrl, articleTitle = '') {
        console.log('Checking image URL:', imageUrl, 'for article:', articleTitle.substring(0, 30) + '...');
        
        // Check if we have a valid image URL
        if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
            console.log('Valid image URL found:', imageUrl);
            return imageUrl;
        }
        
        console.log('No valid image, generating placeholder for category-based image');
        // If no valid image, use a news-related placeholder with better styling
        return this.generateNewsPlaceholder(articleTitle);
    }

    extractImageFromRSSItem(item, title = '') {
        console.log('Extracting image from RSS item:', JSON.stringify(item, null, 2).substring(0, 500));
        
        // Try multiple ways to extract image from RSS item
        
        // 1. Check enclosure for image
        if (item.enclosure) {
            console.log('Found enclosure:', item.enclosure);
            if (item.enclosure.type && item.enclosure.type.startsWith('image/')) {
                const imageUrl = item.enclosure.link || item.enclosure.url;
                console.log('Image from enclosure:', imageUrl);
                return imageUrl;
            }
        }
        
        // 2. Check thumbnail field
        if (item.thumbnail && item.thumbnail.startsWith('http')) {
            console.log('Image from thumbnail:', item.thumbnail);
            return item.thumbnail;
        }
        
        // 3. Check media:content or media:thumbnail
        if (item['media:content'] && item['media:content'].url) {
            console.log('Image from media:content:', item['media:content'].url);
            return item['media:content'].url;
        }
        
        if (item['media:thumbnail'] && item['media:thumbnail'].url) {
            console.log('Image from media:thumbnail:', item['media:thumbnail'].url);
            return item['media:thumbnail'].url;
        }
        
        // 4. Extract from content/description HTML
        if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src\s*=\s*["\']([^"\']+)["\'][^>]*>/i);
            if (imgMatch && imgMatch[1]) {
                console.log('Image from content HTML:', imgMatch[1]);
                return imgMatch[1];
            }
        }
        
        if (item.description) {
            const imgMatch = item.description.match(/<img[^>]+src\s*=\s*["\']([^"\']+)["\'][^>]*>/i);
            if (imgMatch && imgMatch[1]) {
                console.log('Image from description HTML:', imgMatch[1]);
                return imgMatch[1];
            }
        }
        
        // 5. Look for any image URL in the content
        const content = (item.content || item.description || '').toLowerCase();
        const urlPattern = /(https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp))/gi;
        const imageMatch = content.match(urlPattern);
        if (imageMatch && imageMatch[0]) {
            console.log('Image from content URL pattern:', imageMatch[0]);
            return imageMatch[0];
        }
        
        console.log('No image found in RSS item, using placeholder');
        // 6. If no image found, return a professional news placeholder
        return this.generateNewsPlaceholder(title);
    }

    generateNewsPlaceholder(title = '') {
        // Create a more professional placeholder based on content
        const categories = ['general', 'technology', 'business', 'sports', 'health'];
        const titleLower = title.toLowerCase();
        
        let category = 'general';
        if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('software')) {
            category = 'technology';
        } else if (titleLower.includes('business') || titleLower.includes('market') || titleLower.includes('economy')) {
            category = 'business';
        } else if (titleLower.includes('sport') || titleLower.includes('game') || titleLower.includes('team')) {
            category = 'sports';
        } else if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('hospital')) {
            category = 'health';
        }
        
        // Use Unsplash for category-relevant placeholder images
        const categoryImages = {
            general: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
            technology: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop',
            business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
            sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop',
            health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
        };
        
        return categoryImages[category] || categoryImages.general;
    }

    formatHackerNewsData(stories, category) {
        return stories.filter(story => story && story.title).map(story => ({
            title: story.title,
            description: `Score: ${story.score || 0} points | Comments: ${story.descendants || 0} | ${story.url ? 'External Link' : 'Discussion'}`,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            urlToImage: this.generateNewsPlaceholder(story.title),
            publishedAt: new Date(story.time * 1000).toISOString(),
            source: { name: 'Hacker News' }
        }));
    }

    extractSourceName(url) {
        try {
            const domain = new URL(url).hostname;
            const parts = domain.split('.');
            return parts.length > 1 ? parts[parts.length - 2].toUpperCase() : domain.toUpperCase();
        } catch {
            return 'News Source';
        }
    }

    async fetchMockNews(category, query) {
        // Enhanced mock data that responds to search queries
        const realSources = ['Reuters', 'Associated Press', 'BBC News', 'CNN', 'The Guardian', 'NPR', 'ABC News', 'CBS News'];
        
        let articles = [];
        
        if (query && query.trim()) {
            // Generate search-specific mock articles
            console.log('Generating mock search results for:', query);
            const searchTopics = [
                `${query} Latest Breaking News`,
                `${query} Updates and Analysis`,
                `${query} Industry Impact Report`,
                `${query} Expert Opinion and Commentary`,
                `${query} Market Response and Trends`,
                `${query} Global Implications Study`,
                `${query} Future Outlook and Predictions`,
                `${query} Stakeholder Reactions`,
                `${query} Policy Changes and Regulations`,
                `${query} Technology and Innovation Impact`,
                `${query} Economic Effects Analysis`,
                `${query} Social Media Response Compilation`
            ];

            articles = searchTopics.slice(0, this.articlesPerPage).map((topic, i) => {
                const source = realSources[Math.floor(Math.random() * realSources.length)];
                const hoursAgo = Math.floor(Math.random() * 12) + 1;
                
                return {
                    title: topic,
                    description: `Comprehensive coverage of ${query} from ${source}. This breaking story includes expert analysis, eyewitness accounts, and the latest developments as they unfold. Our team provides in-depth reporting on the implications and context.`,
                    url: '#',
                    urlToImage: this.generateNewsPlaceholder(topic),
                    publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
                    source: { name: source }
                };
            });
        } else {
            // Category-specific mock articles
            const categoryTopics = {
                general: ['Breaking News', 'World Updates', 'International Affairs', 'Current Events'],
                technology: ['Tech Innovation', 'Software Updates', 'AI Development', 'Cybersecurity', 'Startup News'],
                business: ['Market Analysis', 'Economic Trends', 'Corporate News', 'Financial Reports', 'Industry Updates'],
                sports: ['Game Results', 'Player Transfers', 'Championship News', 'Sports Analysis', 'Team Updates'],
                health: ['Medical Breakthrough', 'Health Study', 'Public Health', 'Healthcare News', 'Wellness Tips']
            };

            const topics = categoryTopics[category] || categoryTopics.general;
            
            for (let i = 0; i < this.articlesPerPage; i++) {
                const topic = topics[Math.floor(Math.random() * topics.length)];
                const source = realSources[Math.floor(Math.random() * realSources.length)];
                const hoursAgo = Math.floor(Math.random() * 24) + 1;
                
                articles.push({
                    title: `${topic}: Major developments reported by industry experts`,
                    description: `Comprehensive coverage of ${topic.toLowerCase()} with detailed analysis from ${source}. This developing story includes expert commentary and the latest updates from our newsroom correspondents.`,
                    url: '#',
                    urlToImage: this.generateNewsPlaceholder(topic),
                    publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
                    source: { name: source }
                });
            }
        }

        // Simulate realistic API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log(`Generated ${articles.length} mock articles for search: "${query || 'no query'}"`);
        return articles;
    }

    generateMockNewsData(category, query) {
        const sources = ['Reuters', 'BBC News', 'CNN', 'Associated Press', 'The Guardian', 'NPR'];
        const categories = ['general', 'technology', 'business', 'sports', 'health'];
        
        return Array.from({ length: this.articlesPerPage }, (_, index) => ({
            title: query 
                ? `${query}: Latest developments and analysis from industry experts`
                : `${category.charAt(0).toUpperCase() + category.slice(1)} News: Breaking story ${index + 1}`,
            description: `Comprehensive coverage of ${query || category} with detailed analysis, expert opinions, and the latest updates from our newsroom. This story explores the implications and provides context for understanding the broader impact.`,
            url: '#',
            urlToImage: `https://picsum.photos/400/250?random=${Date.now() + index}`,
            publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
            source: { 
                name: sources[Math.floor(Math.random() * sources.length)] 
            }
        }));
    }

    displayArticles(articles) {
        this.hideLoading();
        this.hideError();
        
        if (!articles || articles.length === 0) {
            this.showEmptyState();
            return;
        }

        this.elements.newsContainer.innerHTML = '';
        
        articles.forEach((article, index) => {
            const articleCard = this.createArticleCard(article, index);
            this.elements.newsContainer.appendChild(articleCard);
        });

        // Add staggered animation
        requestAnimationFrame(() => {
            const cards = this.elements.newsContainer.querySelectorAll('.news-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    }

    createArticleCard(article, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';

        const publishedDate = new Date(article.publishedAt);
        const timeAgo = this.getTimeAgo(publishedDate);
        
        // Use the properly formatted image URL
        const imageUrl = article.urlToImage;
        
        card.innerHTML = `
            <div class="news-image-container">
                <img 
                    src="${imageUrl}" 
                    alt="${article.title}"
                    class="news-image"
                    onerror="this.onerror=null; this.src='${this.generateNewsPlaceholder(article.title)}'"
                    loading="lazy"
                >
                <div class="image-overlay"></div>
            </div>
            <div class="news-content">
                <span class="news-category">${this.currentCategory}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available.'}</p>
                <div class="news-meta">
                    <span class="news-source">${article.source.name}</span>
                    <span class="news-date">
                        <i class="fas fa-clock"></i>
                        ${timeAgo}
                    </span>
                </div>
            </div>
        `;

        // Add click event to open article
        card.addEventListener('click', () => {
            if (article.url && article.url !== '#') {
                window.open(article.url, '_blank');
            } else {
                this.showArticleModal(article);
            }
        });

        return card;
    }

    showArticleModal(article) {
        // Simple modal for demonstration
        alert(`Article: ${article.title}\n\nSource: ${article.source.name}\n\nDescription: ${article.description}\n\nNote: This is a demo article. In a real application, this would link to the full article.`);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMilliseconds = now - date;
        const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
        const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return `${diffInDays}d ago`;
        }
    }

    handleCategoryChange(category) {
        if (this.isLoading || category === this.currentCategory) return;
        
        console.log('Category changed to:', category);
        
        // Update active button
        this.elements.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.currentCategory = category;
        this.currentPage = 1;
        
        // Clear search input when changing category
        this.elements.searchInput.value = '';
        
        // Reset section title
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = 'Latest News';
        }
        
        this.loadNews(category);
    }

    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        console.log('Search triggered with query:', query);
        
        if (!query) {
            // If empty search, reload current category
            this.loadNews(this.currentCategory, '');
            return;
        }

        // Update the section title to show search results
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Search Results for "${query}"`;
        }

        // Reset current page and clear articles for fresh search
        this.currentPage = 1;
        this.allArticles = [];
        
        // Load news with search query
        this.loadNews(this.currentCategory, query);
    }

    refreshNews() {
        if (this.isLoading) return;
        
        const refreshIcon = this.elements.refreshBtn.querySelector('i');
        refreshIcon.style.transform = 'rotate(360deg)';
        
        setTimeout(() => {
            refreshIcon.style.transform = 'rotate(0deg)';
        }, 500);
        
        this.currentPage = 1;
        this.loadNews(this.currentCategory, this.elements.searchInput.value.trim());
    }

    async loadMoreArticles() {
        if (this.isLoading) return;
        
        this.elements.loadMoreBtn.disabled = true;
        this.elements.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        try {
            const moreArticles = await this.fetchNewsData(this.currentCategory, this.elements.searchInput.value.trim());
            const newArticles = moreArticles.slice(this.allArticles.length);
            
            if (newArticles.length > 0) {
                this.allArticles = [...this.allArticles, ...newArticles];
                this.displayArticles(this.allArticles);
            } else {
                this.elements.loadMoreBtn.innerHTML = 'No more articles';
                setTimeout(() => {
                    this.elements.loadMoreContainer.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            console.error('Error loading more articles:', error);
            this.elements.loadMoreBtn.innerHTML = 'Error loading more';
        } finally {
            this.elements.loadMoreBtn.disabled = false;
            setTimeout(() => {
                this.elements.loadMoreBtn.innerHTML = 'Load More Articles';
            }, 1000);
        }
    }

    showLoading() {
        this.elements.loadingContainer.style.display = 'flex';
        this.elements.errorContainer.style.display = 'none';
        this.elements.newsContainer.innerHTML = '';
        this.elements.loadMoreContainer.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingContainer.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.elements.errorContainer.style.display = 'flex';
        this.elements.errorMessage.textContent = message;
        this.elements.newsContainer.innerHTML = '';
        this.elements.loadMoreContainer.style.display = 'none';
    }

    hideError() {
        this.elements.errorContainer.style.display = 'none';
    }

    showEmptyState() {
        this.elements.newsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 1rem;"></i>
                <h3 style="color: #4a5568; margin-bottom: 0.5rem;">No articles found</h3>
                <p style="color: #718096;">Try searching for something else or browse different categories.</p>
            </div>
        `;
    }

    showLoadMoreIfNeeded() {
        // Show load more button if we have articles
        if (this.allArticles.length >= this.articlesPerPage) {
            this.elements.loadMoreContainer.style.display = 'block';
        } else {
            this.elements.loadMoreContainer.style.display = 'none';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Khabari - Dynamic API Integration Started');
    new Khabari();
});

// Add some utility functions for enhanced user experience
window.addEventListener('online', () => {
    console.log('Connection restored');
    if (document.getElementById('newsContainer').innerHTML === '') {
        location.reload();
    }
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    alert('Internet connection lost. Some features may not work properly.');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });
}
