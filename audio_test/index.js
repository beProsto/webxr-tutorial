// Create an AudioContext
let audioContext = new AudioContext();

// Create a (first-order Ambisonic) Resonance Audio scene and pass it
// the AudioContext.
let resonanceAudioScene = new ResonanceAudio(audioContext);

// Connect the scene’s binaural output to stereo out.
resonanceAudioScene.output.connect(audioContext.destination);
audioContext.suspend();

// Add the room definition to the scene.
resonanceAudioScene.setRoomProperties({}, {});

function createBufferSource(source, buffer) {
	// Create a buffer source. This will need to be recreated every time
	// we wish to start the audio, see
	// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
	let bufferSource = audioContext.createBufferSource();
	bufferSource.loop = true;
	bufferSource.connect(source.input);

	bufferSource.buffer = buffer;

	return bufferSource;
}
function createAudioSource(options) {
	// Create a Resonance source and set its position in space.
	let source = resonanceAudioScene.createSource();
	let pos = options.position;
	source.setPosition(pos[0], pos[1], pos[2]);

	return fetch(options.url)
		.then((response) => response.arrayBuffer())
		.then((buffer) => audioContext.decodeAudioData(buffer))
		.then((decodedBuffer) => {
			let bufferSource = createBufferSource(source, decodedBuffer);

			return {
				buffer: decodedBuffer,
				bufferSource: bufferSource,
				source: source,
				position: pos,
			};
		});
}
function playAudio(audioSource) {
	//if(audioContext.state == 'running') return;


	audioSource.bufferSource.start(0);
}
function pauseAudio(audioSource) {
	//if(audioContext.state == 'suspended') return;

	audioSource.bufferSource.disconnect();
	audioSource.bufferSource.stop(0);
	audioSource.bufferSource = createBufferSource(audioSource.source, audioSource.buffer);
}
let source;
let source2;
createAudioSource({position: [5.0, 0.0, -1.0], url: "/amogus.mp3"}).then((fetched) => {
	console.log("finished");
	audioContext.resume();
	source = fetched;
});
createAudioSource({position: [-5.0, 0.0, -1.0], url: "/bruh.mp3"}).then((fetched) => {
	console.log("finished2");
	audioContext.resume();
	source2 = fetched;
});


// Play the audio.
const playButton = document.getElementById("playButtonFront");
playButton.onclick = (e) => {
	if(source && source2) {
		if(playButton.innerHTML == "play") {
			playButton.innerHTML = "stop";
			playAudio(source);
			playAudio(source2);
		}
		else {
			playButton.innerHTML = "play";
			pauseAudio(source);
			pauseAudio(source2);
		}
	}
};