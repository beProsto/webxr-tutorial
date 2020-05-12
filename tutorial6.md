# A simple 3D WebXR scene

## In the last article we learnt how to setup a simple WebXR application, today let's create a simple scene inside of it! 

So the first thing we will do is create all the meshes and materials needed, with our `ezgfx` abstraction, it will be as easy as buttering some bread.

The fist thing to do is creating a renderer:
```js
const renderer = new ezgfx.Renderer();
```

We will put it right after initializing everything, before requesting the referance space, just to be safe.

The same with initializing everything else, for now, let's just create and draw a simple triangle. 
```js
const triangleMesh = new ezgfx.Mesh();
triangleMesh.loadFromData(ezgfxGlobals.triangle);

const triangleMaterial = new ezgfx.Material();
const identityMatrix = new Float32Array([
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0
]);
triangleMaterial.setProjection(identityMatrix);
triangleMaterial.setView(identityMatrix);
triangleMaterial.setModel(identityMatrix);
```

And in the place where we had this comment:
```js
// Here we will draw our scenes
```

We will now actually draw the triangle:
```js
renderer.draw(triangleMesh, triangleMaterial);
```

And if we run our application, this is what we should see:
![screenshot](data/tutorial6/tutorial6_screenshot1.jpg)

Now, you can see a slight problem here; we seem not to be able to rotate or move around the scene. Well, that's because except for drawing the object, we should also set it's projection and view matrices to the ones given by WebXR. We get our Projection matrix using:
```js
view.projectionMatrix
```

and our view marix using:
```js
view.transform.inverse.matrix
```

