// source: http://drum-machine.maryrosecook.com/
let audio = new AudioContext();

function createSineWave(audio, duration) {
  let oscillator = audio.createOscillator();
  oscillator.type = "sine";
  
  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + duration);
  
  return oscillator;
};

function createAmplifier(audio, startValue, duartion) {

};

function note(audio, frequency) {
  return function() {
    let duration = 1;
    let sineWave = createSineWave(audio, duration);
    
    sineWave.connect(audio.destination);
  }
};

note(audio, 440)();