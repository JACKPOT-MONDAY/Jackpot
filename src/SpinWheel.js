import React from "react";
import jackpotImg from "./jackpot.png"

class SpinWheel extends React.Component {
  state = {
    list: [
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0",
      "$0"
    ],
    radius: 100, // PIXELS
    rotate: 0, // DEGREES
    easeOut: 0, // SECONDS
    angle: 0, // RADIANS
    top: null, // INDEX
    offset: null, // RADIANS
    net: null, // RADIANS
    result: null, // INDEX
    spinning: false,
    colors: ["#FB275D","#FFCC00", "#00CC6F", "#A358DF", "#00CFF4"],
    ended:false
  };

  componentDidMount() {
    // generate canvas wheel on load
    this.renderWheel();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.currentJackpot || prevProps.currentJackpot === this.props.currentJackpot) {
      return;
    }
    this.setState(prevState => {
      const list = prevState.list;
      list.pop();
      list.push('$' + this.props.currentJackpot);
      return { list };
    }, () => {
      this.renderWheel();
    });
  }

  getColor() {
    // randomly generate rbg values for wheel sectors
    let h = Math.floor(Math.random() * 360);
    return `hsl(${h},100%,100%)`;
  }

  renderWheel() {
    // determine number/size of sectors that need to created
    let numOptions = this.state.list.length;
    let arcSize = (2 * Math.PI) / numOptions;
    this.setState({
      angle: arcSize
    });

    // get index of starting position of selector
    this.topPosition(numOptions, arcSize);

    // dynamically generate sectors from state list
    let angle = 0;
    let tempColors = [...this.state.colors];
    for (let i = 0; i < numOptions; i++) {
      let text = this.state.list[i];
      this.renderSector(i + 1, text, angle, arcSize, tempColors);
      angle += arcSize;
    }
    let canvas = document.getElementById("wheel");
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.arc(x, y, 90, 0, 2* Math.PI);
    ctx.fillStyle = "rgb(240,240,240,1)";
    ctx.fill();
    ctx.restore();
  }

  topPosition = (num, angle) => {
    // set starting index and angle offset based on list length
    // works upto 9 options
    let topSpot = null;
    let degreesOff = null;
    if (num === 9) {
      topSpot = 7;
      degreesOff = Math.PI / 2 - angle * 2;
    } else if (num === 8) {
      topSpot = 6;
      degreesOff = 0;
    } else if (num <= 7 && num > 4) {
      topSpot = num - 1;
      degreesOff = Math.PI / 2 - angle;
    } else if (num === 4) {
      topSpot = num - 1;
      degreesOff = 0;
    } else if (num <= 3) {
      topSpot = num;
      degreesOff = Math.PI / 2;
    }

    this.setState({
      top: topSpot - 1,
      offset: degreesOff
    });
  };

  renderSector(index, text, start, arc, tempColors) {
    // create canvas arc for each list element
    let canvas = document.getElementById("wheel");
    let ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let radius = this.state.radius;
    let startAngle = start;
    let endAngle = start + arc - 2*(Math.PI/180);
    let angle = index * arc;
    if (tempColors.length === 0){tempColors = [...this.state.colors]}
    let color = tempColors.splice(Math.floor(Math.random()*tempColors.length),1)
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.arc(x, y, radius*2, startAngle, endAngle, false);
    ctx.lineTo(x,y);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.font = "13px Arial";
    ctx.fillStyle = "white";
    ctx.stroke();
    ctx.save();
    // translate to put text on sector
    ctx.translate(250  + Math.cos(angle - arc/2 ) * 150, 250 + Math.sin(angle - arc / 2)* 150);
    ctx.rotate(angle - arc / 2 + Math.PI / 2); //rptate text to align with sector
    ctx.fillText(text, -ctx.measureText(text).width/1.3, 0); // put text rougly in center
    ctx.restore();
  }

 

  spin = () => {
    // set random spin degree and ease out time
    // set state variables to initiate animation
    let randomSpin = Math.floor(Math.random() * 900) + 500;
    this.setState({
      rotate: randomSpin,
      easeOut: 2,
      spinning: true,
      ended:false
    });

    // calcalute result after wheel stops spinning
    setTimeout(() => {
      this.getResult(randomSpin);
      this.setState({ended:true});
    }, 2000);
  };

  getResult = spin => {
    // find net rotation and add to offset angle
    // repeat substraction of inner angle amount from total distance traversed
    // use count as an index to find value of result from state list
    const { angle, top, offset, list } = this.state;
    let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
    let travel = netRotation + offset;
    let count = top + 1;
    while (travel > 0) {
      travel = travel - angle;
      count--;
    }
    let result;
    if (count >= 0) {
      result = count;
    } else {
      result = list.length + count;
    }

    this.props.whenResult(list[result]);

    // set state variable to display result
    this.setState({
      net: netRotation,
      result: result
    });
  };

  reset = () => {
    // reset wheel and result
    this.setState({
      rotate: 0,
      easeOut: 0,
      result: null,
      spinning: false,
      ended: false
    });
  };

  render() {
    return (
      <React.Fragment>
      <div className="spinWheelSection">
        
        <span id="selector">&#9660;</span>
        <canvas
          id="wheel"
          width="500"
          height="500"
          style={{
            WebkitTransform: `rotate(${this.state.rotate}deg)`,
            WebkitTransition: `-webkit-transform ${this.state.easeOut}s ease-out`}}></canvas>
        

        {this.state.spinning ? (
          <button type="button" id="reset" onClick={this.reset}>
            reset
          </button>
        ) : (
          <button type="button" id="spin" onClick={this.spin}>
            spin
          </button>
        )}
      </div>

      {this.state.ended ? (<div className="display" style={{display:"block"}}>
        
      <h1 id="readout">{this.state.list[this.state.result] === "$0"? "Awe, better luck next time! You got:": "Congratulations, you win!"}</h1>
      <p id="result">{this.state.list[this.state.result]}</p>
      <button id="exitWin" onClick={this.reset}>Okay, take me back!</button>
      <img src={jackpotImg}  alt=""></img>
    </div>):(<div></div>)}

      <div className="jackpotContainer">Current Jackpot:<br/><span className="bold">${Math.round(this.props.currentJackpot)}</span></div>
      </React.Fragment>
    );
  }
  
}

export default SpinWheel;