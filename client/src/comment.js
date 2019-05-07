import React, { Component } from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { Form, FormGroup, Input, Button } from "reactstrap";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const CommentsQuery = gql`
  {
    comments {
      comment
      id
      cardId
    }
  }
`;

const createCommentMutation = gql`
  mutation($comment: String!, $cardId: String!) {
    createComment(comment: $comment, cardId: $cardId) {
      comment
      id
      cardId
    }
  }
`;

const updateCommentMutation = gql`
  mutation($comment: String!, $cardId: String!, $id: ID!) {
    updateComment(comment: $comment, cardId: $cardId, id: $id) {
      comment
      id
      cardId
    }
  }
`;

const deleteCommentMutation = gql`
  mutation($id: ID!) {
    deleteComment(id: $id)
  }
`;

class Comment extends Component {
  state = {
    comment: "",
    commentId: "",
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  editFunction = element => {
    this.setState({ comment: element.comment, commentId: element.id });
  };

  submitComment = (comment, cardId, commentId) => {
    if (commentId === "") {
      this.createComment(comment, cardId);
    } else {
      this.updateComment(comment, cardId, commentId);
    }
    this.setState({ commentId: "", comment: "" });
  };

  createComment = async (comment, cardId) => {
    await this.props.createComment({
      variables: {
        comment: comment,
        cardId: cardId
      },
      update: (store, { data: { createComment } }) => {
        const data = store.readQuery({ query: CommentsQuery });
        data.comments.push(createComment);
        this.setState({ comment: "" });
        store.writeQuery({ query: CommentsQuery, data });
      }
    });
  };

  updateComment = async (comment, cardId, commentId) => {
    await this.props.updateComment({
      variables: {
        comment: comment,
        cardId: cardId,
        id: commentId
      },
    });
  };

  deleteComment = async element => {
    await this.props.deleteComment({
      variables: {
        id: element.id
      },
      update: store => {
        const data = store.readQuery({ query: CommentsQuery });
        data.comments = data.comments.filter(x => x.id !== element.id);
        this.setState({ comment: "" });
        store.writeQuery({ query: CommentsQuery, data });
      }
    });
  };

  render() {
    const {
      data: { loading, error, comments },
      cardId
    } = this.props;
    const { comment, commentId } = this.state;

    if (loading || error) return null;
    return (
      <div className="comment">
        Comments:
        {comments.map(element =>
          element.cardId === cardId ? (
            <div key={element.id} onClick={() => this.editFunction(element)}>
              {element.comment}
              <span className="cIcon">
                <IconButton
                  className="icon"
                  onClick={() => this.deleteComment(element)}
                >
                  <CloseIcon />
                </IconButton>
              </span>
            </div>
          ) : null
        )}
        <Form>
          <FormGroup>
            <Input
              type="textarea"
              name="comment"
              placeholder="Add more comments"
              onChange={this.handleChange}
              value={comment}
            />
          </FormGroup>
          <Button
            size="sm"
            onClick={() => this.submitComment(comment, cardId, commentId)}
          >
            Save
          </Button>
        </Form>
      </div>
    );
  }
}

export default compose(
  graphql(CommentsQuery),
  graphql(createCommentMutation, { name: "createComment" }),
  graphql(updateCommentMutation, { name: "updateComment" }),
  graphql(deleteCommentMutation, { name: "deleteComment" })
)(Comment);