`view.transform` returns an [XRRigidTransform](https://developer.mozilla.org/en-US/docs/Web/API/XRRigidTransform), which is an object that contains data about position and orientation of a transform. Using `XRRigidTransform.matrix` we would get a normal matrix made using the given position and orientation, but `XRRigidTransform.inverse.matrix` will return an inversed matrix, which, as we know from the last article, is the one we will want to use in case of a `view` matrix.

Now if instead of just drawing the triangle, we will also set these matrices accordingly:
```js
triangleMaterial.setProjection(view.projectionMatrix);
triangleMaterial.setView(view.transform.inverse.matrix);

renderer.draw(triangleMesh, triangleMaterial);
```

what we should observe is our triangle rotating and positioning correctly depending on our position and orientation.

The last thing to change will be our screen clearing, up until now we did it using WebGL2's native calls:
```js
gl.clearColor(0.4, 0.7, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clears the framebuffer (in the next episode we'll implement our ezgfx renderer here - for now, let's just use vanilla WebGL2, as we're not doing anything else than clearing the screen)
```

We'll just change it to clearing using our `ezgfx` renderer:
```js
renderer.clear([0.3, 1.0, 0.4, 1.0]);
```

Coming back to the triangle, you might observe our camera is actually inside the of it. To make it all look a little bit better, we should push our triangle forward by, let's say 3 units. To achieve it, we will create a special **model** matrix for our triangle.
```js
const triangleModelMatrix = new Float32Array([
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, -3.0, 1.0 // the first element of this row is for x position, the second for y and the third for z, which means we just offset it by negative three on the z axis
]);
```

And now we will just set it as our triangle's model matrix:
```js
triangleMaterial.setModel(triangleModelMatrix);
```

Now we should see our triangle like this:
![screenshot](data/tutorial6/tutorial6_screenshot2.jpg)

And just for the sake of testing, I tried it on my oculus quest (the navigation bar is there because I had to open it to take the screenshot):
![screenshot](data/tutorial6/tutorial6_screenshot3.jpg)

When trying your applications out on the quest, remember to connect through [ngrok](https://ngrok.com/)'s https forwarding.


It's one thing to create a scene with a triangle, but a completely other one to create an actually nice 3D scene. So let's build one! For that we'll need some kind of a 3D modelling tool, like [blender](https://www.blender.org).

Using blender, I created two meshes: a plane, and a cube. I didn't modify them or anything, I just exported them as OBJ files:

![screenshot](data/tutorial6/tutorial6_screenshot4.png)

Then, we set it's destination to be our project's folder, set these settings like that and click `Export OBJ`:

![screenshot](data/tutorial6/tutorial6_screenshot5.png)

Be sure to check the `Triangulate Faces` checkbox, as we need all faces to be triangles here. 

So now we've got two OBJ 3D model files, containing a plane, and a cube. For convenience I named these files `"cube.obj"` and `"plane.obj"`. (If you don't feel like modelling, you can just download them from project files.)

In our code, we'll delete all the triangle stuff, and create `cube` and `plane` meshes, and `cube` and `plane` materials. Then we'll draw them.
```js
// After setting up the renderer
renderer.depthTesting(true); // if you don't know what that means - it means that our meshes will be rendered properly ¯\_(ツ)_/¯

const identityMatrix = new Float32Array([
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0
]); // just an identity matrix - will not modify anything

const planeMesh = new ezgfx.Mesh();
planeMesh.loadFromOBJ("/plane.obj");

const planeMaterial = new ezgfx.Material();
planeMaterial.setProjection(identityMatrix);
planeMaterial.setView(identityMatrix);
planeMaterial.setModel(identityMatrix);

planeMaterial.setColor([0.5, 0.5, 0.5, 1.0]); // we haven't done this one yet - it's responsible for setting the color in which our object will be drawn (at start it's set to white)

const cubeMesh = new ezgfx.Mesh();
cubeMesh.loadFromOBJ("/cube.obj");

const cubeMaterial = new ezgfx.Material();
cubeMaterial.setProjection(identityMatrix);
cubeMaterial.setView(identityMatrix);
cubeMaterial.setModel(identityMatrix);

cubeMaterial.setColor([0.4, 0.3, 1.0, 1.0]);

// After setting the viewport (in the place where we should draw)
sceneMaterial.setProjection(view.projectionMatrix);
sceneMaterial.setView(view.transform.inverse.matrix);

renderer.draw(sceneMesh, sceneMaterial);

cubeMaterial.setProjection(view.projectionMatrix);
cubeMaterial.setView(view.transform.inverse.matrix);

renderer.draw(cubeMesh, cubeMaterial);
```

But, with that approach, you'll see a couple problems. First of all, the floor is at the same level as our head and we're inside the cube.
Let's fix being inside the cube using a custom translation (position) matrix:
```js
const offsetMatrix = new Float32Array([
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	-2.0, 1.0, -5.0, 1.0
]);
cubeMaterial.setModel(offsetMatrix);
```

And now, let's fix our `floor on the head level` problems. There are two ways to approach this, both valid, but in this case I will be in favor of one of them. So we can: make yet another offset matrix `or` offset our whole referance space. I will be going with offsetting the referance space, because it's the way in which later on everything will be easier for us. 

The problem here is that we know we have to offset the referance space, but we don't know how much, because we don't know the player's height. The worst part about it is the fact that WebXR itself doesn't have any kind of `getPlayerHeight` or `requestFloorOffset` function, instead they advise you to assume the player's height. Of course, it's not the best solution there could be, it's just the best solution there is (for WebXR, I mean). We will assume the player's height is `1.6` meters.

So to implement our world's offset by `1.6` meters, we'll have to go over to the `xrSession.requestReferenceSpace` part of our code, and put this over there:
```js
xrSession.requestReferenceSpace("local").then((refSpace) => { // we request our referance space - an object that defines where the center of our space lies. Here we request a local referance space - that one defines the center of the world to be where player's head is at the start of our application.
	xrRefSpace = refSpace; // we set our referance space to be the one returned by this function
		
	const offsetTransform = new XRRigidTransform({x: 0.0, y: -1.6, z: 0.0}); // creates a transform with position of -1.6
	xrRefSpace = xrRefSpace.getOffsetReferenceSpace(offsetTransform); // offsets our referance space by the transform

	xrSession.requestAnimationFrame(onSessionFrame); // at this point everything has been set up, so we can finally request an animation frame, on a function with the name of onSessionFrame
});
```

As you see, these two lines changed everything, if we check on our application now, that's what we should see:

![screenshot](data/tutorial6/tutorial6_screenshot6.jpg)

You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial6)!

Next: Coming Soon!
Previous: [WebXR Initialization](tutorial5)

<div GITHUB_API_ID="6"></div>

{% include comments.html %}