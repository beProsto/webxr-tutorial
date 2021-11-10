# 3D Sounds

In the last article we've been going over 3D lighting, in this one we're going to do something pleasing less for the eye, and more for the ear.

When it comes to the topic of 3D sounds themselves; it's a hard topic. While it is simple to make something sound like it's on our left or right side, it's a lot harder to make something sound like it's behind or in front of us (not even getting into how hard it is to make sounds that are on top of and under you). 

So, to go around those struggles, we're going to use a pre-existing library that does all the hard stuff for us! That library will be: [resonance audio](https://resonance-audio.github.io/resonance-audio/).

So to start off, let's import `resonance audio` into our project, that will require us to open `index.html` for the first time, in a long, well, time. We'll simply need to add: 
```html
<script src="https://cdn.jsdelivr.net/npm/resonance-audio/build/resonance-audio.min.js"></script>
```
before any other `script` tag. Now we have succesfully included resonance into our project. So... How do we use it? Well - that's another thing. 

First let's make something that will empower us with the possibility to play sounds. A button will do just fine for now. Of course, later on in this tutorial we are going to add the sounds to the VR part of this application, but for now let's focus on testing if they actually work. 

What's nice about this approach is that we will not have to start up our headsets or phones yet. We will just simply test it out on our PC's, and then go on to implement it into VR.

So let's start off by creating a simple "`Play Sound`" button.
We will, of course, do it in the HTML part of our website.

That goes right after the creation of the first button:
```html
<button id="sound-button">Play sound</button>
```

We can add some style to it in the `<style>` section of course:
```css
#sound-button {
	background-color: rgba(251, 212, 255, 0.603);
	border: rgb(212, 133, 218) 2px solid;
	color: rgb(0, 0, 0);
	height: 50px;
	min-width: 160px;
}
```

This is how our website should look after these modifications:

![screenshot](data/tutorial10/tutorial10_screenshot1.png)

Now let's code it's functionality of playing a sound effect.

We'll start by defining some globals which will give us the ability to create and play those 3D sounds.
```js
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

// Let's keep track of the number of audios in the scene for absolutely no reason other than that we can assign them ID's based on in what place they were created
let audios = 0;
```

Great! Now it does the exact same thing as before, but with more code! So, we have a couple things to answer before we call it finished:

- How do we create audio?
- How can we play that audio?
- How do we loop the audio?
- How do we stop it?
- Can we manually set the timestamp that the audio should start from?
- How do we make the audio 3D and dependant on our head's motion?
- How to actually play it in VR mode?

Well, Let me answer all of these questions for you.

## First, creating the audio.

You see, even with all the simplicity that `resonance` guarantees us, creating a simple playable audio is still a sort of a pain.

That's why we're going to wrap it all up into a neat class that we can then later use for every sound in our scene.

```js
// This class will contain everything we need for 3D Audio
class PlayableAudio {
```

Now that we have a class, let's give it a constructor. The sounds' constructor should, in my eyes, take in the following arguments:
1. The URL for the audio file itself - We want to be able to actually get the audio from somewhere!
2. The audio's position in the scene - Well, it's a 3D sound, we want to be able to define it's placement in the scene.
3. Wether or not we want the audio to be looped - This is kind of crucial, the answer to wether we need it looped or not will greatly depend on the sound's purpose in the scene.

```js
	constructor(_url, _position, _loop = false) {
```

Now, inside of that constructor we'll have to define every single element of the class.
First comes the ID, that'll be useful for debugging, but isn't necessary and can absolutely - even should - be deleted.

Then we set the url and the position of the sound to the ones passed in.
We do the same for the loop property.

```js
		// We should know which one it is, for debugging purposes
		this.id = audios;
		audios++;
		// It should know where it's audio comes from - we'll have to get the audio from somewhere :D
		this.url = _url;
		// It should know the position from which we'll hear it
		this.posX = _position[0];
		this.posY = _position[1];
		this.posZ = _position[2];
		// We want to know if it's a loop + we want to be able to set it the way we want it
		this.isLoop = _loop;
```

We also want a way to check if the sound is being played - so that we can make sure we're not stopping a stopped sound, playing a playing one, and for other weird scenarios like these;

```js
		// Wether it's playing or not 
		// - playable tells us if the sound isn't currently being stopped, 
		// whilst playing determines wether or not it is, actually, playing
		this.isPlayable = true;
		this.isPlaying = false;
```

Contrary to what the comment i made myself would have you believe, callbacks are actually really helpful!
These are functions that the user (us in this case, lol) can define on their own, that will happen when a certain thing happens.
The names themselves will explain better:

```js
		// These are useless callbacks but whatever
		this.onFinished = () => {};
		this.onStarted = () => {};
```

Now that we have all this, basically, setup, out of the way - we can start actually doing stuff somewhat related to sound!
Here

If we test out our website now, we should be able to play the sound and then reset it, just as we see fit.
I'm just happy that I don't have to listen to it on loop anymore. :D

## Third of all, can we manually set the timestamp the audio should start from?
```js
```

## Fourth of all, the audio positioning based on the head's position and rotation.
So there are essentially two ways of going around it:
We either take our head's view matrix, inverse it and multiply every points position by that resulting matrix or we use some kind of a function built-in to this library which will, essentially, do it for us. :D



You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial10)!

Previous: [Experimenting with lighting](tutorial9)

<div GITHUB_API_ID="10"></div>

{% include comments.html %}