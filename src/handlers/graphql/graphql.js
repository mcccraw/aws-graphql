const { ApolloServer, gql } = require('apollo-server-lambda');
const fs = require('fs');
const path = require('path');
const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

const { resolverMap } = require('./resolvers/resolvers.js');
const typeDefs = fs.readFileSync(path.join(__dirname, ".", "/resolvers/schema.graphql"))

const server = new ApolloServer({
    typeDefs,
    resolvers: resolverMap,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
});

exports.handler = server.handler();