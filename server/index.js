const { GraphQLServer } = require('graphql-yoga');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/test2", { useNewUrlParser: true, useFindAndModify: false });

const List = mongoose.model("List", {
  name: String,
  card: [{
    listId: String,
  }]
});

const Card = mongoose.model("Card", {
  title: String,
  listId: String,
  comments: [{
    comment: String,
  }],
  descriptions: [{
    description: String,
  }],
});

const Comment = mongoose.model("Comment", {
  comment: String,
  cardId: String,
});

const Description = mongoose.model("Description", {
  description: String,
  cardId: String,
});

const typeDefs = `
  type Query {
    lists: [List]
    cards: [Card]
    comments: [Comment]
    descriptions: [Description]
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
    descriptions: [Description]
    comments: [Comment]
    list: List
  }

  type Comment {
    id: ID!
    comment: String!
    cardId : String!
  }

  type Description {
    id: ID!
    description: String!
    cardId: String!
  }

  type Mutation {
    createList(name: String!): List!
    updateList(id: ID! name: String!): List!
    deleteList(id: ID!): Boolean!

    createCard(title: String! listId: String): Card!
    updateCard(id: ID! listId: String! title: String!): Card!
    deleteCard(id: ID!): Boolean!

    createComment(cardId: String! comment: String!): Comment!
    updateComment(id: ID! cardId: String! comment: String!): Comment!
    deleteComment(id: ID!): Boolean!

    createDescription(cardId: String! description: String!): Description!
    updateDescription(id: ID! cardId: String! description: String!): Description!
    deleteDescription(id: ID!): Boolean!

  }
`;

const resolvers = {
  Query: {
    lists: () => List.find(),
    cards: () => Card.find(),
    comments: () => Comment.find(),
    descriptions: () => Description.find(),
  },

  List: {
    card: async ({id}) => {
      return (await Card.find({listId: id}));
    }
  },

  Card: {
    list: async ({listId}) => {
      return (await List.findOne({_id: listId}));
    },
    comments: async ({id}) => {
      return (await Comment.find({cardId: id}))
    },
    descriptions: async ({id}) => {
      return (await Description.find({cardId: id}))
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


    createCard: async (_, { title, listId }) => {
      const card = new Card({ title, listId });
      await card.save();
      return card;
    },
    updateCard: async (_, { id, title, listId }) => {
      const card = Card.findOne({_id: id});
      await Card.findOneAndUpdate({_id: id}, { title, listId });
      return card;
    },
    deleteCard: async (_, { id }) => {
      await Card.findOneAndDelete({_id: id});
      return true;
    },


    createComment: async (_, { comment, cardId }) => {
      const commentStr = new Comment({ comment , cardId });
      await commentStr.save();
      return commentStr;
    },
    updateComment: async (_, { id, comment, cardId  }) => {
      const commentStr = Comment.findOne({_id: id});
      await Comment.findOneAndUpdate({_id: id}, { comment, cardId  });
      return commentStr;
    },
    deleteComment: async (_, { id }) => {
      await Comment.findOneAndDelete({_id: id});
      return true;
    },


    createDescription: async (_, { description, cardId }) => {
      const descriptionStr = new Description({ description, cardId });
      await descriptionStr.save();
      return descriptionStr;
    },

    updateDescription: async (_, { id, description, cardId }) => {
      await Description.findOneAndUpdate({_id: id}, { description, cardId });
      const descriptionStr = Description.findOne({_id: id});
      return descriptionStr;
    },

    deleteDescription: async (_, { id }) => {
      await Description.findOneAndDelete({_id: id});
      return true;
    },
  }
}

const server = new GraphQLServer({ typeDefs, resolvers });
mongoose.connection.once("open", function() {
  server.start()
} 
)
