const axios = require('axios');
const xml2js = require('xml2js');
const { ApiError } = require('../middleware/error.middleware');

const parser = new xml2js.Parser();

class MediumService {
  constructor() {
    this.cache = {
      posts: null,
      timestamp: null
    };
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  }

  async getLatestPosts() {
    try {
      // Check if cache is valid
      if (this.isCacheValid()) {
        return this.cache.posts;
      }

      // Fetch posts from Medium RSS
      const response = await axios.get(`https://medium.com/feed/@${process.env.MEDIUM_USER_ID}`);
      const posts = this.parseRssFeed(response.data);

      // Update cache
      this.cache = {
        posts,
        timestamp: Date.now()
      };

      return posts;
    } catch (error) {
      throw new ApiError(500, 'Error fetching Medium posts');
    }
  }

  isCacheValid() {
    if (!this.cache.timestamp || !this.cache.posts) {
      return false;
    }
    return Date.now() - this.cache.timestamp < this.CACHE_DURATION;
  }

  parseRssFeed(xmlData) {
    // Simple XML parsing (you might want to use a proper XML parser in production)
    const posts = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;

    let match;
    while ((match = itemRegex.exec(xmlData)) !== null) {
      const item = match[1];
      const title = titleRegex.exec(item)?.[1]?.trim();
      const link = linkRegex.exec(item)?.[1]?.trim();
      const pubDate = pubDateRegex.exec(item)?.[1]?.trim();

      if (title && link && pubDate) {
        posts.push({
          title,
          link,
          pubDate: new Date(pubDate)
        });
      }
    }

    // Sort by date and limit to 5 posts
    return posts
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, 5);
  }

  static async getBlogPosts() {
    try {
      // Use the RSS feed URL with proper headers
      const response = await axios.get('https://medium.com/feed/@deepaksivancyber', {
        headers: {
          'Accept': 'application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const result = await parser.parseStringPromise(response.data);
      const items = result.rss.channel[0].item || [];

      return items.map(item => ({
        title: item.title[0],
        link: item.link[0],
        pubDate: new Date(item.pubDate[0]).toISOString(),
        description: item.description[0],
        categories: item.category ? item.category.map(cat => cat._) : []
      }));
    } catch (error) {
      console.error('Error fetching blog posts:', error.message);
      // Return empty array instead of throwing error
      return [];
    }
  }
}

module.exports = MediumService; 