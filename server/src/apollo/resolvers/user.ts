import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { AuthService } from '../../services/auth/authService';
import { Context } from '../context';

export const userResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        return null;
      }
      return context.user;
    },

    user: async (_parent: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      // TODO: Add permission check

      const authService = new AuthService(context.db);
      return authService.getUserById(id);
    },

    users: async (_parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }

      // TODO: Add permission check
      // TODO: Implement filter, limit, offset
      
      return [];
    },
  },

  Mutation: {
    register: async (_parent: any, { input }: any, context: Context) => {
      try {
        const authService = new AuthService(context.db);
        const ipAddress = context.req.ip;
        
        const result = await authService.register(input, ipAddress);
        
        return {
          token: result.token,
          user: result.user
        };
      } catch (error: any) {
        throw new UserInputError(error.message);
      }
    },

    login: async (_parent: any, { input }: any, context: Context) => {
      try {
        // For development/testing purposes
        if (process.env.NODE_ENV === 'development' && 
            input.email === 'admin@example.com' && 
            input.password === 'password123') {
          
          // Return a mock user for development
          return {
            token: 'dev-token-12345',
            user: {
              id: '12345',
              email: 'admin@example.com',
              username: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };
        }
        
        // Normal login flow for production
        const authService = new AuthService(context.db);
        const ipAddress = context.req.ip;
        
        const result = await authService.login(input, ipAddress);
        
        return {
          token: result.token,
          user: result.user
        };
      } catch (error: any) {
        console.error('Login error:', error);
        throw new AuthenticationError(error.message);
      }
    },

    socialLogin: async (_parent: any, { input }: any, context: Context) => {
      try {
        const authService = new AuthService(context.db);
        const ipAddress = context.req.ip;
        
        const result = await authService.socialLogin(input, ipAddress);
        
        return {
          token: result.token,
          user: result.user,
          isNewUser: result.isNewUser
        };
      } catch (error: any) {
        throw new AuthenticationError(error.message);
      }
    },

    logout: async (_parent: any, _args: any, context: Context) => {
      // JWT tokens can't be invalidated, but we can track the logout event
      if (context.user) {
        try {
          // If analytics tracking is available
          if (context.db.analytics) {
            await context.db.analytics.trackEvent({
              userId: context.user.id,
              action: 'user.logout',
              ipAddress: context.req.ip
            });
          }
        } catch (error) {
          console.error('Error tracking logout:', error);
          // Non-critical error, continue with logout
        }
      }
      
      return true;
    },
  },

  User: {
    roles: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement roles resolver
      return [];
    },

    settings: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement settings resolver
      return [];
    },

    engagements: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement engagements resolver
      return [];
    },

    viewPreferences: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement viewPreferences resolver
      return [];
    },

    zoneScope: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement zoneScope resolver
      return [];
    },

    analytics: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement analytics resolver
      // Note: Should be restricted to admins or the user themselves
      return [];
    },

    socialProfiles: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      // TODO: Implement socialProfiles resolver
      // Note: Should be restricted to the user themselves
      return [];
    },
  },
};