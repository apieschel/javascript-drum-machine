// source: http://drum-machine.maryrosecook.com/
const BUTTON_SIZE = 26;
const screen = document.getElementById("screen").getContext("2d");
const audio = new AudioContext();

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
}

function note(audio, frequency) {
  return function() {
    let duration = 1;
    let sineWave = createSineWave(audio, duration);
    
    chain([sineWave, createAmplifier(audio, 0.2, duration), audio.destination]);
  }
};

function createTrack(color, playSound) {
  let steps = [];
  for(let i = 0; i < 16; i++) {
    steps.push(false);
  }
  
  return {steps: steps, color: color, playSound: playSound};
}

let data = {
  step: 0,
  tracks: [createTrack("gold", note(audio, 440))]
}

function buttonPosition(column, row) {
  return {
    x: BUTTON_SIZE / 2 + column * BUTTON_SIZE * 1.5,
    y: BUTTON_SIZE / 2 + row * BUTTON_SIZE * 1.5
  };
}

function drawButton(screen, column, row, color) {
  let position = buttonPosition(column, row);
  screen.fillStyle = color;
  screen.fillRect(position.x, position.y, BUTTON_SIZE, BUTTON_SIZE);
}

function drawTracks(screen, data) {
  data.tracks.forEach(function(track, row) {
    track.steps.forEach(function(on, column) {
      drawButton(screen, column, row, on ? track.color : "lightgray");
    });
  });
}

// draw 
(function draw() {
  drawTracks(screen, data);
  requestAnimationFrame(draw);
})();

// handle events
(function setupButtonClicking() {
  addEventListener("click", function(e) {
    let p = { x: e.clientX, y: e.clientY };
    data.tracks.forEach(function(on, column) {
    
    });
  });
})();