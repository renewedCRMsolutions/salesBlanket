/**
 * GraphQLService.js
 *
 * Service for handling GraphQL queries and mutations with Redis caching
 */

import RedisClient from '../cache/RedisClient.js';
import { EventBus } from '../events/EventBus.js';

class GraphQLService {
  constructor(apiUrl = null, redisClient = null) {
    this.apiUrl = apiUrl || this._determineApiUrl();
    this.redisClient = redisClient || RedisClient;
    this.eventBus = EventBus;
  }

  _determineApiUrl() {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${host}${port ? `:${port}` : ''}/graphql`;
  }

  /**
   * Execute a GraphQL query with caching
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @param {Object} options - Query options including caching
   * @returns {Promise<Object>} Query result
   */
  async query(query, variables = {}, options = { cache: true, ttl: 300 }) {
    try {
      // Generate cache key
      const cacheKey = this._generateCacheKey(query, variables);

      // Try to get from cache if enabled
      if (options.cache) {
        const cachedResult = await this.redisClient.get(cacheKey);
        if (cachedResult) {
          this.eventBus.emit('cache:hit', { type: 'graphql', key: cacheKey });
          return JSON.parse(cachedResult);
        }
      }

      // Execute the query
      const result = await this._executeRequest(query, variables);

      // Store in cache if enabled
      if (options.cache && result) {
        await this.redisClient.set(cacheKey, JSON.stringify(result), options.ttl);
        this.eventBus.emit('cache:store', { type: 'graphql', key: cacheKey });
      }

      return result;
    } catch (error) {
      this.eventBus.emit('error:graphql', { error, query, variables });
      console.error('Error executing GraphQL query:', error);
      throw error;
    }
  }

  /**
   * Execute actual network request
   * @private
   */
  async _executeRequest(query, variables) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(localStorage.getItem('token') && {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      credentials: 'include',
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Error:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  /**
   * Generate a cache key for the query
   * @private
   */
  _generateCacheKey(query, variables) {
    // Normalize query by removing whitespace
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    // Create key with query and stringified variables
    return `graphql:${normalizedQuery}:${JSON.stringify(variables)}`;
  }

  /**
   * Execute a GraphQL mutation (no caching)
   */
  async mutate(mutation, variables = {}) {
    // Mutations should never be cached
    return this.query(mutation, variables, { cache: false });
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidateCache(pattern) {
    await this.redisClient.deletePattern(pattern);
    this.eventBus.emit('cache:invalidate', { type: 'graphql', pattern });
  }

  // Domain-specific methods would follow here with proper caching strategies
  // For example:
  async getSalesTracks(filter = {}, limit = 10, offset = 0) {
    try {
      const { GET_SALES_TRACKS } = await import('./graphql/salesTrackQueries.js');
      return this.query(GET_SALES_TRACKS, { filter, limit, offset }).then(
        (data) => data.salesTracks
      );
    } catch (error) {
      console.error('Error fetching sales tracks:', error);
      throw error;
    }
  }
}

// Create and export the service
const graphQLService = new GraphQLService();
export default graphQLService;

// Also export the class for testing or custom instances
export { GraphQLService };
