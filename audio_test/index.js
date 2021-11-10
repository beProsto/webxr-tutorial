
// Create an AudioContext
let audioContext = new AudioContext();

// Create a (first-order Ambisonic) Resonance Audio scene and pass it
// the AudioContext.
let resonanceAudioScene = new ResonanceAudio(audioContext);

// Connect the scene’s binaural output to stereo out.
resonanceAudioScene.output.connect(audioContext.destination);

// Add the room definition to the scene. We are passing in two objects, both of which i will leave empty for now, so they set to default values.
// The first object defines the room's width, height and length 
// while the second one defines the materials it's walls are made up of.
// For more information you can visit the Resonance Audio's website. :D
resonanceAudioScene.setRoomProperties({}, {});

// Let's keep track of the number of audios in the scene for absolutely no reason
let audios = 0;

// This class will contain everything we need for 3D Audio
class PlayableAudio {
	constructor(_url, _position, _loop = false) {
		// We should know which one it is
		this.id = audios;
		audios++;
		// It should know where it's audio comes from
		this.url = _url;
		// It should know the position from which we'll hear it
		this.posX = _position[0];
		this.posY = _position[1];
		this.posZ = _position[2];

		// Wether it's playing or not
		this.playable = true;
		this.playing = false;

		// We want to know if it's a loop
		this.isLoop = _loop;
		
		// Create a Resonance source and set its position in space.
		this.source = resonanceAudioScene.createSource();
		this.source.setPosition(this.posX, this.posY, this.posZ);

		// These will be filled when the sound is loaded
		this.buffer = null;
		this.bufferSource = null;

		// These are useless callbacks but whatever
		this.onFinished = () => {};
		this.onStarted = () => {};

		// We create a reference to the object itself
		const self = this;

		fetch(this.url).then( // first we retrieve the data hiding behind the url, most likely it'll just be the audio file
			(response) => response.arrayBuffer() // after retrieving the file, we treat it as a buffer or data, at this point it doesn't really matter what data it is
		).then(
			(buffer) => audioContext.decodeAudioData(buffer) // then we get the data we retrieved and finally try and find sound in it
		).then( // if we found sound, as in - if the file contains audio data
			(decodedBuffer) => {
				self.buffer = decodedBuffer;
				self.genBufferSource(); // we create the actual buffer that will be played
			}
		);
	}

	// Generates the buffer that'll actually be played
	genBufferSource() {
		// Create a buffer source. This will need to be recreated every time
		// we wish to start the audio, see
		// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
		this.bufferSource = audioContext.createBufferSource();
		this.bufferSource.loop = this.isLoop;
		this.bufferSource.connect(this.source.input); // we connect the audio, this will have to be reversed as soon as the audio ends

		this.bufferSource.buffer = this.buffer;

		// Upon generating the buffer source, we define it's destructor - what happens, when it stops
		// Audio can be ended both by a user (the stop function), and by itself - just reaching the end
		this.bufferSource.onended = () => {
			this.bufferSource.disconnect(); // we disconnect the audio, to get rid of some nasty handlers
			delete this.bufferSource;

			//this.bufferSource = null;
			this.genBufferSource(); // we regenerate the buffer source - as we know, it has to be done every time the buffer ends, thus we do it here

			this.playable = true;
			this.playing = false;

			this.onFinished();

			console.log(`Audio ${this.id} was in fact stopped!`);
		};
	}

	// Play the audio (with the option of starting at a given time)
	play(_from = 0) {
		console.log(`Audio ${this.id} attempted to be played!`);
		
		if(this.playable && !this.playing) {
			this.bufferSource.start(0, _from);
			console.log(`Audio ${this.id} has been indeed played!`);

			this.playing = true;

			this.onStarted();
		}
	}

	// Stop the audio 
	stop() {
		console.log(`Audio ${this.id} attempted to be stopped!`);

		if(this.playable && this.playing) {
			this.playable = false;

			this.bufferSource.stop(0);
			console.log(`Audio ${this.id} to be stopped!`);
		}
	}

	// These simply let us know and set if the audio is looped
	set loop(_loop) {
		this.isLoop = _loop;
		this.bufferSource.loop = this.isLoop;
	}
	get loop() {
		return this.isLoop;
	}
	
	// This one lets us check the duration of the audio (in seconds)
	get duration() {
		return this.buffer.duration;
	}

	// Set and get audio's position
	set position(_pos) {
		this.posX = _pos[0];
		this.posY = _pos[1];
		this.posZ = _pos[2];

		this.source.setPosition(this.posX, this.posY, this.posZ);
	}
	get position() {
		return [this.posX, this.posY, this.posZ];
	}
}

// Make audios
let audio1 = new PlayableAudio("/amogus.mp3", [2.0, 0.0, 2.0]);

// Play the audio.
const playTime = document.getElementById("time");
const playButton = document.getElementById("playButtonFront");
playButton.onclick = (e) => {
	audioContext.resume();
	if(playButton.innerHTML == "play") {
		playButton.innerHTML = "stop";
		audio1.play(parseFloat(playTime.value));
	}
	else {
		playButton.innerHTML = "play";
		audio1.stop();
	}
};

// When audio finishes we want to automatically reset to a play button
audio1.onFinished = () => { playButton.innerHTML = "play"; };

// Choose wether or not to loop the audio.
const loopButton = document.getElementById("loopButtonFront");
loopButton.onclick = (e) => {
	audioContext.resume();
	if(loopButton.innerHTML == "loop on") {
		loopButton.innerHTML = "loop off";
		audio1.loop = false;
	}
	else {
		loopButton.innerHTML = "loop on";
		audio1.loop = true;
	}
};

// Audio position controll 
const positionBox = document.getElementById("positionBox");
const positionDot = document.getElementById("positionDot");
positionBox.onmousedown = (e) => {
	positionDot.style.top = e.offsetY + "px";
	positionDot.style.left = e.offsetX + "px";

	audio1.position = [e.offsetX / 100 * 6 - 3, 0, e.offsetY / 100 * 6 - 3]
};