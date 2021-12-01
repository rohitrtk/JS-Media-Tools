class TimeStamp {
  constructor(startTime=null, endTime=null) {
    this._startTime = startTime;
    this._endTime = endTime;
  }

  setStartTime(startTime) {
    this._startTime = startTime;
  }

  getStartTime() {
    return this._startTime;
  }

  setEndTime(endTime) {
    this._endTime = endTime;
  }

  getEndTime() {
    return this._endTime;
  }

  getTimings() {
    return {
      start: this._formatTime(this._startTime),
      end: this._formatTime(this._endTime)
    }
  }

  _formatTime(time) {
    const minutes = Math.trunc(time / 60).toString();
    let seconds = Math.trunc(time % 60).toString();
    
    if(seconds.length === 1) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }
}

module.exports = TimeStamp;