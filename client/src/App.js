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
      description
      comment
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
    description
    comment
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
mutation($title: String!, $listId: String!, $description: String, $comment: String){
  createCard(title: $title, listId: $listId, description: $description, comment: $comment){
    title
    id
    listId
    description
    comment
    list {
      name
    }
  }
}
`;

const updateCardMutation = gql`
mutation($title: String!, $listId: String!, $description: String, $comment: String, $id: ID!){
  updateCard(title: $title, listId: $listId, description: $description, comment: $comment, id: $id){
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

class App extends Component {
  state = {
    modal: false,
    id: '',
    listId: '',
    title: '',
    comment: "",
    description: "",
  }

  toggle = (id, listId, title) => {
    this.setState({
      modal: !this.state.modal, id: id, listId: listId, title: title
    });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  updateCard = async (comment, openId, listId, title, description) => {
    await this.props.updateCard({
      variables: {
        id: openId,
        listId: listId,
        comment: comment,
        title: title,
        description: description,
      }
    })
  }

  deleteCard = async card => {
    console.log(card)
    await this.props.deleteCard({
      variables: {
        id: card.key
      }
    })
  }

  render() {
    const openId = this.state.id;
    const listId = this.state.listId;
    const title = this.state.title;
    //console.log(this.state.title, this.state.listId);
    const comment = this.state.comment;
    const description = this.state.description;
    const { list: { loading, lists } } = this.props;
    const { card: { cards } } = this.props;
    console.log(cards)
    if (loading) return null;
    return (
      <div className="page">{lists.map(list =>
        <div key={list.name} className="list">
          {list.name}
          {cards.map(card => card.listId === list.id ? card =
            <div key={card.id} id={card.id} className='item'>
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
                {cards.map(ca => ca.id === openId ? ca =
                  <div>
                    <ModalHeader toggle={this.toggle} key={UUID()} id={UUID()}>{ca.title}
                      <p> in List: {ca.list.name}</p>
                    </ModalHeader>
                    <ModalBody>
                      <div className="description">Description:
                        <li>{ca.description}</li>
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
                            onClick={() => this.updateCard(comment, openId, listId, title, description)}>Save</Button>
                        </Form>
                      </div>
                      <div className="comment">Comments:
                        <li>{ca.comment}</li>
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
                            onClick={() => this.updateCard(comment, openId, listId, title, description)}>Save</Button>
                        </Form>
                      </div>
                    </ModalBody>
                  </div>
                  : null)}
              </Modal>
            </div> : null)}
        </div>)}
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
  graphql(deleteCardMutation, { name: "deleteCard" }))(App)