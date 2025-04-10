import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import express, { Request } from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './apollo/schema';
import { resolvers } from './apollo/resolvers';
import { createContext } from './apollo/context';
import { authMiddleware } from './utils/auth';
import { json } from 'body-parser';

// Load environment variables
dotenv.config();

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function startServer() {
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors());
  app.use(json());
  app.use(authMiddleware);
  
  // Serve static files for login page
  app.use(express.static('public'));
  
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    // Set Apollo Server options correctly
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      {
        async serverWillStart() {
          console.log('GraphQL server starting...');
        },
      },
    ],
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Login status endpoint
  app.get('/auth/status', (req: Request, res) => {
    res.json({
      authenticated: !!req.user,
      user: req.user || null
    });
  });

  // Apply middleware to Express app
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Start the server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`
      🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}
      📚 GraphQL Studio available at http://localhost:${PORT}${apolloServer.graphqlPath}
      🔑 Login page available at http://localhost:${PORT}/login.html
    `);
  });
}

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});