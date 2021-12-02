class TimeStamp {
  /**
   * Class constructor. Converts startTime and endTime from a Number
   * to a String.
   * @param {Number} startTime 
   * @param {Number} endTime 
   */
  constructor(startTime=null, endTime=null) {
    this._startTime = TimeStamp.formatTime(startTime);
    this._endTime = TimeStamp.formatTime(endTime);
  }

  /**
   * Setter for startTime. Converts startTime to a String!
   * @param {Number} startTime 
   */
  setStartTime(startTime) {
    this._startTime = TimeStamp.formatTime(startTime);
  }

  /**
   * Getter for startTime.
   * @returns {String}
   */
  getStartTime() {
    return this._startTime;
  }

  /**
   * Setter for endTime. Converts endTime to a String!
   * @param {Number} endTime 
   */
  setEndTime(endTime) {
    this._endTime = TimeStamp.formatTime(endTime);
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