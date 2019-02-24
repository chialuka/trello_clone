import React from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const DescriptionsQuery = gql`
{
  descriptions{
    description
    id
    cardId
  }
}
`;


const createDescriptionMutation = gql`
mutation($description: String!, $cardId: String!){
  createDescription(description: $description, cardId: $cardId){
    description
    id
    cardId
  }
}
`;


const updateDescriptionMutation = gql`
mutation($description: String!, $cardId: String!, $id: ID!){
  updateDescription(description: $description, cardId: $cardId, id: $id){
    description
    id
    cardId
  }
}
`;


const deleteDescriptionMutation = gql`
mutation($id: ID!){
  deleteDescription(id: $id)
}
`;


class Description extends React.Component {

  submitDescription = (description, cardId, descriptionId) => {
    if (descriptionId === '') {
      this.createDescription(description, cardId)
    } else {
      this.updateDescription(description, cardId, descriptionId);
    }
    this.setState({ description: '', descriptionId: '' })
  }

  

  createDescription = async (description, cardId) => {
    await this.props.createDescription({
      variables: {
        description: description,
        cardId: cardId
      },
      update: (store, { data: { createDescription } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: DescriptionsQuery });
        // Add our comment from the mutation to the end.
        data.descriptions.push(createDescription);
        this.setState({ description: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: DescriptionsQuery, data });
      },
    })
  }

  updateDescription = async (description, cardId, descriptionId) => {
    await this.props.updateDescription({
      variables: {
        description: description,
        cardId: cardId,
        id: descriptionId
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: DescriptionsQuery });
        // Add our comment from the mutation to the end.
        data.descriptions = data.descriptions.map(x => x.id === cardId ?
          {
            description: description,
            cardId: cardId,
          } : x
        );
        this.setState({ description: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: DescriptionsQuery, data });
      }),
    })
  }

  deleteDescription = async element => {
    await this.props.deleteDescription({
      variables: {
        id: element.id
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: DescriptionsQuery });
        // Add our comment from the mutation to the end.
        this.setState({ description: "" })
        data.descriptions = data.descriptions.filter(x => x.id !== element.id);
        // Write our data back to the cache.
        store.writeQuery({ query: DescriptionsQuery, data });
      }),
    })
  }
}

export default compose(
  graphql(DescriptionsQuery, { name: "description" }),
  graphql(createDescriptionMutation, { name: "createDescription" }),
  graphql(updateDescriptionMutation, { name: "updateDescription" }),
  graphql(deleteDescriptionMutation, { name: "deleteDescription" }))(Description)