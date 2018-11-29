import React, { Component } from 'react';
import gql from "graphql-tag";
import UUID from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import { Modal, ModalHeader, ModalFooter, ModalBody, Form, FormGroup, Input, Button } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
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
  deleteList(id: $id)
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
    smallModal: false,
    bigModal: false,
    isCardCreate: false,
    isListCreate: false,
    isListUpdate: false,
    cardId: "",
    listId: "",
    commentId: "",
    descriptionId: "",
    comment: "",
    description: "",
    cardTitle: "",
    listName: "",
  }

  toggle = (id, listId, title) => {
    this.setState({
      bigModal: !this.state.bigModal, cardId: id, listId: listId, cardTitle: title
    });
  }

  toggleSmall = (id, listId, title) => {
    this.setState({
      smallModal: !this.state.smallModal, cardId: id, listId: listId, cardTitle: title
    });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleCreateCard = (list) => {
    const isCardCreate = this.state.isCardCreate;
    this.setState({ isCardCreate: !isCardCreate, listId: list.props.children[0].props.children[0].key })
  }

  handleCreateList = () => {
    const isOpen = this.state.isListCreate;
    this.setState({ isListCreate: !isOpen })
  }

  handleUpdateList = (list) => {
    const isOpen = this.state.isListUpdate;
    this.setState({ isListUpdate: !isOpen, listId: list.props.children[0].props.children[0].key })
  }

  createList = async listName => {
    await this.props.createList({
      variables: {
        name: listName
      }
    })
  }

  updateList = async (listName, listId) => {
    await this.props.updateList({
      variables: {
        name: listName,
        id: listId
      }
    })
  }

  deleteList = async list => {
    await this.props.deleteList({
      variables: {
        id: list.props.children[0].props.children[0].key
      }
    })
  }

  createCard = async (cardTitle, listId) => {
    await this.props.createCard({
      variables: {
        title: cardTitle,
        listId: listId
      }
    })
  }

  updateCard = async (cardId, listId, cardTitle) => {
    this.toggleSmall();
    await this.props.updateCard({
      variables: {
        id: cardId,
        listId: listId,
        title: cardTitle,
      }
    })
  }

  deleteCard = async card => {
    await this.props.deleteCard({
      variables: {
        id: card.key,
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
    const listId = this.state.listId;
    const cardId = this.state.cardId;
    const commentId = this.state.commentId;
    const descriptionId = this.state.descriptionId;
    const cardTitle = this.state.cardTitle;
    const listName = this.state.listName;
    const comment = this.state.comment;
    const description = this.state.description;
    const isCardCreate = this.state.isCardCreate;
    const isListCreate = this.state.isListCreate;
    const isListUpdate = this.state.isListUpdate;
    const { list: { loading, lists } } = this.props;
    const { card: { cards } } = this.props;

    if (loading) return null;
    return (
      <div className="page">
        {lists.map(list => list =
          <div className="list">
            <div>
              <div key={list.id}
                onClick={() => this.handleUpdateList(list)}>
                <div style={{ display: isListUpdate && list.id === listId ? 'none' : 'block', cursor: "pointer" }}>
                  {list.name}
                  <span className='icons'>
                    <IconButton className='icon' onClick={() => this.deleteList(list)}><DeleteOutlineIcon /></IconButton>
                  </span>
                </div>
              </div>
              {isListUpdate && list.id === listId && (
                <Form onSubmit={(e) => this.updateList(listName, listId)}>
                  <FormGroup>
                    <Input
                      type="text"
                      name="listName"
                      placeholder={list.name}
                      onChange={this.handleChange}
                      value={listName} />
                  </FormGroup>
                  <div type="submit"></div>
                </Form>
              )}
              {cards.map(card => card.listId === list.id ? card =
                <div key={card.id} className='item'>
                  <div className="title">
                    <span className='cardTitle'
                      onClick={this.toggle.bind(this, card.id, card.listId, card.title)}>
                      {card.title}
                    </span>
                    <span className='icons'>
                      <IconButton className='icon' onClick={this.toggleSmall.bind(this, card.id, card.listId, card.title)}><EditIcon /></IconButton>
                      <Modal
                        isOpen={this.state.smallModal}
                        toggle={this.toggleSmall}
                        size="sm"
                        className={this.props.className}>
                        <ModalHeader
                          toggle={this.toggleSmall}>Change Card Title
                        </ModalHeader>
                        <ModalBody>
                          <Form>
                            <FormGroup>
                              <Input
                                type="textbox"
                                name="cardTitle"
                                placeholder={card.title}
                                onChange={this.handleChange}
                                value={cardTitle} />
                            </FormGroup>
                          </Form>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="primary" onClick={() => this.updateCard(cardId, listId, cardTitle)}>Save</Button>{' '}
                        </ModalFooter>
                      </Modal>
                      <IconButton className='icon' onClick={() => this.deleteCard(card)}><DeleteOutlineIcon /></IconButton>
                    </span>
                  </div>
                  <Modal
                    isOpen={this.state.bigModal}
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
                </div>
                : null)}
            </div>
            <div>
              <div
                className="createCard"
                onClick={() => this.handleCreateCard(list)}>
                <div style={{ display: isCardCreate && list.id === listId ? 'none' : 'block', cursor: "pointer" }}>
                  + Add a card
                </div>
              </div>
              {isCardCreate && list.id === listId && (
                <Form>
                  <FormGroup>
                    <Input
                      type="textarea"
                      name="cardTitle"
                      placeholder="Enter title for this card"
                      onChange={this.handleChange}
                      value={cardTitle} />
                  </FormGroup>
                  <Button size="sm" color="success"
                    onClick={() => this.createCard(cardTitle, listId)}>
                    Add Card
                </Button>
                  <span>
                    <IconButton onClick={() => this.handleCreateCard(list)}><CloseIcon /></IconButton>
                  </span>
                </Form>
              )}
            </div>
          </div>
        )}
        <div>
          <div style={{ display: isListCreate ? 'none' : 'block', cursor: "pointer" }}
            className="createList"
            onClick={() => this.handleCreateList()}>
            <div>
              + Add another List
            </div>
          </div>
          {isListCreate && (
            <Form>
              <FormGroup>
                <Input
                  type="text"
                  name="listName"
                  placeholder="Enter title for this List"
                  onChange={this.handleChange}
                  value={listName} />
              </FormGroup>
              <Button size="sm" color="success"
                onClick={() => this.createList(listName)}>
                Add List
                </Button>
              <span>
                <IconButton onClick={() => this.handleCreateList()}><CloseIcon /></IconButton>
              </span>
            </Form>
          )}
        </div>
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