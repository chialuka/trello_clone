import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Form, FormGroup, Input, Button } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import UUID from 'uuid/v4';
import Card from './Card';

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
    name: '',
    listId: '',
    isListCreate: null,
    isListUpdate: null,
    newCard: '',
    listArray: []
  };

  drag = React.createRef();

  componentDidMount() {
    if (!this.props.data.loading) {
      const lists = this.props.data.lists;
      const { listArray } = this.state;
      if (listArray.length) {
        listArray.pop();
      }
      listArray.push(lists);
      this.setState({ listArray });
    }
  }

  componentDidUpdate(prevProps) {
    const { listArray } = this.state;
    if (this.props.data.lists !== prevProps.data.lists) {
      console.log(this.props.data.lists, 'new props');
      console.log(prevProps.data.lists, 'prev props');
      if (listArray.length) {
        listArray.pop();
      }
      listArray.push(this.props.data.lists)
      this.setState({ listArray });
    }
  }

  onDragEnd = result => {
    const lists = this.props.data.lists;
    const {
      draggableId,
      destination,
      source: { droppableId }
    } = result;
    if (destination.droppableId === droppableId || destination === null) {
      return null;
    }
    const list = lists.find(x => x.id === droppableId);
    const card = list.card.find(y => y.id === draggableId);
    if (result.destination) {
      this.drag.updateCard(draggableId, destination.droppableId, card.title);
    }
    window.location.reload();
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  handleCreateList = () => {
    const isOpen = this.state.isListCreate;
    this.setState({ isListCreate: !isOpen });
  };

  handleUpdateList = list => {
    const isOpen = this.state.isListUpdate;
    this.setState({
      isListUpdate: !isOpen,
      listId: list.key,
      name: list.props.list.name
    });
  };

  createList = async name => {
    if (!name) return null;
    await this.props.createList({
      variables: {
        name: name
      },
      update: (store, { data: { createList } }) => {
        const data = store.readQuery({ query: ListsQuery });
        data.lists.push(createList);
        this.setState({ name: '', isListCreate: false });
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
      }
    });
    this.setState({ isListUpdate: !this.state.isListUpdate, name: '' });
  };

  deleteList = async list => {
    await this.props.deleteList({
      variables: {
        id: list.key
      },
      update: store => {
        const data = store.readQuery({ query: ListsQuery });
        data.lists = data.lists.filter(x => x.id !== list.key);
        store.writeQuery({ query: ListsQuery, data });
      }
    });
  };

  render() {
    const {
      data: { loading, error, lists }
    } = this.props;
    const { name, listId, isListCreate, isListUpdate, listArray } = this.state;
    const listToMap = listArray[0] || lists;
    console.log(listArray[0], 'list array');
    console.log(listToMap, 'list to map');
    if (loading || error || !listArray) return null;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="board">
          <Droppable droppableId={UUID()}>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="singleBoard"
              >
                {listToMap.map(
                  (list, index) =>
                    (list = (
                      <Droppable
                        key={list.id}
                        list={list}
                        index={index}
                        droppableId={list.id}
                      >
                        {provided => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="list"
                          >
                            <div
                              className="listName"
                              key={list.id}
                              onClick={() => this.handleUpdateList(list)}
                            >
                              <div
                                style={{
                                  display:
                                    isListUpdate && list.key === listId
                                      ? 'none'
                                      : 'block',
                                  cursor: 'pointer'
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
                                    placeholder={name}
                                    onChange={this.handleChange}
                                    value={name}
                                  />
                                </FormGroup>
                                <div type="submit" />
                              </Form>
                            ) : null}
                            <Card
                              listId={list.props.list.id}
                              onRef={ref => {
                                this.drag = ref;
                              }}
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <div className="newList">
            <div
              style={{
                display: isListCreate ? 'none' : 'block',
                cursor: 'pointer'
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
      </DragDropContext>
    );
  }
}

export default compose(
  graphql(ListsQuery),
  graphql(createListMutation, { name: 'createList' }),
  graphql(updateListMutation, { name: 'updateList' }),
  graphql(deleteListMutation, { name: 'deleteList' })
)(List);
