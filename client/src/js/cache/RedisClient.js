// /src/js/cache/RedisClient.js
class RedisClient {
  constructor() {
    // Determine if we're in browser or server
    this.isBrowser = typeof window !== 'undefined';
    this.prefix = 'salesBlanket:';
    
    if (!this.isBrowser) {
    const redis = require('redis');
    this.client = redis.createClient({
      host: 'localhost',  // Or 'host.docker.internal' if your app is in another container
      port: 6379,         // The port shown in your Docker UI
      // No password needed based on your setup
    });
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.isBrowser) {
        const item = {
          value,
          expiry: ttl ? Date.now() + (ttl * 1000) : null
        };
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
      } else {
        if (ttl) {
          await this.client.setex(key, ttl, value);
        } else {
          await this.client.set(key, value);
        }
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (this.isBrowser) {
        const itemStr = localStorage.getItem(this.prefix + key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(this.prefix + key);
          return null;
        }
        
        return item.value;
      } else {
        return await this.client.get(key);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      if (this.isBrowser) {
        localStorage.removeItem(this.prefix + key);
      } else {
        await this.client.del(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async deletePattern(pattern) {
    try {
      if (this.isBrowser) {
        Object.keys(localStorage)
          .filter(key => key.startsWith(this.prefix) && 
                         key.includes(pattern.replace('*', '')))
          .forEach(key => localStorage.removeItem(key));
      } else {
        // Find keys matching pattern
        const keys = await new Promise((resolve, reject) => {
          this.client.keys(pattern, (err, keys) => {
            if (err) reject(err);
            else resolve(keys);
          });
        });
        
        if (keys && keys.length) {
          await this.client.del(keys);
        }
      }
      return true;
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return false;
    }
  }
}

export default new RedisClient();