import React from 'react';
import './RecentWinner.css';

class RecentWinner extends React.Component {

  render() {
    const recentWinner = this.props.recentWinner;
    return (
      <div className="RecentWinner">
        <div className="left">
          <img src={recentWinner.image} alt={recentWinner.name} />
        </div>
        <div className="middle">
          {recentWinner.name}
        </div>
        <div className="right">
          {recentWinner.result}
        </div>
      </div>
    );
  }
}

export default RecentWinner;