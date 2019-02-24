import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from "graphql-tag";


const ListsQuery = gql`
{
  lists{
    id
    name
    card {
      id
      listId
      title
      descriptions {
        description
        id
        cardId
      }
      comments {
        comment
        id
        cardId
      }
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
  updateList(name: $name, id: $id){
    id
    name
  }
}
`;

const deleteListMutation = gql`
mutation($id: ID!){
  deleteList(id: $id)
}
`;

class List extends Component {

  handleCreateList = () => {
    const isOpen = this.state.isListCreate;
    this.setState({ isListCreate: !isOpen })
  }

  handleUpdateList = (list) => {
    const isOpen = this.state.isListUpdate;
    this.setState({ isListUpdate: !isOpen, listId: list.key })
  }

  createList = async listName => {
    await this.props.createList({
      variables: {
        name: listName
      },
      update: (store, { data: { createList } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        data.lists.push(createList);
        this.setState({ listName: "", isListCreate: false })
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      },
    })
  }

  updateList = async (e, listName, listId) => {
    e.preventDefault();
    await this.props.updateList({
      variables: {
        name: listName,
        id: listId
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        console.log(data.lists)
        data.lists = data.lists.map(x => x.id === listId ?
          {
            name: listName,
            id: listId
          } : x
        );
        this.setState({ listName: "", isListCreate: false })
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      }),
    })
  }

  deleteList = async list => {
    await this.props.deleteList({
      variables: {
        id: list.key
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        data.lists = data.lists.filter(x => x.id !== list.key);
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      }),
    })
  }

}


export default compose(
    graphql(ListsQuery, { name: "list" }),
    graphql(createListMutation, { name: "createList" }),
    graphql(updateListMutation, { name: "updateList" }),
    graphql(deleteListMutation, { name: "deleteList" }))(List)
