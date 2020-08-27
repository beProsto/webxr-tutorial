# 3D Sounds

## This article will be dedicated for 3D sounds in VR space.

In the last article we've been going over 3D lighting, in this one we're going to do something pleasing less for the eye, and more for the ear.

When it comes to the topic of 3D sounds themselves; it's a hard topic. While it is simple to make something sound like it's on our left or right side, it's a lot harder to make something sound like it's behind or in front of us (not even getting into how hard it is to make sounds that are on top of and under you). 

So, to go around those struggles, we're going to use a pre-existing library that does all the hard stuff for us! That library will be: [resonance audio](https://resonance-audio.github.io/resonance-audio/).

So to start off, let's import `resonance audio` into our project, that will require us to open `index.html` for the first time, in a long, well, time. We'll simply need to add: 
```html
<script src="https://cdn.jsdelivr.net/npm/resonance-audio/build/resonance-audio.min.js"></script>
```

before any other `script` tag. Now we have succesfully included resonance into our project. So... How do we use it? Well - that's another thing. First we'll have to setup some globals for our audio (in `index.js` of course):
```js
// resonance globals
let audioContext = new AudioContext();
let resonance = new ResonanceAudio(audioContext);

// Connect the scene’s binaural output to stereo out.
resonance.output.connect(audioContext.destination);

// Define room dimensions.
// By default, room dimensions are undefined (0m x 0m x 0m).
let roomDimensions = {
	width: 5,
	height: 5,
	depth: 5,
};

// Define materials for each of the room’s six surfaces.
// Room materials have different acoustic reflectivity.
let roomMaterials = {
	// Room wall materials
	left: "brick-bare",
	right: "curtain-heavy",
	front: "marble",
	back: "glass-thin",
	// Room floor
	down: "grass",
	// Room ceiling
	up: "transparent",
};

// Add the room definition to the scene.
resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);
```

Now let's create a sound. For now there will be only one looped sound playing in our scene.
```js
// Create an AudioElement.
let audioElement = document.createElement("audio");

// Load an audio file into the AudioElement.
audioElement.src = "irritating_noise.wav";

// Generate a MediaElementSource from the AudioElement.
let audioElementSource = audioContext.createMediaElementSource(audioElement);

// Add the MediaElementSource to the scene as an audio input source.
let source = resonanceAudioScene.createSource();
audioElementSource.connect(source.input);

// Set the source position relative to the room center (source default position).
source.setPosition(-1.0, -1.0, 0.0);
```

After the scene is finally loaded we'd want to play our sound:
```js
function onSessionFrame(t, frame) { // this function will happen every frame
	// Play the audio.
	audioElement.play();
```

You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial10)!

Previous: [Experimenting with lighting](tutorial9)

<div GITHUB_API_ID="10"></div>

{% include comments.html %}
