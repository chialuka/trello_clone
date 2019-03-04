import React from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Form,
  FormGroup,
  Input,
  Button
} from "reactstrap";
import { Draggable } from "react-beautiful-dnd";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Description from "./description";
import Comment from "./comment";
import UUID from "uuid/v4";

const CardsQuery = gql`
  {
    cards {
      id
      listId
      title
    }
  }
`;

const createCardMutation = gql`
  mutation($title: String!, $listId: String!) {
    createCard(title: $title, listId: $listId) {
      title
      id
      listId
    }
  }
`;

const updateCardMutation = gql`
  mutation($title: String!, $listId: String!, $id: ID!) {
    updateCard(title: $title, listId: $listId, id: $id) {
      id
      title
      listId
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
    card: "",
    cardId: "",
    smallModal: false,
    bigModal: false,
    isCardCreate: false,
    dragging: undefined
  };

  toggle = (id, listId, title) => {
    this.setState({
      bigModal: !this.state.bigModal,
      cardId: id,
      listId: listId,
      cardTitle: title
    });
  };

  toggleSmall = (id, listId, title) => {
    this.setState({
      smallModal: !this.state.smallModal,
      cardId: id,
      listId: listId,
      cardTitle: title
    });
  };

  handleChange = ({target: {name, value}}) => {
    this.setState({...this.state, [name]: value})
  }

  handleCreateCard = () => {
    const isCardCreate = this.state.isCardCreate;
    this.setState({ isCardCreate: !isCardCreate });
  };

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
        this.setState({ cardTitle: "", isCardCreate: false });
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      }
    });
  };

  updateCard = async (cardId, listId, cardTitle) => {
    await this.props.updateCard({
      variables: {
        id: cardId,
        listId: listId,
        title: cardTitle
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CardsQuery });
        // Add our comment from the mutation to the end.
        data.cards = data.cards.map(x =>
          x.id === cardId
            ? {
                id: cardId,
                listId: listId,
                title: cardTitle
              }
            : x
        );
        console.log(data.cards);
        this.setState({ cardTitle: "", isCardCreate: false });
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      }
    });
  };

  deleteCard = async card => {
    await this.props.deleteCard({
      variables: {
        id: card.key
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: CardsQuery });
        // Add our comment from the mutation to the end.
        data.cards = data.cards.filter(x => x.id !== card.key);
        // Write our data back to the cache.
        store.writeQuery({ query: CardsQuery, data });
      }
    });
  };

  render() {
    const {
      data: { loading, error, cards }, listId
    } = this.props;
    const { card, cardId, isCardCreate } = this.state;

    if (loading || error) return null;
    return (
      <div>
        <div>
          {cards.map((card, index) =>
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
                                      name="card"
                                      placeholder={card.props.card.title}
                                      onChange={this.handleChange}
                                      value={card}
                                    />
                                  </FormGroup>
                                </Form>
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="primary"
                                  onClick={() =>
                                    this.updateCard(cardId, listId, card)
                                  }
                                >
                                  Save
                                </Button>{" "}
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
                          {cards.map(card =>
                            card.lists.map(list =>
                              card.id === cardId
                                ? (card = (
                                    <div key={card.id} className="detailsBox">
                                      <ModalHeader
                                        toggle={this.toggle}
                                        id={UUID()}
                                      >
                                        {card.title}
                                        <p> in List: {list.name}</p>
                                      </ModalHeader>
                                      <ModalBody>
                                        <Description cardId={cardId}/>
                                        <Comment cardId={cardId}/>
                                      </ModalBody>
                                    </div>
                                  ))
                                : null
                            )
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
          >
            <div
              style={{
                display: isCardCreate ? "none" : "block",
                cursor: "pointer"
              }}
            >
              + Add a card
            </div>
          </div>
          {isCardCreate && (
            <Form>
              <FormGroup>
                <Input
                  type="textarea"
                  name="card"
                  placeholder="Enter title for this card"
                  onChange={this.handleChange}
                  value={card}
                />
              </FormGroup>
              <Button
                size="sm"
                color="success"
                onClick={() => this.createCard(card, listId)}
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
  graphql(createCardMutation, { name: "createCard" }),
  graphql(updateCardMutation, { name: "updateCard" }),
  graphql(deleteCardMutation, { name: "deleteCard" })
)(Card);
