import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionLength: 25,
      breakLength: 5,
      isPomoInSession: true,
      timer: 1500,
      timeLeft: "25:00",
      isTimerPlaying: false,
      pomoIntervalID: 0,
      passedTime: 0
    };

    this.beepAudio = React.createRef();

    this.incrementSessionLength = this.incrementSessionLength.bind(this);
    this.decrementSessionLength = this.decrementSessionLength.bind(this);
    this.incrementBreakLength = this.incrementBreakLength.bind(this);
    this.decrementBreakLength = this.decrementBreakLength.bind(this);
    this.resetPomoValues = this.resetPomoValues.bind(this);
    this.playPomo = this.playPomo.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.state.pomoIntervalID);
  }

  incrementSessionLength() {
    this.setState((state, props) => {
      if (state.isTimerPlaying || state.sessionLength + 1 > 60) return;

      const incrementedSessionTime = state.sessionLength + 1;

      return {
        sessionLength: incrementedSessionTime,
        timeLeft: incrementedSessionTime.toString().padStart(2, "0") + ":00",
        passedTime: 0,
        timer: incrementedSessionTime * 60
      };
    });
  }
  decrementSessionLength() {
    this.setState((state, props) => {
      if (state.isTimerPlaying || state.sessionLength - 1 < 1) return;

      const decrementedSessionTime = state.sessionLength - 1;

      return {
        sessionLength: decrementedSessionTime,
        timeLeft: decrementedSessionTime.toString().padStart(2, "0") + ":00",
        passedTime: 0,
        timer: decrementedSessionTime * 60
      };
    });
  }

  incrementBreakLength() {
    this.setState((state, props) => {
      if (state.isTimerPlaying || state.breakLength + 1 > 60) return;

      const incrementedBreakTime = state.breakLength + 1;

      return {
        breakLength: incrementedBreakTime,
        passedTime: 0
      };
    });
  }
  decrementBreakLength() {
    this.setState((state, props) => {
      if (state.isTimerPlaying || state.breakLength - 1 < 1) return;

      const decrementedBreakTime = state.breakLength - 1;

      return {
        breakLength: decrementedBreakTime,
        passedTime: 0
      };
    });
  }

  resetPomoValues() {
    clearInterval(this.state.pomoIntervalID);
    this.beepAudio.current.pause();
    this.beepAudio.current.currentTime = 0;
    this.setState({
      sessionLength: 25,
      breakLength: 5,
      timeLeft: "25:00",
      timer: 1500,
      passedTime: 0,
      isTimerPlaying: false,
      isPomoInSession: true
    });
  }

  playAudio() {
    this.beepAudio.current.play();
  }

  playPomo() {
    if (this.state.isTimerPlaying) {
      clearInterval(this.state.pomoIntervalID);
      this.setState({ isTimerPlaying: false });
      return;
    }

    const intervalID = setInterval(() => {
      let timer = this.state.timer - 1;
      let timeLeft = timer / 60;

      this.setState((state, props) => ({
        timer: state.timer - 1,
        passedTime: state.passedTime + 1
      }));

      if (timer === 0) {
        this.playAudio();
        let newTimer = 0;
        if (this.state.isPomoInSession) {
          newTimer = this.state.breakLength * 60 + 1;
        } else {
          newTimer = this.state.sessionLength * 60 + 1;
        }

        this.setState((state, props) => ({
          isPomoInSession: !state.isPomoInSession,
          timer: newTimer,
          passedTime: 0
        }));
      }

      let [minutesLeft, secondsLeft] = timeLeft.toString().split(".");

      if (!secondsLeft) {
        secondsLeft = "0";
      } else {
        secondsLeft = (("0." + secondsLeft) * 60).toFixed(0);
      }

      if (minutesLeft === "-0") minutesLeft = "0";

      this.setState({
        timeLeft: `${minutesLeft.padStart(2, "0")}:${secondsLeft.padStart(
          2,
          "0"
        )}`,
        isTimerPlaying: true
      });
    }, 1000);

    this.setState({ pomoIntervalID: intervalID });
  }

  render() {
    const sessionLength = this.state.sessionLength;
    const breakLength = this.state.breakLength;
    const pomoStatus = this.state.isPomoInSession;
    const timeLeft = this.state.timeLeft;
    return (
      <div className="App">
        <div className="container my-5">
          <div className="row text-center justify-content-center">
            <div className="col-md-12 my-5">
              <h1>Pomodoro Clock</h1>
            </div>
            <div className="col-md-4 card">
              <div className="card-body">
                <PomodoroSetting
                  session={sessionLength}
                  break={breakLength}
                  incrementSession={this.incrementSessionLength}
                  decrementSession={this.decrementSessionLength}
                  incrementBreak={this.incrementBreakLength}
                  decrementBreak={this.decrementBreakLength}
                />
              </div>

            </div>
            <div className="col-md-4">

            </div>
            <div className='col-md-4 card'>
              <div className="card-body">
                <Timer status={pomoStatus} time={timeLeft} />
                <PomoControllers play={this.playPomo} reset={this.resetPomoValues} />
                <PomoAudio ref={this.beepAudio} play={this.playAudio} />
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}

function PomodoroSetting(props) {
  return (
    <div className="pomodoro-settings ">
      <div className='row '>
        <div className="col-md-12 my-5">
          <h3 id="break-label">Break Length</h3>
        </div>
        <div className="col-md-5">
          <button
            id="break-increment"
            title="increment break time"
            onClick={props.incrementBreak}
            className="btn btn-success"
          >
            Increase
          </button>
        </div>
        
        <div className="col-md-2">
          <h4 id="break-length" className='p-1 border'>{props.break}</h4>
        </div>
        <div className="col-md-5">
          <button
            id="break-decrement"
            title="decrement break time"
            onClick={props.decrementBreak}
            className="btn btn-danger"
          >
            Decrease
          </button>
        </div>
      </div>
      <div className='row '>
        <div className="col-md-12 my-5">
          <h3 id="session-label">Session Length</h3>
        </div>
        <div className="col-md-5">
          <button
            id="session-increment"
            title="increment session time"
            onClick={props.incrementSession}
            className="btn btn-success"
          >
            Increase
          </button>
        </div>
        
        <div className="col-md-2">
          <h4 id="session-length" className='p-1 border'>{props.session}</h4>
        </div>
        <div className="col-md-5">
          <button
            id="session-decrement"
            title="decrement session time"
            onClick={props.decrementSession}
            className="btn btn-danger"
          >
            Decrease
          </button>
        </div>
      </div>
    </div>
  );
}

function Timer(props) {
  return (
    <div className="row my-5">
      <div className="col-md-12">
        <h1 id="time-left">{props.time}</h1>
      </div>
      <div className="col-md-12">
        <h4 id="timer-label">{props.status ? "Session" : "Break"}</h4>
      </div>
      
    </div>
  );
}

function PomoControllers(props) {
  return (
    <div className='row my-5'>

      <button id="start_stop" onClick={props.play} className=" btn btn-warning ">
        Play
      </button>
      <button id="reset" onClick={props.reset} className=" btn btn-info my-3">
        Reset
      </button>
    </div>
  );
}

const PomoAudio = React.forwardRef((props, ref) => {
  return (
    <div>
      <audio
        id="beep"
        ref={ref}
        preload="auto"
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      ></audio>
    </div>
  );
});



export default App;
