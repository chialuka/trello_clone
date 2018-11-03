const { GraphQLServer } = require('graphql-yoga');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/test2", { useNewUrlParser: true });

const List = mongoose.model("List", {
  name: String,
  card: [{
    listId: String,
  }]
});

const Card = mongoose.model("Card", {
  title: String,
  description: String,
  comment: String,
  listId: String,
});

const typeDefs = `
  type Query {
    lists: [List]
    cards: [Card]
  }

  type List {
    id: ID!
    name: String!
    card: [Card]
  }

  type Card {
    id: ID!
    listId: String!
    title: String!
    description: String
    comment: String
    list: List
  }

  type Mutation {
    createList(name: String): List!
    updateList(id: ID! name: String!): List!
    deleteList(id: ID!): Boolean!

    createCard(title: String listId: String description: String, comment: String): Card!
    updateCard(id: ID! listId: String title: String, description: String, comment: String): Card!
    deleteCard(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    lists: () => List.find(),
    cards: () => Card.find()
  },

  List: {
    card: async ({id}) => {
      //console.log(id)
      //const li = id.toString();
      return (await Card.find({listId: id}));
    }
  },

  Card: {
    list: async ({listId}) => {
      //console.log(listId)
      return (await List.findOne({_id: listId}));
    }
  },

  Mutation: {
    createList: async (_, { name }) => {
      const list = new List({ name });
      await list.save();
      return list;
    },
    updateList: async (_, { id, name }) => {
      const list = List.findOne({_id: id})
      await List.findOneAndUpdate( {_id: id}, {name} );
      return list;
    },
    deleteList: async (_, { id}) => {
      await List.findOneAndDelete({_id: id});
      return true;
    },

    createCard: async (_, { title, description, comment, listId }) => {
      const card = new Card({ title, description, comment , listId });
      await card.save();
      //await List.findOneAndUpdate({_id: listId});
      return card;
    },
    updateCard: async (_, { id, title, description, comment, listId }) => {
      await Card.findOneAndUpdate({_id: id}, { title, description, comment, listId });
      //await List.findOneAndUpdate({_id: listId});
      const card = Card.findOne({_id: id});
      return card;
    },
    deleteCard: async (_, { id }) => {
      await Card.findOneAndDelete({_id: id});
      return true;
    }
  }
}

const server = new GraphQLServer({ typeDefs, resolvers });
mongoose.connection.once("open", function() {
  server.start()
} 
)
