import React, { Component } from 'react';
import gql from "graphql-tag";
import { graphql, compose } from 'react-apollo';

const ListsQuery = gql`
{
  lists{
    id
    name
    card {
      id
      listId
      title
      description
      comment
    }
  }
}
`;

const CardsQuery = gql`
{
  cards{
    id
    listId
    title
    description
    comment
    list {
      id
      name
    }
  }
}
`;

const createListMutation = gql`
mutation($name: String!){
  createList(name: $name){
    name
    id
  }
}
`;

const updateListMutation = gql`
mutation($name: String!, $id: ID!){
  updateList(name: $name, id: $id)
}
`;

const deleteListMutation = gql`
mutation($id: ID!){
  deleteMutation(id: $id)
}
`;

const createCardMutation = gql`
mutation($title: String!, $listId: String!, $description: String, $comment: String){
  createCard(title: $title, listId: $listId, description: $description, comment: $comment){
    title
    id
    listId
    description
    comment
    list {
      name
    }
  }
}
`;

const updateCardMutation = gql`
mutation($title: String! $listId: String! $description: String $comment: String $id: ID!){
  updateCard(title: $title listId: $listId description: $description comment: $comment id: $id)
}
`;

const deleteCardMutation = gql`
mutation($id: ID!){
  deleteCard(id: $id)
}
`;

class App extends Component {

  render() {
    console.log(this.props.card, this.props.list)
    const { list: { loading, lists } } = this.props;
    //const { card: { loading, cards }} = this.props;
    if (loading) return null;
    return (
      <div className="page">{lists.map(list =>
        <div key={list.id} className="list">
          {list.card.map(card =>
            <div key={card.id}>
              {list.name}
                <li>{card.title}</li>
                <li>{card.comment}</li>
                <li>{card.description}</li>
            </div>)}
        </div>)}
      </div>
    )
  }
}

export default compose(
  graphql(ListsQuery, { name: "list" }),
  graphql(CardsQuery, { name: "card" }),
  graphql(createListMutation, { name: "createList" }),
  graphql(updateListMutation, { name: "updateList" }),
  graphql(deleteListMutation, { name: "deleteList" }),
  graphql(createCardMutation, { name: "createCard" }),
  graphql(updateCardMutation, { name: "updateCard" }),
  graphql(deleteCardMutation, { name: "deleteCard" }))(App)