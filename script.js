// source: http://drum-machine.maryrosecook.com/
let audio = new AudioContext();

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

note(audio, 440)();