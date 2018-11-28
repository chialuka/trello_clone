import React, { Component } from 'react';
import gql from "graphql-tag";
import UUID from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Input, Button } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

const ListsQuery = gql`
{
  lists{
    id
    name
    card {
      id
      listId
      title
    }
  }
}
`;

const CardsQuery = gql`
{
  cards{
    id
    id2
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
  updateList(name: $name, id: $id){
    id
    name
  }
}
`;

const deleteListMutation = gql`
mutation($id: ID!){
  deleteMutation(id: $id)
}
`;

const createCardMutation = gql`
mutation($title: String!, $listId: String!, $id2: Int!){
  createCard(title: $title, listId: $listId, id2: $id2){
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
    description
    comment
  }
}
`;

const deleteCardMutation = gql`
mutation($id: ID!){
  deleteCard(id: $id)
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


class App extends Component {
  state = {
    modal: false,
    cardId: '',
    listId: '',
    commentId: '',
    descriptionId: '',
    title: '',
    comment: "",
    description: "",
  }

  toggle = (id, listId, title) => {
    this.setState({
      modal: !this.state.modal, cardId: id, listId: listId, title: title
    });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  updateCard = async (openId, listId, title) => {
    await this.props.updateCard({
      variables: {
        id: openId,
        listId: listId,
        title: title,
      }
    })
  }

  deleteCard = async card => {
    await this.props.deleteCard({
      variables: {
        id: card.key
      }
    })
  }


  editFunction = (element) => {
    if (element.comment === undefined) {
      this.setState({ description: element.description, descriptionId: element.id })
    } else {
      this.setState({ comment: element.comment, commentId: element.id })
    }
  }

  submitComment = (comment, cardId, commentId) => {
    if (commentId === '') {
      this.createComment(comment, cardId)
    } else {
      this.updateComment(comment, cardId, commentId)
    }
    this.setState({ commentId: '', comment: '' })
  }

  submitDescription = (description, cardId, descriptionId) => {
    if (descriptionId === '') {
      this.createDescription(description, cardId)
    } else {
      this.updateDescription(description, cardId, descriptionId);
    }
    this.setState({ description: '', descriptionId: '' })
  }

  createComment = async (comment, cardId) => {
    await this.props.createComment({
      variables: {
        comment: comment,
        cardId: cardId
      }
    })
  }

  updateComment = async (comment, cardId, commentId) => {
    await this.props.updateComment({
      variables: {
        comment: comment,
        cardId: cardId,
        id: commentId
      }
    })
  }

  deleteComment = async element => {
    await this.props.deleteComment({
      variables: {
        id: element.id
      }
    })
  }

  createDescription = async (description, cardId) => {
    await this.props.createDescription({
      variables: {
        description: description,
        cardId: cardId
      }
    })
  }

  updateDescription = async (description, cardId, descriptionId) => {
    await this.props.updateDescription({
      variables: {
        description: description,
        cardId: cardId,
        id: descriptionId
      }
    })
  }

  deleteDescription = async element => {
    await this.props.deleteDescription({
      variables: {
        id: element.id
      }
    })
  }


  render() {
    const cardId = this.state.cardId;
    const commentId = this.state.commentId;
    const descriptionId = this.state.descriptionId;
    const comment = this.state.comment;
    const description = this.state.description;
    const { list: { loading, lists } } = this.props;
    const { card: { cards } } = this.props;
    if (loading) return null;
    return (
      <div className="page">{lists.map(list => list.card.length !== 0 ? list =
        <div key={list.name} className="list">
          {list.name}
          {cards.map(card => card.listId === list.id ? card =
            <div key={card.id2} className='item'>
              <p className="title">
                <span className='cardTitle'
                  onClick={this.toggle.bind(this, card.id, card.listId, card.title)}>
                  {card.title}
                </span>
                <span className='icons'>
                  <IconButton className='icon'><EditIcon /></IconButton>
                  <IconButton className='icon' onClick={() => this.deleteCard(card)}><DeleteOutlineIcon /></IconButton>
                </span>
              </p>
              <Modal
                isOpen={this.state.modal}
                toggle={this.toggle}
              >
                {cards.map(card => card.id === cardId ? card =
                  <div>
                    <ModalHeader toggle={this.toggle} key={card.id} id={UUID()}>{card.title}
                      <p> in List: {card.list.name}</p>
                    </ModalHeader>
                    <ModalBody>
                      <div className="description">Description:
                        {card.descriptions.map(element =>
                          <li key={element.id}
                            onClick={() => this.editFunction(element)}>
                            {element.description}
                            <span className='icons'>
                              <IconButton className='icon' onClick={() => this.deleteDescription(element)}><DeleteOutlineIcon /></IconButton>
                            </span>
                          </li>
                        )}
                        <Form>
                          <FormGroup>
                            <Input
                              type="text"
                              name="description"
                              placeholder="Add more description"
                              onChange={this.handleChange}
                              value={description} />
                          </FormGroup>
                          <Button size="sm"
                            onClick={() => this.submitDescription(description, cardId, descriptionId)}>Save</Button>
                        </Form>
                      </div>
                      <div className="comment">Comments:
                        {card.comments.map(element =>
                          <li key={element.id}
                            onClick={() => this.editFunction(element)}>
                            {element.comment}
                            <span className='icons'>
                              <IconButton className='icon' onClick={() => this.deleteComment(element)}><DeleteOutlineIcon /></IconButton>
                            </span>
                          </li>
                        )}
                        <Form>
                          <FormGroup>
                            <Input
                              type="text"
                              name="comment"
                              placeholder="Add more comments"
                              onChange={this.handleChange}
                              value={comment} />
                          </FormGroup>
                          <Button size="sm"
                            onClick={() => this.submitComment(comment, cardId, commentId)}>Save</Button>
                        </Form>
                      </div>
                    </ModalBody>
                  </div>
                  : null)}
              </Modal>
            </div> : null)}
        </div> : false)}
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
  graphql(deleteCardMutation, { name: "deleteCard" }),
  graphql(createCommentMutation, { name: "createComment" }),
  graphql(updateCommentMutation, { name: "updateComment" }),
  graphql(deleteCommentMutation, { name: "deleteComment" }),
  graphql(createDescriptionMutation, { name: "createDescription" }),
  graphql(updateDescriptionMutation, { name: "updateDescription" }),
  graphql(deleteDescriptionMutation, { name: "deleteDescription" }))(App)