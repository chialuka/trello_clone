import React, { Component } from 'react';
import gql from "graphql-tag";
import { graphql, compose } from 'react-apollo';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Input, Button } from 'reactstrap';

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
  updateList(name: $name, id: $id)
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
mutation($title: String! $listId: String! $description: String $comment: String $id: ID!){
  updateCard(title: $title listId: $listId description: $description comment: $comment id: $id)
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
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    console.log(this.props.card, this.props.list)
    const { list: { loading, lists } } = this.props;
    //const { card: { loading, cards }} = this.props;
    if (loading) return null;
    return (
      <div className="page">{lists.map(list =>
        <div key={list.id} className="list">
          {list.name}
          {list.card.map(card =>
            <div key={card.id} className='item'>
              <p className="title" onClick={this.toggle}>{card.title}</p>
              <Modal 
              isOpen={this.state.modal} 
              toggle={this.toggle}
              >
                <ModalHeader toggle={this.toggle}>{card.title}
                  <p> in List: {list.name}</p>
                </ModalHeader>
                <ModalBody>
                  <div className="description">Description: 
                    <li>{card.description}</li>
                    <Form>
                      <FormGroup>
                        <Input
                          type="text"
                          name="text"
                          placeholder="Add more description" />
                      </FormGroup>
                      <Button size="sm">Save</Button>
                    </Form>
                  </div>
                  <div className="comment">Comments: 
                    <li>{card.comment}</li>
                    <Form>
                      <FormGroup>
                        <Input
                          type="text"
                          name="text"
                          placeholder="Add more comments" />
                      </FormGroup>
                      <Button size="sm">Save</Button>
                    </Form>
                  </div>
                </ModalBody>
              </Modal>
            </div>)}
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