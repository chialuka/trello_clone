import React,{ Component } from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo"


const CommentsQuery = gql`
{
  comments{
    comment
    id
    cardId
  }
}
`;

const createCommentMutation = gql`
mutation($comment: String!, $cardId: String!){
  createComment(comment: $comment, cardId: $cardId){
    comment
    id
    cardId
  }
}
`;

const updateCommentMutation = gql`
mutation($comment: String!, $cardId: String!, $id: ID!){
  updateComment(comment: $comment, cardId: $cardId, id: $id){
    comment
    id
    cardId
  }
}
`;


const deleteCommentMutation = gql`
mutation($id: ID!){
  deleteComment(id: $id)
}
`;

class Comment extends Component {

  submitComment = (comment, cardId, commentId) => {
    if (commentId === '') {
      this.createComment(comment, cardId)
    } else {
      this.updateComment(comment, cardId, commentId)
    }
    this.setState({ commentId: '', comment: '' })
  }

  createComment = async (comment, cardId) => {
    await this.props.createComment({
      variables: {
        comment: comment,
        cardId: cardId
      },
      update: (store, { data: { createComment } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CommentsQuery });
        // Add our comment from the mutation to the end.
        data.comments.push(createComment);
        this.setState({ comment: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: CommentsQuery, data });
      },
    })
  }

  updateComment = async (comment, cardId, commentId) => {
    await this.props.updateComment({
      variables: {
        comment: comment,
        cardId: cardId,
        id: commentId
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CommentsQuery });
        // Add our comment from the mutation to the end.
        data.comments = data.comments.map(x => x.id === cardId ?
          {
            comment: comment,
            id: cardId,
          } : x
        );
        this.setState({ comment: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: CommentsQuery, data });
      }),
    })
  }

  deleteComment = async element => {
    await this.props.deleteComment({
      variables: {
        id: element.id
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CommentsQuery });
        // Add our comment from the mutation to the end.
        data.comments = data.comments.filter(x => x.id !== element.id);
        this.setState({ comment: "" })
        // Write our data back to the cache.
        store.writeQuery({ query: CommentsQuery, data });
      }),
    })
  }
}

export default compose(
  graphql(CommentsQuery, { name: "comment" }),
  graphql(createCommentMutation, { name: "createComment" }),
  graphql(updateCommentMutation, { name: "updateComment" }),
  graphql(deleteCommentMutation, { name: "deleteComment" })
) (Comment)
