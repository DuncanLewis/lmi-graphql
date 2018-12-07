const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');
const _ = require('lodash');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    vacancies(title: String!): [Vacancy]
    vacancy(id: String!): [Vacancy!]!
  }

  type Vacancy {
    id: Int
    title: String
    summary: String
    company: String
    link: String
  }
`;

class LmiAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://api.lmiforall.org.uk/api/v1/";
  }

  async didReceiveResponse(response) {
    if (response.ok) {
      const body = await this.parseBody(response);
      return body;
    } else {
      throw await this.errorFromResponse(response);
    }
  }

  async vacancies(keyword) {
    const vacancies = await this.get(`vacancies/search?keywords=${keyword}`);
    return vacancies;
  }

  async getVacancy(id) {
    const result = await this.get(`vacancies/search?keywords=${id}`);
   return result;
  }
}

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        vacancy: async (_source, { id }, { dataSources }) => dataSources.lmiAPI.getVacancy(id),
        vacancies: async (_source, _args, { dataSources }) => dataSources.lmiAPI.vacancies(args)
    }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    lmiAPI: new LmiAPI()
  }),
  tracing: true
});

server.listen()
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
  .catch(e => console.log(`Error: ${e}`));
