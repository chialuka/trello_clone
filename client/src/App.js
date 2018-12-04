import React, { Component } from 'react';
import gql from "graphql-tag";
import UUID from 'uuid/v4';
import { graphql, compose } from 'react-apollo';
import { Modal, ModalHeader, ModalFooter, ModalBody, Form, FormGroup, Input, Button } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faHome, faSearch, faPlus, faInfoCircle, faBell } from '@fortawesome/free-solid-svg-icons'


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


const CardsQuery = gql`
{
  cards{
    id
    listId
    title
  }
}
`;

const CommentsQuery = gql`
{
  comments{
    comment
    id
    cardId
  }
}
`;

const DescriptionsQuery = gql`
{
  descriptions{
    description
    id
    cardId
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
    dragging: undefined,
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
    e.preventDefault();
  }

  deleteList = async list => {
    const id = list.props.children[0].props.children[0].key
    await this.props.deleteList({
      variables: {
        id: id
      },
      update: (store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        data.lists = data.lists.filter(x => x.id !== id);
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      }),
    })
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

  sort= (list, dragging) => {
    const state = this.state;
    this.props.list.lists = list;
    state.dragging = dragging;
    this.setState({state});
  }


  onDragOver = e => {
    e.preventDefault();
    const i = e.currentTarget.dataset.id;
    const dragging = (i === this.state.dragging) ? "dragging" : "";
    this.setState({ dragging: dragging})
  }

  handleListDrop = e => {
    e.preventDefault()
  }

  handleListDrag = (e) => {
    e.preventDefault();
    const dragged = Number(e.currentTarget.dataset.id)
    console.log(dragged)
    const items = this.props.list.lists;
    const over = e.currentTarget;
    console.log(over)
    const dragging = this.state.dragging;
    const from = isFinite(dragging) ? dragging : dragged;
    console.log(dragging)
    let to = Number(over.dataset.id);
    console.log(to)

    items.splice(to, 0, items.splice(from,1)[0]);
    this.sort(items, to);
  }

  handleCardDrop = e => {
    e.preventDefault()
  }

  handleCardDrag = () => {

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
    const { description: { descriptions } } = this.props;
    const { comment: { comments } } = this.props;

    if (loading) return null;
    return (
      <div className="board">
        <div className="topIcons">
          <span className="topHomeIcon"><FontAwesomeIcon icon="home" size="lg" /></span>
          <span className="topTrelIcon"><FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Boards </span>
          <span className="topSearchIcon"><input className="input" /><FontAwesomeIcon icon="search" size="lg" /></span>
          <span className="topTitleIcon"><FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Trello </span>
          <span className="topPlusIcon"><FontAwesomeIcon icon="plus" size="lg" /></span>
          <span className="topInfoIcon"><FontAwesomeIcon icon="info-circle" size="lg" /></span>
          <span className="topBellIcon"><FontAwesomeIcon icon="bell" size="lg" /></span>
        </div>
        <div
          className="singleBoard"
          onDragOver={(e) => this.onDragOver(e)}
          onDrop={(e) => this.handleListDrop(e)}>
          {lists.map((list, i) => list =
            <div
              className="list"
              key={list.id}
              data-id={i}
              draggable
              onDrag={(e) => this.handleListDrag(e)}
              onDragOver={(e) => this.onDragOver(e)}
              onDrop={(e) => this.handleCardDrop(e)}>
              <div>
                <div className="listName" key={list.id}
                  onClick={() => this.handleUpdateList(list)}>
                  <div style={{ display: isListUpdate && list.id === listId ? 'none' : 'block', cursor: "pointer" }}>
                    {list.name}
                    <span className='lIcon'>
                      <IconButton className='icon' onClick={() => this.deleteList(list)}><CloseIcon /></IconButton>
                    </span>
                  </div>
                </div>
                {isListUpdate && list.id === listId && (
                  <Form onSubmit={(e) => this.updateList(e, listName, listId)}>
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
                {cards.map((card, i) => card.listId === list.id ? card =
                  <div
                    className='item'
                    key={card.id}
                    data-id={i}
                    draggable
                    onDrag={(e) => this.handleCardDrag(e)}>
                    <div className="titles">
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
                      {lists.map(list => list.card.map(card => card.id === cardId ? card =
                        <div key={card.id} className="detailsBox">
                          <ModalHeader toggle={this.toggle} id={UUID()}>{card.title}
                            <p> in List: {list.name}</p>
                          </ModalHeader>
                          <ModalBody>
                            <div className="description">Description:
                            {descriptions.map(element => element.cardId === card.id ?
                                <li key={element.id}
                                  onClick={() => this.editFunction(element)}>
                                  {element.description}
                                  <span className='dIcon'>
                                    <IconButton className='icon' onClick={() => this.deleteDescription(element)}><CloseIcon /></IconButton>
                                  </span>
                                </li>
                                : null)}
                              <Form>
                                <FormGroup>
                                  <Input
                                    type="textarea"
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
                            {comments.map(element => element.cardId === card.id ?
                                <li key={element.id}
                                  onClick={() => this.editFunction(element)}>
                                  {element.comment}
                                  <span className='cIcon'>
                                    <IconButton className='icon' onClick={() => this.deleteComment(element)}><CloseIcon /></IconButton>
                                  </span>
                                </li>
                                : null)}
                              <Form>
                                <FormGroup>
                                  <Input
                                    type="textarea"
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
                        : null))}
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
          <div className="newList">
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
      </div>
    )
  }
}

library.add(fab, faHome, faSearch, faPlus, faInfoCircle, faBell)

export default compose(
  graphql(ListsQuery, { name: "list" }),
  graphql(CardsQuery, { name: "card" }),
  graphql(CommentsQuery, { name: "comment" }),
  graphql(DescriptionsQuery, { name: "description" }),
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