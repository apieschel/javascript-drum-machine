// source: http://drum-machine.maryrosecook.com/

let audio = new AudioContext();

function createSineWave() {
  let oscillator = audio.createOscillator();
  oscillator.type = "sine";
}

function note(audio, frequency) {
  return function() {
    let duration = 1;
    let sineWave = createSineWave(audio, duration);
  }
}

note(audio, 440)();
