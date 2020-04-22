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
if your device somehow doesn't support it, i would advise you to bend the examples to fit the needs of WebGL)

1. [Setup - the html document](/_1.md/)
2. [Setup - WebGL 2 context initialization](_2.md)
3. [WebGL 2 basics](_3.md)
4. [WebXR Initialization](_4.md)
5. [A simple 3D WebXR scene](_5.md)
6. [Finding the controllers](_6.md)
7. [Reading the controllers' input](_7.md)
8. [Fun - making the player move around with thumbsticks](_8.md)
9. [Fun - playing with 3D physics](_9.md)
10. [Fun - playing with guns](_10.md)
11. [Fun - cutting objects in halves with katanas](_11.md)
12. [Fun - creating a simple multiplayer game](_12.md)