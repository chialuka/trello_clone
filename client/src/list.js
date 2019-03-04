import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Form, FormGroup, Input, Button } from "reactstrap";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import UUID from "uuid/v4";
import Card from "./card";

const ListsQuery = gql`
  {
    lists {
      id
      name
      card {
        id
        listId
        title
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
  }
`;

const createListMutation = gql`
  mutation($name: String!) {
    createList(name: $name) {
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

const updateListMutation = gql`
  mutation($name: String!, $id: ID!) {
    updateList(name: $name, id: $id) {
      id
      name
      card {
        title
        id
        listId
      }
    }
  }
`;

const deleteListMutation = gql`
  mutation($id: ID!) {
    deleteList(id: $id)
  }
`;

class List extends Component {
  state = {
    name: "",
    listId: "",
    isListCreate: null,
    isListUpdate: null
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  handleCreateList = () => {
    const isOpen = this.state.isListCreate;
    this.setState({ isListCreate: !isOpen });
  };

  handleUpdateList = (list) => {
    const isOpen = this.state.isListUpdate;
    this.setState({ isListUpdate: !isOpen, listId: list.key });
  };

  createList = async name => {
    if (!name) return null;
    await this.props.createList({
      variables: {
        name: name
      },
      update: (store, { data: { createList } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        data.lists.push(createList);
        this.setState({ name: "", isListCreate: false });
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      }
    });
  };

  updateList = async (e, name, listId) => {
    if (!name || !listId) return null;
    e.preventDefault();
    await this.props.updateList({
      variables: {
        name: name,
        id: listId
      },
    });
    this.setState({ isListUpdate: !this.state.isListUpdate, name: ""});
  };

  deleteList = async list => {
    await this.props.deleteList({
      variables: {
        id: list.key
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: ListsQuery });
        // Add our comment from the mutation to the end.
        data.lists = data.lists.filter(x => x.id !== list.key);
        // Write our data back to the cache.
        store.writeQuery({ query: ListsQuery, data });
      }
    });
  };

  render() {
    const {
      data: { loading, error, lists }
    } = this.props;
    const { name, listId, isListCreate, isListUpdate } = this.state;

    if (loading || error) return null;
    return (
      <div className="board">
        <Droppable droppableId={UUID()}>
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="singleBoard"
            >
              {lists.map(
                (list, index) =>
                  (list = (
                    <Draggable
                      key={list.id}
                      list={list}
                      index={index}
                      draggableId={list.id}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="list"
                        >
                          <div>
                            <div
                              className="listName"
                              key={list.id}
                              onClick={() => this.handleUpdateList(list)}
                            >
                              <div
                                style={{
                                  display: isListUpdate && list.key === listId ? "none" : "block",
                                  cursor: "pointer"
                                }}
                              >
                                {list.props.list.name}
                                <span className="lIcon">
                                  <IconButton
                                    className="icon"
                                    onClick={() => this.deleteList(list)}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </span>
                              </div>
                            </div>
                            {isListUpdate && list.key === listId ? (
                              <Form
                                onSubmit={e => this.updateList(e, name, listId)}
                              >
                                <FormGroup>
                                  <Input
                                    type="text"
                                    name="name"
                                    placeholder={list.props.list.name}
                                    onChange={this.handleChange}
                                    value={name}
                                  />
                                </FormGroup>
                                <div type="submit" />
                              </Form>
                            ): null}
                            <Card listId={list.props.list.id} />
                          </div>{" "}
                        </div>
                      )}
                    </Draggable>
                  ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="newList">
          <div
            style={{
              display: isListCreate ? "none" : "block",
              cursor: "pointer"
            }}
            className="createList"
            onClick={() => this.handleCreateList()}
          >
            <div>+ Add another List</div>
          </div>
          {isListCreate && (
            <Form>
              <FormGroup>
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter title for this List"
                  onChange={this.handleChange}
                  value={name}
                />
              </FormGroup>
              <Button
                size="sm"
                color="success"
                onClick={() => this.createList(name)}
              >
                Add List
              </Button>
              <span>
                <IconButton onClick={() => this.handleCreateList()}>
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
  graphql(ListsQuery),
  graphql(createListMutation, { name: "createList" }),
  graphql(updateListMutation, { name: "updateList" }),
  graphql(deleteListMutation, { name: "deleteList" })
)(List);
