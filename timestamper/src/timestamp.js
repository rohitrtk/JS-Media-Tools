class TimeStamp {
  /**
   * Class constructor.
   * @param {Number} startTime 
   * @param {Number} endTime 
   */
  constructor(startTime=null, endTime=null) {
    this._startTime = startTime ? startTime.toFixed(3) : startTime; //TimeStamp.formatTime(startTime);
    this._endTime = endTime ? endTime.toFixed(3) : endTime; //TimeStamp.formatTime(endTime);
  }

  /**
   * Setter for startTime.
   * @param {Number} startTime 
   */
  setStartTime(startTime) {
    this._startTime = startTime.toFixed(3); //TimeStamp.formatTime(startTime);
  }

  /**
   * Getter for startTime.
   * @returns {String}
   */
  getStartTime() {
    return this._startTime;
  }

  /**
   * Setter for endTime.
   * @param {Number} endTime 
   */
  setEndTime(endTime) {
    this._endTime = endTime.toFixed(3); //TimeStamp.formatTime(endTime);
  }

  /**
   * Getter for endTime.
   * @returns {String}
   */
  getEndTime() {
    return this._endTime;
  }

  /**
   * Returns startTime and endTime bundled in an object.
   * @returns {Object}
   */
  getTimings() {
    return {
      start: this._startTime,
      end: this._endTime
    }
  }

  /**
   * Static function which formats a Number into a 
   * prettified String of the form "minutes:seconds".
   * @param {Number} time 
   * @returns {String}
   */
  static formatTime(time) {
    const minutes = Math.trunc(time / 60).toString();
    let seconds = Math.trunc(time % 60).toString();
    
    if(seconds.length === 1) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }
}

module.exports = TimeStamp;