// Create an AudioContext
let audioContext = new AudioContext();

// Create a (first-order Ambisonic) Resonance Audio scene and pass it
// the AudioContext.
let resonanceAudioScene = new ResonanceAudio(audioContext);

// Connect the scene’s binaural output to stereo out.
resonanceAudioScene.output.connect(audioContext.destination);


// Add the room definition to the scene.
resonanceAudioScene.setRoomProperties({}, {});

// Create an AudioElement.
let audioElement = document.createElement('audio');

// Load an audio file into the AudioElement.
audioElement.src = 'bruh.mp3';

// Generate a MediaElementSource from the AudioElement.
let audioElementSource = audioContext.createMediaElementSource(audioElement);

// Add the MediaElementSource to the scene as an audio input source.
let source = resonanceAudioScene.createSource();
audioElementSource.connect(source.input);
// Set the source position relative to the room center (source default position).
source.setPosition(0.0, 0.0, 0.0);

// Play the audio.
document.getElementById("playButtonFront").onclick = (e) => {audioElement.play();};

//29BA609N66J