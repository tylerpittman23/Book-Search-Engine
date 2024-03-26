const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4')
// const routes = require('./routes');
const { authMiddleware } = require('./utils/auth');

const { typeDefs, resolvers } = require('./schemas')

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => {
  try {
    await server.start();

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use('/graphql', expressMiddleware(
      server, 
      { context: authMiddleware }
    ));

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));
    }

    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`API listening at http://localhost:${PORT}/graphql`)
      })
    })
  } catch(err) {
    console.error(`Error starting server: ${err}`);
  }
}

startApolloServer();
