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
      settings: {}, // provided by Monday
      recentWinners: [], // recent winners to diplay on the right
      recentSpins: [], // don't let someone spin more than once per week
      addedRows: [], // Monday rows that have already been added to the pot
      me: null, // the person viewing the app
      jackpot: 0 // dollar amount in the pot
    };
  }

  async componentDidMount() {
    monday.listen('settings', (res) => {
      console.log('settings=', res.data);
      this.setState({
        settings: res.data
      });
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
    this.setState({
      me
    });

    monday.listen('context', async (res) => {
      const context = res.data;
      console.log('context=', context);
      const res2 = await monday.api(`
        query ($boardIds: [Int]) {
          boards (ids: $boardIds) {
            id
            name
            items (limit: 999) {
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
          boardIds: [context.boardIds[0]]
        }
      });

      console.log('Rows =', res2.data.boards[0]["items"]);
      const rows = res2.data.boards[0]["items"];

      console.log("jackpopt num check=",(await monday.storage.instance.getItem('jackpot')).data.value)
      let jackpot = parseInt((await monday.storage.instance.getItem('jackpot')).data.value) || 0;
      // this.setState(async (prevState) => { 
      //   let jackpot = prevState.jackpot;
      const addedRows = JSON.parse((await monday.storage.instance.getItem('addedRows')).data.value) || [];
      console.log(`addedRows `, addedRows)
      console.log(`rows `, rows)
      for (const row of rows) {
        const rowId = row.id;
        const rowName = row.name;
        let rowStatus = null;
        console.log("column===",row)
        if (row.column_values && row.column_values.find(c => c.title === 'Status')) {
          rowStatus = row.column_values.find(c => c.title === 'Status').text;
        }
        console.log(addedRows.indexOf(rowId));
        if (rowStatus === 'Done' && addedRows.indexOf(rowId) === -1) {
          console.log('Adding new row: ' + rowId + ' - ' + rowName);
          jackpot += 8;
          addedRows.push(rowId);
        }
      }
      monday.storage.instance.setItem('addedRows', JSON.stringify(addedRows));
      monday.storage.instance.setItem('jackpot', jackpot);
      // return { addedRows, jackpot };
      this.setState({
        addedRows,
        jackpot
      });
      // });
    });

    const recentWinners = JSON.parse((await monday.storage.instance.getItem('recentWinners')).data.value);
    this.setState({
      recentWinners: recentWinners ? recentWinners : []
    });
  }

  resultHandler = async (result) => {
    console.log('result=', result);

    this.setState((prevState) => {
      let recentWinners = prevState.recentWinners || [];
      let recentSpins = prevState.recentSpins || [];
      if (prevState.me) {

        if (result !== '$0') {
          recentWinners.unshift({
            created: dayjs().format(),
            image: prevState.me.photo_thumb,
            name: prevState.me.name,
            result
          });

          monday.execute('notice', {
            message: 'Congratulations! You won ' + result,
            type: 'success', // or 'error' (red), or 'info' (blue)
            timeout: 10000,
          });
        }

        recentSpins.unshift({
          created: dayjs().format(),
          name: prevState.me.name
        });

        if (recentWinners.length > 6) {
          recentWinners = recentWinners.slice(0, 6);
        }

        if (recentSpins.length > 999) {
          recentWinners = recentWinners.slice(0, 999);
        }

        monday.storage.instance.setItem('recentWinners', JSON.stringify(recentWinners));
        monday.storage.instance.setItem('recentSpins', JSON.stringify(recentWinners));
      }

      return {
        recentWinners,
        recentSpins
      };
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