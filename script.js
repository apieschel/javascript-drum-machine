const ac = new AudioContext();
const recorderNode = ac.createGain();
recorderNode.gain.value = 0.7;
const rec = new Recorder(recorderNode);

// source: http://drum-machine.maryrosecook.com/
const BUTTON_SIZE = 26;
const screen = document.getElementById("screen").getContext("2d");
const green = "#00BA8C";
const orange = "#F15A2B";

const kick = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_bassdrum.wav?1550690555700');
const snare = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_snare.wav?1550690555419');
const snareSide = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_snare_sidestick.wav?1550690555484');
const conga = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_conga.wav?1550690555716');
const congaHigh = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_conga_high.wav?1550690555911');
const highHat = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_hihat.wav?1550690556072');
const openHat = new Audio('https://cdn.glitch.com/cc093c8e-9559-4f24-a71e-df60d5b1502c%2FMT52_openhat.wav?1550690556269');

const data = {
  step: 0,
  tracks: [createTrack(green, kick),
           createTrack(green, snare),
           createTrack(green, snareSide),
           createTrack(green, conga),
           createTrack(green, congaHigh),
           createTrack(green, highHat),
           createTrack(green, openHat)]
};

let midi = false;
let count = 0;

let interval = setInterval(function() {
  data.step = (data.step + 1) % data.tracks[0].steps.length;

  data.tracks
    .filter(function(track) { return track.steps[data.step]; })
    .forEach(function(track) {
      let clone = track.playSound.cloneNode(true);
      clone.play(); 
      clone.remove();
    });
}, 100);

function createTrack(color, playSound) {
  let steps = [];
  for(let i = 0; i < 16; i++) {
    steps.push(false);
  }
  return {steps: steps, color: color, playSound: playSound};
};

function buttonPosition(column, row) {
  return {
    x: BUTTON_SIZE / 2 + column * BUTTON_SIZE * 1.5,
    y: BUTTON_SIZE / 2 + row * BUTTON_SIZE * 1.5
  };
};

function drawButton(screen, column, row, color) {
  let position = buttonPosition(column, row);
  screen.fillStyle = color;
  screen.fillRect(position.x, position.y, BUTTON_SIZE, BUTTON_SIZE);
};

function drawTracks(screen, data) {
  data.tracks.forEach(function(track, row) {
    track.steps.forEach(function(on, column) {
      drawButton(screen, column, row, on ? track.color : "ghostwhite");
    });
  });
};

function isPointInButton(p, column, row) {
  let b = buttonPosition(column, row);
  return !(p.x < b.x || 
           p.y < b.y ||
           p.x > b.x + BUTTON_SIZE ||
           p.y > b.y + BUTTON_SIZE);
};

function onMIDISuccess(midiAccess, midiOptions) {
  const inputs = midiAccess.inputs;
  const outputs = midiAccess.outputs;

  for (var input of midiAccess.inputs.values()) {
      input.onmidimessage = getMIDIMessage;
  }
}

function getMIDIMessage(message) {
  const command = message.data[0];
  const note = message.data[1];
  const velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

  switch (command) {
    case 144: // noteOn
      if (velocity > 0) {	
        if(count === 16) {
          count = 1;
        } else {
          count = count + 1;
        }
        
        data.step = (data.step + 1) % data.tracks[0].steps.length;
        
        data.tracks
          .filter(function(track) { return track.steps[data.step]; })
          .forEach(function(track) {
            let clone = track.playSound.cloneNode(true);
            clone.play(); 
            clone.remove();
          });
      } else {
        
      }
      break;
    case 128: // noteOff
        break;
    // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
  }
}

function onMIDIFailure() {
  console.log('Could not access your MIDI devices.');
}

// update 
function update() {
  if(midi === false) {
    location.reload();
  } else {
    navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
  }
}

// draw 
(function draw() {
  screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
  drawTracks(screen, data);
  drawButton(screen, data.step, data.tracks.length, orange);
  requestAnimationFrame(draw);
})();

// handle click events on tracks
(function setupButtonClicking() {
  addEventListener("click", function(e) {
    let p = { x: e.offsetX, y: e.offsetY };
    data.tracks.forEach(function(track, row) {
      track.steps.forEach(function(on, column) {
        if(isPointInButton(p, column, row)) {
          track.steps[column] = !on;    
        }
      });
    });
  });
  
  // Record button click event
  /*
  document.getElementById("record").addEventListener("click", function() {
    // Source: https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
    const canvasStream = document.getElementById("screen").captureStream();
    const mediaRecorder = new MediaRecorder(canvasStream);
    const audioChunks = [];
    mediaRecorder.start();

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
      console.log(audioChunks);
    });
  });
  */
  
  document.getElementById("midi").addEventListener("click", function() {
    midi = !midi; 
    clearInterval(interval);
    data.step = 0;
    update();
    if(midi) {
      document.getElementById("midi").innerHTML = "MIDI ON";
    } 
  });
  
})();