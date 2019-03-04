import React, { Component } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faHome,
  faSearch,
  faPlus,
  faInfoCircle,
  faBell
} from "@fortawesome/free-solid-svg-icons";
import List from "./list";

class App extends Component {
  state = {
    dragging: undefined
  };


  // editFunction = element => {
  //   if (element.comment === undefined) {
  //     this.setState({
  //       description: element.description,
  //       descriptionId: element.id
  //     });
  //   } else {
  //     this.setState({ comment: element.comment, commentId: element.id });
  //   }
  // };

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
    console.log(result);
  };

  render() {

    return (
      <div>
        <div className="topIcons">
          <span className="topHomeIcon">
            <FontAwesomeIcon icon="home" size="lg" />
          </span>
          <span className="topTrelIcon">
            <FontAwesomeIcon icon={["fab", "trello"]} size="lg" /> Boards{" "}
          </span>
          <span className="topSearchIcon">
            <input className="input" />
            <FontAwesomeIcon icon="search" size="lg" />
          </span>
          <span className="topTitleIcon">
            <FontAwesomeIcon icon={["fab", "trello"]} size="lg" /> Trello{" "}
          </span>
          <span className="topPlusIcon">
            <FontAwesomeIcon icon="plus" size="lg" />
          </span>
          <span className="topInfoIcon">
            <FontAwesomeIcon icon="info-circle" size="lg" />
          </span>
          <span className="topBellIcon">
            <FontAwesomeIcon icon="bell" size="lg" />
          </span>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <List />
        </DragDropContext>
      </div>
    );
  }
}

library.add(fab, faHome, faSearch, faPlus, faInfoCircle, faBell);

export default App;
