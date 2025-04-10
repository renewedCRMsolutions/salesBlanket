import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { typeDefs } from './apollo/schema';
import { resolvers } from './apollo/resolvers';
import { createContext } from './apollo/context';

// Load environment variables
dotenv.config();

async function startServer() {
  // Create Express app
  const app = express();
  
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    plugins: [
      {
        async serverWillStart() {
          console.log('GraphQL server starting...');
        },
      },
    ],
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
      📚 GraphQL Playground available at http://localhost:${PORT}${apolloServer.graphqlPath}
    `);
  });
}

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});