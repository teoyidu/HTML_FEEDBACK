// cache-middleware.js - Simple in-memory caching for API endpoints

// Create a simple in-memory cache with TTL support
const cache = {
  data: new Map(),
  get: function(key) {
    const item = this.data.get(key);
    if (!item) return null;
    
    // Check if the cache entry is expired
    if (item.expiry && item.expiry < Date.now()) {
      this.data.delete(key);
      return null;
    }
    
    return item.value;
  },
  set: function(key, value, ttlSeconds = 60) {
    this.data.set(key, {
      value: value,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    });
  },
  clear: function() {
    this.data.clear();
  },
  clearPattern: function(pattern) {
    for (const key of this.data.keys()) {
      if (key.includes(pattern)) {
        this.data.delete(key);
      }
    }
  }
};

// Middleware factory function
function cacheMiddleware(ttlSeconds = 60) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key from URL and query params
    const cacheKey = req.originalUrl || req.url;
    
    // Check cache
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache hit for: ${cacheKey}`);
      return res.json(cachedResponse);
    }
    
    // Override res.json method to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttlSeconds);
      }
      
      // Call the original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Clear cache when data is modified
function clearCacheMiddleware(pattern) {
  return (req, res, next) => {
    // Store the original end function
    const originalEnd = res.end;
    
    // Override the end function
    res.end = function(...args) {
      // If response is successful, clear relevant cache
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.clearPattern(pattern);
        console.log(`Cache cleared for pattern: ${pattern}`);
      }
      
      // Call the original end function
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

module.exports = { 
  cacheMiddleware, 
  clearCacheMiddleware,
  cache 
};
