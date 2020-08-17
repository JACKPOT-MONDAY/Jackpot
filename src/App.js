import React from 'react';
import './App.css';
import mondaySdk from 'monday-sdk-js';
import SpinWheel from './SpinWheel';


const monday = mondaySdk();

class AppSolution extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      settings: {},
      context: {},
      name: '',
      winners: []
    };
  }

  componentDidMount() {
    // TODO: set up event listeners
    // monday.listen('settings', (res) => {
    //   this.setState({ settings: res.data });
    // });

    monday.listen('context', async (res) => {
      this.setState({context: res.data});
      console.log(res.data);
      const res2 = await monday.api(`
        query ($boardIds: [Int]) {
          boards (ids: $boardIds) {
            name
            items (limit: 3) {
              name
              column_values {
                title
                text
              }
            }
          }
        }  
      `, {
        variables: {
          boardIds: this.state.context.boardIds
        }
      });
      this.setState({boardData: res2.data});
    })
  }

  resultHandler = (result) => {
    console.log('result=', result);

    monday.execute('notice', { 
      message: 'Congratulations! You won ' + result,
      type: 'success', // or 'error' (red), or 'info' (blue)
      timeout: 10000,
    });
  }

  render() {
    return (
      <div
        className='App'
        style={{ background: this.state.settings.background }}
      >
        <SpinWheel whenResult={this.resultHandler}></SpinWheel>
      </div>
    );
  }
}

export default AppSolution;
