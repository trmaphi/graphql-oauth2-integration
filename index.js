const express = require('express');
const {
  ApolloServer,
  gql,
  SchemaDirectiveVisitor,
  ApolloError,
} = require('apollo-server-express');
const { introspectToken } = require('./mocks');
const { defaultFieldResolver } = require("graphql");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  directive @auth( scope: String ) on FIELD_DEFINITION

  type User {
    _id: ID!
    name: String! @auth(scope: "user:read:*")
    age: Int! @auth(scope: "user:read:*")
  }

  type Query {
    Users: [User]
  }
`;

class AuthDirective extends SchemaDirectiveVisitor {
  // https://www.apollographql.com/docs/apollo-server/schema/creating-directives/#uppercasing-strings
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { scope } = this.args
    field.resolve = async function (...args) {
      const context = args[2];

      if (!context || !context.headers || !context.headers.authorization) {
        throw new ApolloError('Unauthorized', 'UNAUTHORIZED')
      }

      const token = context.headers.authorization;
      const accessToken = token.replace('Bearer ', '');
      const inspectedInfo = introspectToken(accessToken)

      if (!inspectedInfo || !inspectedInfo.active || inspectToken.scope !== scope) {
        throw new ApolloError('Unauthorized', 'UNAUTHORIZED')
      }

      const result = await resolve.apply(this, args);
      return result;
    };
  }
}

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    Users: () => [{
      _id: 'first user id',
      name: 'Truong Ma Phi',
      age: 25,
    }]
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
  },
  context: (integrationContext) => ({
    headers: integrationContext.req.headers
  }),
});

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
