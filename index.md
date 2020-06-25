# Welcome to my WebXR tutorial series!
## Hello, I'm beProsto and in this series of articles I'm going to cover a couple of topics regarding VR application developement with WebXR. 
## In this, first, main article we are going to cover what is WebXR, and why would you want to use it for VR developement instead of WebVR.

So, let's start, shall we?
Why would you want to use WebXR instead of something like WebVR? Well, most likely because it's newer.
Let me elaborate; WebVR is an old, widely supported technology, but it's messy and hard to learn, WebXR however is newer,
better optimized, better written, with a better workflow and is supported a little bit less, 
but it still can be used on devices that support the WebVR API, through the WebXR polyfill.

So essentially:
**WebVR** - old, bad
**WebXR** - new, good

WebVR was an API designed strictly for VR developement, where WebXR is designed for both VR and AR, therefore XR.
It might give you the benefit of being able to create an AR application for your hypothetical project in the future.
So here are all the best reasons why you should use WebXR over WebVR, but the best one will propably be for you to check out,
and compare the clarity of [WebXR samples](https://immersive-web.github.io/webxr-samples/), and [WebVR samples](https://webvr.info/samples/).
You'll propably notice that the WebXR samples are a lot easier to follow and understand, whereas the WebVR samples are just messy.
It's not only because of how the examples were written, it's mostly because of how these API's actually are.
WebXR is modern, simple and slim, and WebVR is messy and greasy.

This is why I dedicated a little bit of my time into learning the WebXR API, 
so that I will be able to very easily and briefly present it's basics to you, 
and tell you how you can go on from there.
I hope you enjoy :D

(As a disclaimer i would like to add that articles i present will use WebGL 2 for graphics, 
if your device somehow doesn't support it, i would advise you to bend the abstraction to fit the needs of WebGL)

(If you don't feel like learning WebGL2, just jump ahead to tutorial number three, copy it's project files, read the example of how to use the abstraction and you'll be all set.)

1. [Setup - the html document](tutorial1)
2. [Setup - WebGL 2 context initialization](tutorial2)
3. [A simple WebGL 2 abstraction](tutorial3)
4. [Matrices and 3D graphics](tutorial4)
5. [WebXR Initialization](tutorial5)
6. [A simple 3D WebXR scene](tutorial6)
7. [Finding the controllers](tutorial7)
8. [Reading the controllers' input](tutorial8)