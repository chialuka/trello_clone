import React, { Component } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faHome,
  faSearch,
  faPlus,
  faInfoCircle,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import List from './list';

class App extends Component {
  state = {
    dragging: undefined,
    dragInfo: []
  };

  onDragEnd = result => {
    const { dragInfo } = this.state;
    this.setState({ dragInfo: [] });
    console.log(result);
    if (result.destination) {
      dragInfo.push(result)
      this.setState({ dragInfo });
    }
  };

  render() {
    const { dragInfo } = this.state;
    return (
      <div>
        <div className="topIcons">
          <span className="topHomeIcon">
            <FontAwesomeIcon icon="home" size="lg" />
          </span>
          <span className="topTrelIcon">
            <FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Boards{' '}
          </span>
          <span className="topSearchIcon">
            <input className="input" />
            <FontAwesomeIcon icon="search" size="lg" />
          </span>
          <span className="topTitleIcon">
            <FontAwesomeIcon icon={['fab', 'trello']} size="lg" /> Trello{' '}
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
          <List dragInfo={dragInfo} />
        </DragDropContext>
      </div>
    );
  }
}

library.add(fab, faHome, faSearch, faPlus, faInfoCircle, faBell);

export default App;
