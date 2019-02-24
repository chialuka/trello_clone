import React from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";


const CardsQuery = gql`
{
  cards{
    id
    listId
    title
  }
}
`;

const createCardMutation = gql`
mutation($title: String!, $listId: String!){
  createCard(title: $title, listId: $listId){
    title
    id
    listId
  }
}
`;

const updateCardMutation = gql`
mutation($title: String!, $listId: String!, $id: ID!){
  updateCard(title: $title, listId: $listId, id: $id){
		id
    title
    listId
  }
}
`;

const deleteCardMutation = gql`
mutation($id: ID!){
  deleteCard(id: $id)
}
`;



class Card extends React.Component {

  handleCreateCard = (list) => {
    const isCardCreate = this.state.isCardCreate;
    this.setState({ isCardCreate: !isCardCreate, listId: list.key })
  }

  
  createCard = async (cardTitle, listId) => {
    await this.props.createCard({
      variables: {
        title: cardTitle,
        listId: listId
      },
      update: (store, { data: { createCard } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CardsQuery });
        // Add our comment from the mutation to the end.
        data.cards.push(createCard);
        this.setState({ cardTitle: "", isCardCreate: false })
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      },
    })
  }

  updateCard = async (cardId, listId, cardTitle) => {
    await this.props.updateCard({
      variables: {
        id: cardId,
        listId: listId,
        title: cardTitle
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CardsQuery });
        // Add our comment from the mutation to the end.
        data.cards = data.cards.map(x => x.id === cardId ?
          {
            id: cardId,
            listId: listId,
            title: cardTitle,
          } : x
        );
        console.log(data.cards);
        this.setState({ cardTitle: "", isCardCreate: false })
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      }),
    })
  }

  deleteCard = async card => {
    await this.props.deleteCard({
      variables: {
        id: card.key,
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CardsQuery });
        // Add our comment from the mutation to the end.
        data.cards = data.cards.filter(x => x.id !== card.key);
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      }),
    })
  }


}

export default compose(
  graphql(CardsQuery, { name: "card" }),
  graphql(createCardMutation, { name: "createCard" }),
  graphql(updateCardMutation, { name: "updateCard" }),
  graphql(deleteCardMutation, { name: "deleteCard" })
) (Card)
