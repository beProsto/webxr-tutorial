# 3D Sounds

# THIS ARTICLE IS NOT YET FINISHED

#### I was trying to make it work for the past year, fixed a copuple issues but I still have a couple problems with it that I would just like to fix before giving this tutorial to you. I don't want to ship a rushed, broken in places piece of [...]. I want my tutorials to fix problems, not create them, and this is what giving you the current solution would do. There's some type of a memory leak caused by using the web audio api, I need to look into it. The point is: I can't really finish the tutorial now, the thing you can read below was broken from the start, don't worry, we will not be using it, I need some time off to focus on a little bit more important things going on in my personal life. This goes on for hold, I am sorry to, well, myself, that the current situation brought me here. To the point at which I stopped pursuing my passions for more than an entire year... I'm also afraid that during that time my grades are not the only thing that decreased, but my ability and knowledge about writing code has also. I'm afraid that pauses like these could make me slower, maybe, likely actually, make me forget stuff... I'm dissapointed at myself. When will this end? Why am I making some sort of a thought bag out of this? If only I could write essays like this.. Can this pandemic just end? I know it's not the only reason why I have a hard time doing anything, but it most definitely messed up my schedule, discouraged me from learning the proper way, and made me, well, lazy overall. These issues, of course, as for anyone (I think), were issues for me before the pandemic, but the sheer way of just how much they've amplified since it started... I just don't think I can't blame them on it. If there could be one, literally just one wish that I could wish and it'd be guaranteed to come true.. I'd wish for that. For it to end. I'm sorry, but you can't really expect any updates from me for at least two months from now (05.05.2021), in life there are things important, and more important.

## This article will be dedicated for 3D sounds in VR space.

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

This is the easiest way we can achieve playing a sound:
```js
// resonance globals
let audioContext = new AudioContext();
let resonance = new ResonanceAudio(audioContext);

// Connect the scene’s binaural output (headphones for instance) to stereo out.
resonance.output.connect(audioContext.destination);

// Add the room definition to the scene. We are passing in two objects, both of which i will leave empty for now, so they set to default values.
// The first object defines the room's width, height and length 
// while the second one defines the materials it's walls are made up of.
// For more information you can visit the Resonance Audio's website. :D
resonance.setRoomProperties({}, {});

// Create an HTML AudioElement. It will store the audio source's path.
let audioElement = document.createElement("audio");

// Load an audio file into the AudioElement.
audioElement.src = "irritating_noise.wav"; // You can use any sound you would like to.

// Generate a MediaElementSource from the AudioElement. It will store the audio's source. 
let audioElementSource = audioContext.createMediaElementSource(audioElement);

// The audio input source doesn't really store the audio's source. It's actually responsible for positioning the audio in the scene and passing it correctly to the audio output (playing it).
let source = resonance.createSource();
// We connect it to the MediaElementSource object, so that it knows what audio it actually operates on.
audioElementSource.connect(source.input);

// Set the source position relative to the room center (source default position).
source.setPosition(0.0, 0.0, 0.0);

// Play the audio when the "Play sound" button is pressed.
document.getElementById("sound-button").addEventListener("click", (e) => {audioElement.play();});
```

Great! Now we can hear a sound once we press a button. But we have a couple things to do before we call it finished:

- How do we loop the audio?
- How do we stop it?
- Can we manually set the timestamp that the audio should start from?
- How do we make the audio 3D and dependant on our head's motion?
- How to actually play it in VR mode?

Well, Let me answer all of these questions for you.

## First, looping the audio. 
This one is actually pretty hard to find info on.
The thing is that we don't really do it using the resonance audio library itself, as you might've realised we use an HTML audio element here. It is used as a sample holder, but also any changes we make to it, will of course be further on included in the final audio after the positional additions made by the resonance library. 

Essentially; we need to use the `loop` argument when creating the audio:
```html
<audio src="irritating_noise.wav" loop/>
```

Great! Now the only problem is that we **can't** do it this way! Why? Because we created it in `JavaScript`, meaning we can't just go ahead and type `loop` in just like that. If it was a boolean, we could technically do
```js
audioElement.loop = true;
```

and if we test this out, we find that it, in fact, does actually work.

I don't even know what to say. I was preparing the script for what seemed like an inevitable disaster, but it seems like this value is, in fact, a boolean.
Colour me suprised, as I didn't know this. The more you know as they say, anyways so that was how you loop the audio. You just make the `loop` boolean true for the `audioElement`. You can do do it right after it's creation;
```js
// Create an HTML AudioElement. It will store the audio source's path.
let audioElement = document.createElement("audio");

// Load an audio file into the AudioElement.
audioElement.src = "irritating_noise.wav"; // You can use any sound you would like to.

// Loop the audio
audioElement.loop = true;
```

