import React from 'react';
import './App.css';
import mondaySdk from 'monday-sdk-js';
import SpinWheel from './SpinWheel';
import dayjs from 'dayjs';
import RecentWinner from './RecentWinner/RecentWinner';


const monday = mondaySdk();

class AppSolution extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      settings: {},
      context: {},
      name: '',
      recentWinners: [],
      recentSpins: [],
      me: null
    };
  }

  async componentDidMount() {
    // TODO: set up event listeners
    // monday.listen('settings', (res) => {
    //   this.setState({ settings: res.data });
    // });

    const res = await monday.api(`
      query {
        me {
          name
          photo_thumb
        }
      }
    `);
    const me = res.data.me;
    this.setState({ me });

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
    });

    const recentWinners = JSON.parse((await monday.storage.instance.getItem('recentWinners')).data.value);
    this.setState({ recentWinners: recentWinners ? recentWinners : [] });
  }

  resultHandler = async (result) => {
    console.log('result=', result);

    monday.execute('notice', { 
      message: 'Congratulations! You won ' + result,
      type: 'success', // or 'error' (red), or 'info' (blue)
      timeout: 10000,
    });

    this.setState((prevState) => { 
      let recentWinners = prevState.recentWinners;
      
      recentWinners.unshift({
        created: dayjs().format(),
        image: prevState.me.photo_thumb,
        name: prevState.me.name,
        result
      });

      if (recentWinners.length > 6) {
        recentWinners = recentWinners.slice(0, 6);
      }

      monday.storage.instance.setItem('recentWinners', JSON.stringify(recentWinners));

      return { recentWinners };
    });
  }

  render() {
    return (
      <div className="App">
        <div>
          <SpinWheel whenResult={this.resultHandler}></SpinWheel>
        </div>
        <div>
          <h2>Recent Winners</h2>
          {this.state.recentWinners.map((recentWinner, i) => {
            return <RecentWinner key={i} recentWinner={recentWinner}/>;
          })}
        </div>
      </div>
    );
  }
}

export default AppSolution;
