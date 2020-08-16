# 3D Sounds

## This article will be dedicated for 3D sounds in VR space.

In the last article we've been going over 3D lighting, in this one we're going to do something pleasing less for the eye, and more for the ear.

When it comes to the topic of 3D sounds themselves; it's a hard topic. While it is simple to make something sound like it's on our left or right side, it's a lot harder to make something sound like it's behind or in front of us (not even getting into how hard it is to make sounds that are on top of and under you). 

So, to go around those struggles, we're going to use a pre-existing library that does all the hard stuff for us! That library will be: [resonance audio](https://resonance-audio.github.io/resonance-audio/).

So to start off, let's import `resonance audio` into our project, that will require us to open `index.html` for the first time, in a long, well, time. We'll simply need to add: 
```html
<script src="https://cdn.jsdelivr.net/npm/resonance-audio/build/resonance-audio.min.js"></script>
```

before any other `script` tag. Now we have succesfully included resonance into our project. So... How do we use it? Well - that's another thing. WebXR samples themselves have a function used to create audio sources, so we'll also do that, but first we'll have to setup some globals for our audio (in `index.js` of course):
```js
// resonance globals
let audioContext = new AudioContext();
let resonance = new ResonanceAudio(audioContext);
resonance.output.connect(audioContext.destination);

audioContext.suspend();
```

You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial10)!

Previous: [Experimenting with lighting](tutorial9)

<div GITHUB_API_ID="10"></div>

{% include comments.html %}