Or do it anywhaere else, as long as you do it before actually playing the audio, you should be fine. :D

## Second, how do we stop the looped audio from playing?
First let's figure out why we'd like to do that, and it's a geniuine question of course, because most of the times that we play some song, we want it to finish at it's end, right? Well, let's take, for example a simple in-game shooting mechanic. We have a looped audio of our machine gun shooting, so that it can start playing when we start shooting, and reapeat itself over and over agian, because we don't want to have a giant file with repeating sounds. But what happens when we stop shooting? Well in this case, without the knowledge on how to stop the audio from playing, it will play forever, even long after we stopped shooting, or even are out of rounds. So, how *do* we stop the audio from playing? Well, this is a simple question to answer; we use the `pause` function! Yep. As simple as that. Of course, we don't just want to pause it, we want to stop it, meaning that we want to pause and reset it, and that's exactly what we're going to do.

So the plan is:

From now on the button that up until this point was just designed to play the audio, is actually going to toggle the audio. Meaning that it will make it play when it's stopped, and it will make it stop when it's playing. Basic stuff. Let's start by creating a boolean value that will take care of holding the information on whether or not the audio is playing.
```js
// global sound playing state
let isSoundPlaying = false;
```

Now, let's go and modify the button press event code. 
```js
// Toggle the audio when the "Play sound" button is pressed.
document.getElementById("sound-button").addEventListener("click", (e) => {
	// if the sound isn't playing
	if(!isSoundPlaying) {
		// start playing it
		audioElement.play();
		// make sure to keep in mind that it's playing
		isSoundPlaying = true;
	}
	// but if it already is playing
	else {
		// make it stop;
		// 1. pause it
		audioElement.pause();
		// 2. reset it's time
		audioElement.currentTime = 0;
		// and keep in mind that it's not playing anymore
		isSoundPlaying = false;
	}
});
```

If we test out our website now, we should be able to play the sound and then reset it, just as we see fit.
I'm just happy that I don't have to listen to it on loop anymore. :D

## Third of all, can we manually set the timestamp the audio should start from?
Short answer: yes we can. The longer answer includes an explonation on how to do that.

So the thing is; you already know how, we did it when we were stopping the audio. We set the current time to zero by then. But is it a zero in seconds? Is it a percentage?
That's what we need to find out now. So let's make a quick textbox that will only take in numerical values, and let's make it change from what time the audio starts.
```html
		<header id="main">
			<h2 id="header">WebXR VR Test</h2>
			<button id="xr-button" disabled>VR not found</button>
			<button id="sound-button">Play sound</button>
			<br><br>
			<input id="sound-time" type="number">
		</header>
```
So that number input has got some flaws, but it will at least be simply easy to get the value out of.

Here's how it should look:

![screenshot](data/tutorial10/tutorial10_screenshot2.png)

Now, there are very little, in fact close to no modifications we have to do to our code, we just need to change the audio playing function a bit again:
```js
// Toggle the audio when the "Play sound" button is pressed.
document.getElementById("sound-button").addEventListener("click", (e) => {
	// if the sound isn't playing
	if(!isSoundPlaying) {
		// get the wanted time
		const time = parseInt(document.getElementById("sound-time").value);
		// set it's time
		audioElement.currentTime = time;
		// start playing it
		audioElement.play();
		// make sure to keep in mind that it's playing
		isSoundPlaying = true;
	}
	// but if it already is playing
	else {
		// make it stop;
		// 1. pause it
		audioElement.pause();
		// and keep in mind that it's not playing anymore
		isSoundPlaying = false;
	}
});
```

So now let's try it out, shall we?
Here's my theory: The audio we're about to play is five seconds long, which means that if we set the starting time value to one, it will either start from the start (which means we're working with "percentages" here, and we've just set the song to it's full length and it has reset back to the start), or it will start from the `0:01` time. And it comes out that the second theory is right, so that means we're measuring in seconds. Good, now we can play around with the time we want to start from.

Anyways,

## Fourth of all, the audio positioning based on the head's position and rotation.
So there are essentially two ways of going around it:
We either take our head's view matrix, inverse it and multiply every points position by that resulting matrix or we use some kind of a function built-in to this library which will, essentially, do it for us. :D

But first we need to address a certain other issue. If you followed this tutorial along whilst reading it you might've noticed that the audio doesn't work on any other browser than microsoft edge, if you don't go into settings and change up a couple things.

# THIS ARTICLE IS NOT YET FINISHED


You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial10)!

Previous: [Experimenting with lighting](tutorial9)

<div GITHUB_API_ID="10"></div>

{% include comments.html %}