import React, { Component } from "react";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { Form, FormGroup, Input, Button } from "reactstrap";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const DescriptionsQuery = gql`
  {
    descriptions {
      description
      id
      cardId
    }
  }
`;

const createDescriptionMutation = gql`
  mutation($description: String!, $cardId: String!) {
    createDescription(description: $description, cardId: $cardId) {
      description
      id
      cardId
    }
  }
`;

const updateDescriptionMutation = gql`
  mutation($description: String!, $cardId: String!, $id: ID!) {
    updateDescription(description: $description, cardId: $cardId, id: $id) {
      description
      id
      cardId
    }
  }
`;

const deleteDescriptionMutation = gql`
  mutation($id: ID!) {
    deleteDescription(id: $id)
  }
`;

class Description extends Component {
  state = {
    description: "",
    descriptionId: ""
  };

  handleChange = ({ target: { name, value } }) => {
    this.setState({ ...this.state, [name]: value });
  };

  editFunction = element => {
    this.setState({
      description: element.description,
      descriptionId: element.id
    });
  };

  submitDescription = (description, cardId, descriptionId) => {
    if (descriptionId === "") {
      this.createDescription(description, cardId);
    } else {
      this.updateDescription(description, cardId, descriptionId);
    }
    this.setState({ description: "", descriptionId: "" });
  };

  createDescription = async (description, cardId) => {
    await this.props.createDescription({
      variables: {
        description: description,
        cardId: cardId
      },
      update: (store, { data: { createDescription } }) => {
        const data = store.readQuery({ query: DescriptionsQuery });
        data.descriptions.push(createDescription);
        this.setState({ description: "" });
        store.writeQuery({ query: DescriptionsQuery, data });
      }
    });
  };

  updateDescription = async (description, cardId, descriptionId) => {
    await this.props.updateDescription({
      variables: {
        description: description,
        cardId: cardId,
        id: descriptionId
      },
    });
  };

  deleteDescription = async element => {
    await this.props.deleteDescription({
      variables: {
        id: element.id
      },
      update: store => {
        const data = store.readQuery({ query: DescriptionsQuery });
        this.setState({ description: "" });
        data.descriptions = data.descriptions.filter(x => x.id !== element.id);
        store.writeQuery({ query: DescriptionsQuery, data });
      }
    });
  };

  render() {
    const {
      data: { loading, error, descriptions },
      cardId
    } = this.props;
    const { description, descriptionId } = this.state;

    if (loading || error) return null;
    return (
      <div className="description">
        Description:
        {descriptions.map(element =>
          element.cardId === cardId ? (
            <div key={element.id} onClick={() => this.editFunction(element)}>
              {element.description}
              <span className="dIcon">
                <IconButton
                  className="icon"
                  onClick={() => this.deleteDescription(element)}
                >
                  <CloseIcon />
                </IconButton>
              </span>
            </div>
          ) : null
        )}
        <Form>
          <FormGroup>
            <Input
              type="textarea"
              name="description"
              placeholder="Add more description"
              onChange={this.handleChange}
              value={description}
            />
          </FormGroup>
          <Button
            size="sm"
            onClick={() =>
              this.submitDescription(description, cardId, descriptionId)
            }
          >
            Save
          </Button>
        </Form>
      </div>
    );
  }
}

export default compose(
  graphql(DescriptionsQuery),
  graphql(createDescriptionMutation, { name: "createDescription" }),
  graphql(updateDescriptionMutation, { name: "updateDescription" }),
  graphql(deleteDescriptionMutation, { name: "deleteDescription" })
)(Description);
