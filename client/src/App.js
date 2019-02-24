import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import UUID from 'uuid/v4';
import { Modal, ModalHeader, ModalFooter, ModalBody, Form, FormGroup, Input, Button } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faHome, faSearch, faPlus, faInfoCircle, faBell } from '@fortawesome/free-solid-svg-icons';


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
    lists: this.props.list,
    cards: this.props.card
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

 
  editFunction = (element) => {
    if (element.comment === undefined) {
      this.setState({ description: element.description, descriptionId: element.id })
    } else {
      this.setState({ comment: element.comment, commentId: element.id })
    }
  }

 

  // onDragOver = e => {
  //   e.preventDefault();
  // }

  // handleListDrop = e => {
  //   e.preventDefault()
  // }

  // handleListDrag = (e) => {

  // }

  // handleCardDrop = e => {
  //   e.preventDefault();
  // }

  // handleCardDrag = () => {

  // }

  onDragEnd = result => {
    console.log(result)
  }

  changeId = () => {
    UUID();
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
    //const changeId = UUID();

    if (loading) return null;
    return (
      <div>
        <div className="topIcons">
          <span className="topHomeIcon"><FontAwesomeIcon icon="home" size="lg" /></span>
          <span className="topTrelIcon"><FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Boards </span>
          <span className="topSearchIcon"><input className="input" /><FontAwesomeIcon icon="search" size="lg" /></span>
          <span className="topTitleIcon"><FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Trello </span>
          <span className="topPlusIcon"><FontAwesomeIcon icon="plus" size="lg" /></span>
          <span className="topInfoIcon"><FontAwesomeIcon icon="info-circle" size="lg" /></span>
          <span className="topBellIcon"><FontAwesomeIcon icon="bell" size="lg" /></span>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="board">
            <Droppable
              droppableId={UUID()}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="singleBoard">
                  {lists.map((list, index) => list =
                    <Draggable
                      key={list.id}
                      list={list}
                      index={index}
                      draggableId={list.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="list">
                          <div>
                            <div className="listName" key={list.id}
                              onClick={() => this.handleUpdateList(list)}>
                              <div style={{ display: isListUpdate && list.key === listId ? 'none' : 'block', cursor: "pointer" }}>
                                {list.props.list.name}
                                <span className='lIcon'>
                                  <IconButton className='icon' onClick={() => this.deleteList(list)}><CloseIcon /></IconButton>
                                </span>
                              </div>
                            </div>
                            {isListUpdate && list.key === listId && (
                              <Form onSubmit={(e) => this.updateList(e, listName, listId)}>
                                <FormGroup>
                                  <Input
                                    type="text"
                                    name="listName"
                                    placeholder={list.props.list.name}
                                    onChange={this.handleChange}
                                    value={listName} />
                                </FormGroup>
                                <div type="submit"></div>
                              </Form>
                            )}
                            {cards.map((card, index) => card.listId === list.key ? card =
                              <Draggable
                                key={card.id}
                                card={card}
                                index={index}
                                draggableId={card.id}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className='item'>
                                    <div className="titles">
                                      <span className='cardTitle'
                                        onClick={this.toggle.bind(this, card.key, card.props.card.listId, card.props.card.title)}>
                                        {card.props.card.title}
                                      </span>
                                      <span className='icons'>
                                        <IconButton className='icon' onClick={this.toggleSmall.bind(this, card.key, card.props.card.listId, card.props.card.title)}><EditIcon /></IconButton>
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
                                                  placeholder={card.props.card.title}
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
                                      toggle={this.toggle}>
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
                                )}
                              </Draggable>
                              : null)}
                          </div>
                          <div>
                            <div
                              className="createCard"
                              onClick={() => this.handleCreateCard(list)}>
                              <div style={{ display: isCardCreate && list.key === listId ? 'none' : 'block', cursor: "pointer" }}>
                                + Add a card
                              </div>
                            </div>
                            {isCardCreate && list.key === listId && (
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
                    </Draggable>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
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
        </DragDropContext>
      </div>
    )
  }
}

library.add(fab, faHome, faSearch, faPlus, faInfoCircle, faBell)

export default (App)