const { ipcRenderer } = require('electron');
const TimeStamp = require('./timestamp');

// DOM References
const bSelectAudio      = document.getElementById('select-audio-button');
const bExportTimestamps = document.getElementById('export-timestamps');
const bToggleAudio      = document.getElementById('toggle-audio');
const lbSelectedAudio   = document.getElementById('selected-audio-label');
const lbThreshold       = document.getElementById('threshold-label');
const inThreshold       = document.getElementById('threshold-input');
const liTimestamps      = document.getElementById('timestamps-list');
const canvas            = document.getElementById('canvas');
const ctx               = canvas.getContext('2d');

// Draw loop variables
const fps         = 60;
const targetTime  = 1000 / fps;
let running       = false;
let startTime, now, then, elapsed;

// Audio references
let audio, audioContext, audioAnalyzer, dataArray, bufferLength, selectedAudioFile; 
let isSilent = false;
let audioThreshold = 250;

let timestamps = [];

inThreshold.setAttribute('value', audioThreshold);
inThreshold.addEventListener('input', event => {
  audioThreshold = event.target.value;
});

bSelectAudio.addEventListener('click', () => ipcRenderer.send('select-audio-button-clicked'));

bExportTimestamps.disabled = true;
bExportTimestamps.addEventListener('click', () => {
  if(!audio) {
    alert('No audio selected!');
    return;
  }
  
  if(!audio.paused) {
    audio.pause();
  }

  bSelectAudio.disabled = true;
  bToggleAudio.disabled = true;
  bExportTimestamps.disabled = true;
  
  audio.currentTime = 0;
  audio.playbackRate = 16;

  ipcRenderer.send('export-timestamps-button-clicked');
});

ipcRenderer.on('begin-export', () => {
  const onAudioEnd = event => {
    audio.removeEventListener('ended', onAudioEnd);

    bSelectAudio.disabled = false;
    bToggleAudio.disabled = false;
    bExportTimestamps.disabled = false;

    audio.playbackRate = 1;

    ipcRenderer.send('export-timestamps', timestamps);
  }

  audio.addEventListener('ended', onAudioEnd);
  audio.play();
});

ipcRenderer.on('export-complete', () => {
  alert('Timestamp export complete');
});

bToggleAudio.disabled = true;
bToggleAudio.addEventListener('click', () => {
  if(!audio) {
    alert('No audio selected!');
    return;
  }

  // If audio is playing...
  if(!audio.paused) {
    audio.pause();
    bToggleAudio.innerHTML = 'Play Audio';
  } else {
    if(audio.playbackrate !== 1) {
      audio.playbackrate = 1;
    }
    audio.play();
    bToggleAudio.innerHTML = 'Pause Audio';
  }
});

const silentEventStarted = new CustomEvent('silentevent', {
  detail: { silent: true }
});

const silentEventEnded = new CustomEvent('silentevent', {
  detail: { silent: false }
});

const reset = () => {
  audio.pause();
  isSilent = false;
  
  timestamps = [];
  
  while(liTimestamps.firstChild) {
    liTimestamps.removeChild(liTimestamps.firstChild);
  }
  liTimestamps.innerHTML = '<b>Timestamps</b>';

  bToggleAudio.innerHTML = 'Play Audio';
  bToggleAudio.disabled = true;
  bExportTimestamps.disabled = true;
}

ipcRenderer.on('audio-file-selected', (event, newSelectedAudioFile) => {
  if(selectedAudioFile) {
    reset();
  }

  selectedAudioFile = newSelectedAudioFile;
  lbSelectedAudio.innerText = newSelectedAudioFile;

  running = true;

  bToggleAudio.disabled = false;
  bExportTimestamps.disabled = false;

  initAudio();
  beginDraw();
});

const initAudio = () => {
  audio = new Audio(selectedAudioFile);
  //audio.playbackRate = 16;

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

  if(!audio.paused) {
    let sum = 0;
    for(const value in dataArray) {
      sum += Math.abs(128 - dataArray[value]);
    }

    if(sum < audioThreshold && !isSilent) {
      document.dispatchEvent(silentEventStarted);
    } else if(sum >= audioThreshold && isSilent) {
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
      const ts = timestamps.at(-1);
      ts.setEndTime(currentTime);

      const liTs = document.createElement('li');
      liTs.innerHTML = `StartTime: ${ts.getStartTime()} EndTime: ${ts.getEndTime()}`;
      liTimestamps.appendChild(liTs);
      //console.log(`Created new timestamp: ${JSON.stringify(ts)}`);
    }
    
    //console.log('Silent');
  } else {
    timestamps.push(new TimeStamp(currentTime));

    //console.log('Sound');
  }
})
