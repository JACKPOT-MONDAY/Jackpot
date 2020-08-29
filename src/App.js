import React from 'react';
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
      me: null,
      jackpot: 0
    };
  }

  async componentDidMount() {
    monday.listen('settings', (res) => {
      console.log('settings=', res.data);
      this.setState({ settings: res.data });
    });

    const res = await monday.api(`
      query {
        me {
          name
          photo_thumb
        }
      }
    `);
    const me = res.data.me;
    console.log('me=', me);
    this.setState({ me });

    monday.listen('context', async (res) => {
      this.setState({context: res.data});
      console.log('context=', res.data);
      const res2 = await monday.api(`
        query ($boardIds: [Int]) {
          boards (ids: $boardIds) {
            id
            name
            items (limit: 3) {
              id
              name
              column_values {
                id
                title
                text
              }
            }
          }
        }  
      `, {
        variables: {
          boardIds: [this.state.context.boardIds[0]]
        }
      });
      console.log('boardData=', res2.data);
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
      if (prevState.me) {
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
      }
      
      return { recentWinners };
    });
  }

  render() {
    return (
      <div className="App">
        <SpinWheel whenResult={this.resultHandler} currentJackpot={this.state.jackpot}></SpinWheel>
        <div id="recentWinnersDiv">
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
