import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import SpinWheel from "./SpinWheel";


const monday = mondaySdk();

class AppSolution extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      settings: {},
      context: {},
      name: "",
    };
  }

  componentDidMount() {
    // TODO: set up event listeners
    // monday.listen("settings", (res) => {
    //   this.setState({ settings: res.data });
    // });

    monday.listen("context", res => {
      this.setState({context: res.data});
      console.log(res.data);
      monday.api(`query ($boardIds: [Int]) { boards (ids:$boardIds) { name items(limit:1) { name column_values { title text } } } }`,
        { variables: {boardIds: this.state.context.boardIds} }
      )
      .then(res => {
        this.setState({boardData: res.data});
      });
    })
  }

  render() {
    return (
      <div
        className="App"
        style={{ background: this.state.settings.background }}
      >
        <SpinWheel></SpinWheel>
      </div>
    );
  }
}

export default AppSolution;
