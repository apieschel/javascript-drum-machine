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

/*
function createSineWave(audio, duration) {
  let oscillator = audio.createOscillator();
  oscillator.type = "sine";
  
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
  
  return oscillator;
};

function rampDown(audio, item, startValue, duration) {
  item.setValueAtTime(startValue, audio.currentTime);
  item.exponentialRampToValueAtTime(0.01, audio.currentTime + duration);
};

function createAmplifier(audio, startValue, duration) {
  let amplifier = audio.createGain();
  rampDown(audio, amplifier.gain, startValue, duration);
  return amplifier;
};

function chain(items) {
  for(let i = 0; i < items.length - 1; i++) {
    items[i].connect(items[i + 1]);
  }
};

function note(audio, frequency) {
  return function() {
    let duration = 1;
    let sineWave = createSineWave(audio, duration);
    sineWave.frequency.value = frequency;
    chain([sineWave, createAmplifier(audio, 0.2, duration), audio.destination]);
  }
};

function kick(audio, frequency) {
  return function() {
    let duration = 2;
    let sineWave = createSineWave(audio, duration);
    rampDown(audio, sineWave.frequency, 160, duration);
    
    chain([sineWave, createAmplifier(audio, 0.4, duration), audio.destination]);
  }
};
*/

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

// update 
setInterval(function() {
  data.step = (data.step + 1) % data.tracks[0].steps.length;
  
  data.tracks
    .filter(function(track) { return track.steps[data.step]; })
    .forEach(function(track) {
      let clone = track.playSound.cloneNode(true);
      clone.play(); 
    });
}, 100);

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
    console.log(p);
    data.tracks.forEach(function(track, row) {
      track.steps.forEach(function(on, column) {
        if(isPointInButton(p, column, row)) {
          track.steps[column] = !on;    
        }
      });
    });
  });
  
  // Record button click event
  document.getElementById("record").addEventListener("click", function() {
    // Source: https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
    console.log("You're recording!");
    
    navigator.mediaDevices.getUserMedia({audio: true});
  });
})();