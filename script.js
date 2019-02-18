// source: http://drum-machine.maryrosecook.com/
const BUTTON_SIZE = 26;
const screen = document.getElementById("screen").getContext("2d");
const audio = new AudioContext();
const data = {
  step: 0,
  tracks: [createTrack("gold", note(audio, 880)),
           createTrack("gold", note(audio, 659)),
           createTrack("gold", note(audio, 587)),
           createTrack("gold", note(audio, 523)),
           createTrack("gold", note(audio, 440)),
           createTrack("dodgerblue", kick(audio))]
};

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
      drawButton(screen, column, row, on ? track.color : "lightgray");
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
    .forEach(function(track) {track.playSound(); });
}, 100);

// draw 
(function draw() {
  screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
  drawTracks(screen, data);
  drawButton(screen, data.step, data.tracks.length, "deeppink");
  requestAnimationFrame(draw);
})();

// handle events
(function setupButtonClicking() {
  addEventListener("click", function(e) {
    let p = { x: e.clientX, y: e.clientY };
    data.tracks.forEach(function(track, row) {
      track.steps.forEach(function(on, column) {
        if(isPointInButton(p, column, row)) {
          track.steps[column] = !on;    
        }
      });
    });
  });
})();