const { ipcRenderer } = require('electron');
const TimeStamp = require('./timestamp');

const bSelectAudio      = document.getElementById('select-audio-button');
const bGetJson          = document.getElementById('selected-audio-label');
const bPlayAudio        = document.getElementById('play-audio');
const bPauseAudio       = document.getElementById('pause-audio');
const lbSelectedAudio   = document.getElementById('selected-audio-label');
const liTimestamps      = document.getElementById('timestamps-list');
const canvas            = document.getElementById('canvas');
const ctx               = canvas.getContext('2d');

const fps = 60;
const targetTime = 1000 / fps;

let selectedAudioFile = null;
let audioPlaying = false;

let running = false;
let frameCount = 0;
let startTime, now, then, elapsed;

let audio = null;
let audioContext;
let audioAnalyzer = null;
let dataArray = null;
let bufferLength;
let isSilent = false;

let timestamps = [];

bSelectAudio.addEventListener('click', () => ipcRenderer.send('select-audio-button-clicked'));
bGetJson.addEventListener('click', () => ipcRenderer.send('get-json-button-clicked'));

bPlayAudio.addEventListener('click', () => {
  if(audio) {
    audio.play();
  }
});

bPauseAudio.addEventListener('click', () => {
  if(audio) {
    audio.pause();
  }
});

const silentEventStarted = new CustomEvent('silentevent', {
  detail: { silent: true }
});

const silentEventEnded = new CustomEvent('silentevent', {
  detail: { silent: false }
});

ipcRenderer.on('audio-file-selected', (event, saf) => {
  selectedAudioFile = saf;
  lbSelectedAudio.innerText = saf;

  running = true;

  initAudio();
  beginDraw();
});

const initAudio = () => {
  audio = new Audio(selectedAudioFile);
  //audio.playbackRate = 16;
  
  audio.addEventListener('play', () => {
    audioPlaying = true;
  });

  audio.addEventListener('pause', () => {
    audioPlaying = false;
  });

  audioContext = new AudioContext();
  audioAnalyzer = audioContext.createAnalyser();
  audioAnalyzer.fftSize = 2048;

  bufferLength = audioAnalyzer.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  audioAnalyzer.getByteTimeDomainData(dataArray);

  const source = audioContext.createMediaElementSource(audio);
  source.connect(audioContext.destination);
  source.connect(audioAnalyzer);
}

const beginDraw = () => {
  then = window.performance.now();
  startTime = then;

  drawLoop();
}

const drawLoop = (newTime) => {
  if(!running) {
    return;
  }

  requestAnimationFrame(drawLoop);

  now = newTime;
  elapsed = now - then;

  if(elapsed > targetTime) {
    then = now - elapsed % targetTime;

    render();
  }
}

const render = () => {
  audioAnalyzer.getByteTimeDomainData(dataArray);

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(255, 16, 240)';

  ctx.beginPath();

  const sliceWidth = canvas.width * 1.0 / bufferLength;
  let x = 0;

  for(let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;

    if(i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  if(audioPlaying) {
    const threshhold = 250;
    let sum = 0;
    for(const value in dataArray) {
      sum += Math.abs(128 - dataArray[value]);
    }

    if(sum < threshhold && !isSilent) {
      document.dispatchEvent(silentEventStarted);
    } else if(sum >= threshhold && isSilent) {
      document.dispatchEvent(silentEventEnded);
    }
  }
}

document.addEventListener('silentevent', event => {
  if(!audio) {
    return;
  }
  
  isSilent = event.detail.silent;
  const currentTime = audio.currentTime;

  if(isSilent) {
    if(timestamps.length > 0) {
      const prevTimestamp = timestamps.at(-1);
      prevTimestamp.setEndTime(currentTime);
      console.log(`Created new timestamp: ${JSON.stringify(prevTimestamp.getTimings())}`);
    }
    
    //console.log('Silent');
  } else {
    timestamps.push(new TimeStamp(currentTime));

    //console.log('Sound');
  }
})
