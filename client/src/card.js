import React from 'react';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Button
} from 'reactstrap';
import { Draggable } from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Description from './description';
import Comment from './comment';
import UUID from 'uuid/v4';

const CardsQuery = gql`
  {
    cards {
      id
      listId
      title
      list {
        name
        id
      }
      descriptions {
        description
        id
      }
      comments {
        comment
        id
      }
    }
  }
`;

const createCardMutation = gql`
  mutation($title: String!, $listId: String!) {
    createCard(title: $title, listId: $listId) {
      id
      listId
      title
      list {
        name
        id
      }
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
`;

const updateCardMutation = gql`
  mutation($title: String!, $listId: String!, $id: ID!) {
    updateCard(title: $title, listId: $listId, id: $id) {
      id
      listId
      title
      list {
        name
        id
      }
    }
  }
`;

const deleteCardMutation = gql`
  mutation($id: ID!) {
    deleteCard(id: $id)
  }
`;

class Card extends React.Component {
  state = {
    title: '',
    cardId: '',
    smallModal: false,
    bigModal: false,
    isCardCreate: false,
    noCard: false
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  toggle = (id, listId, title) => {
    this.setState({
      bigModal: !this.state.bigModal,
      cardId: id,
      listId: listId,
      title: title
    });
  };

  toggleSmall = (id, listId, title) => {
    this.setState({
      smallModal: !this.state.smallModal,
      cardId: id,
      listId: listId,
      title: title
    });
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  handleCreateCard = () => {
    const isCardCreate = this.state.isCardCreate;
    this.setState({ isCardCreate: !isCardCreate });
  };

  createCard = async (title, listId) => {
    if (!title || !listId) return null;
    await this.props.createCard({
      variables: {
        title: title,
        listId: listId
      },
      update: (store, { data: { createCard } }) => {
        const data = store.readQuery({ query: CardsQuery });
        data.cards.push(createCard);
        this.setState({ title: '', isCardCreate: false, newCard: true });
        store.writeQuery({ query: CardsQuery, data });
      }
    });
  };

  updateCard = async (cardId, listId, title) => {
    if (!cardId || !listId || !title) return null;
    await this.props.updateCard({
      variables: {
        id: cardId,
        listId: listId,
        title: title
      }
    });
    this.setState({ smallModal: false });
  };

  deleteCard = async card => {
    await this.props.deleteCard({
      variables: {
        id: card.key
      },
      update: store => {
        const data = store.readQuery({ query: CardsQuery });
        data.cards = data.cards.filter(x => x.id !== card.key);
        store.writeQuery({ query: CardsQuery, data });
      }
    });
  };

  getCard = () => {
    this.setState({ noCard: true });
  };

  render() {
    const {
      data: { loading, error, cards },
      listId
    } = this.props;
    const { title, cardId, isCardCreate, noCard } = this.state;

    if (loading || error) return null;
    return (
      <div>
        <div>
          {cards.map(
            (card, index) =>
              card.listId === listId
                ? (card = (
                    <Draggable
                      key={card.id}
                      card={card}
                      index={index}
                      draggableId={card.id}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="item"
                        >
                          <div className="titles">
                            <span
                              className="cardTitle"
                              onClick={this.toggle.bind(
                                this,
                                card.key,
                                card.props.card.listId,
                                card.props.card.title
                              )}
                            >
                              {card.props.card.title}
                            </span>
                            <span className="icons">
                              <IconButton
                                className="icon"
                                onClick={this.toggleSmall.bind(
                                  this,
                                  card.key,
                                  card.props.card.listId,
                                  card.props.card.title
                                )}
                              >
                                <EditIcon />
                              </IconButton>
                              <Modal
                                isOpen={this.state.smallModal}
                                toggle={this.toggleSmall}
                                size="sm"
                                className={this.props.className}
                              >
                                <ModalHeader toggle={this.toggleSmall}>
                                  Change Card Title
                                </ModalHeader>
                                <ModalBody>
                                  <Form>
                                    <FormGroup>
                                      <Input
                                        type="textbox"
                                        name="title"
                                        placeholder={card.title}
                                        onChange={this.handleChange}
                                        value={title}
                                      />
                                    </FormGroup>
                                  </Form>
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    color="primary"
                                    onClick={() =>
                                      this.updateCard(cardId, listId, title)
                                    }
                                  >
                                    Save
                                  </Button>{' '}
                                </ModalFooter>
                              </Modal>
                              <IconButton
                                className="icon"
                                onClick={() => this.deleteCard(card)}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </span>
                          </div>
                          <Modal
                            isOpen={this.state.bigModal}
                            toggle={this.toggle}
                          >
                            {cards.map(
                              card =>
                                card.id === cardId
                                  ? (card = (
                                      <div key={card.id} className="detailsBox">
                                        <ModalHeader
                                          toggle={this.toggle}
                                          id={UUID()}
                                        >
                                          {card.title}
                                          <p> in List: {card.list.name}</p>
                                        </ModalHeader>
                                        <ModalBody>
                                          <Description cardId={cardId} />
                                          <Comment cardId={cardId} />
                                        </ModalBody>
                                      </div>
                                    ))
                                  : null
                            )}
                          </Modal>
                        </div>
                      )}
                    </Draggable>
                  ))
                : null
          )}
        </div>
        <div>
          <div
            className="createCard"
            onClick={() => this.handleCreateCard()}
            style={{
              display: isCardCreate ? 'none' : 'block',
              cursor: 'pointer'
            }}
          >
            {!noCard ? <div>+ Add another card</div> : <div>+Add a card</div>}
          </div>
          {isCardCreate && (
            <Form>
              <FormGroup>
                <Input
                  type="textarea"
                  name="title"
                  placeholder="Enter title for this card"
                  onChange={this.handleChange}
                  value={title}
                />
              </FormGroup>
              <Button
                size="sm"
                color="success"
                onClick={() => this.createCard(title, listId)}
              >
                Add Card
              </Button>
              <span>
                <IconButton onClick={() => this.handleCreateCard()}>
                  <CloseIcon />
                </IconButton>
              </span>
            </Form>
          )}
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CardsQuery),
  graphql(createCardMutation, { name: 'createCard' }),
  graphql(updateCardMutation, { name: 'updateCard' }),
  graphql(deleteCardMutation, { name: 'deleteCard' })
)(Card);
