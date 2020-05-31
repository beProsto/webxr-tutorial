# Reading the controllers' input

## In previous episode we learned how to get controller's transformation and the hand it's in. Now we're going to learn how to get controller input.

Ok, so in this episode we're going to create a system that will give us data about our buttons and joysticks on our controllers. How could we achieve something like this? Well, the WebXR API gives us a nice little solution for this. It's named `gamepad`, it uses the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad), and is a part of [XRInputSource](https://developer.mozilla.org/en-US/docs/Web/API/XRInputSource) object.

The `gamepad` object can be taken from an `XRInputSource`, for instance the `inputSource` objects in our controller loop. The `gamepad` object contains data about axes (how far are the joysticks from the center, presented as numbers ranging from `-1` to `1`), buttons (both if they are clicked and how far they are pushed (that's used for the analog buttons, like `grab` or `trigger`))

Let's jump into the code and see for ourselves how we can use this knowledge:
```js
function onControllerUpdate(session, frame) { // this function will be called every frame, before rendering
	for(let inputSource of session.inputSources) { // we loop through every input source (controller) caught by our session
		if(inputSource.gripSpace) { // we check if our controllers actually have their space
			let gripPose = frame.getPose(inputSource.gripSpace, xrRefSpace); // we get controller's pose, by comparing our controller's space to our referance space
			if(gripPose) { // we check if our controller's pose was gotten correctly
				controllers[inputSource.handedness] = {pose: gripPose, gamepad: inputSource.gamepad}; // inputSource.handedness returns a string representing in which hand we have our controller - that is "left" or "right". Which means that controllers.left and controllers.right will contain two elements, one named "pose", which will simply be their corresponding XRPose, and the second named "gamepad", which will contain their corresponding Gamepad object. 
			}
		}
	}
}
```

So we essentially added a new element to our controller's objects. This element is named gamepad, and it will contain the `Gamepad` object.

Let's see how we can if one of the buttons is clicked:
```js
if(controller.left.gamepad.buttons[0].pressed) { // checks if button of index 0 on the left controller is pressed
	// Do something about it
}
```

Let's discuss the components of the `gamepad` object:
- `buttons` - is an array of `GamepadButton` objects
	- `GamepadButton.pressed` - returns `true`, if the button is pressed, and `false` if it isn't.
	- `GamepadButton.value` - returns a `float`, ranging from `0.0` to `1.0`, that represents how far the button is pushed (useful for analog buttons, such as the **trigger** button)
- `axes` - is an array of `float`s ranging from `-1.0` to `1.0`, that represent how far the **analog sticks** on the controller are pushed on the individual axes.

This is which axes and buttons represent which axes and buttons on the `oculus quest`:
- `X` axis for the analog stick - `gamepad.axes[2]`
- `Y` axis for the analog stick - `gamepad.axes[3]`
- `TRIGGER` button - `gamepad.buttons[0]`
- `GRAB` button - `gamepad.buttons[1]`
- `X`/`A` button - `gamepad.buttons[4]`
- `Y`/`B` button - `gamepad.buttons[5]`

So now, that we know what each of these mean and what they are, let's do something with them, for instance, let's set the color of our hands depending on how much are some of our buttons pressed:
```js
// when drawing our left controller
const red = controllers.left.gamepad.buttons[0].value; // left controller's trigger's value
const green = controllers.left.gamepad.buttons[1].value; // left controller's grab's value
const blue = controllers.left.gamepad.buttons[4].value; // left controller's X button's value
controllerMaterial.setColor([red, green, blue, 1.0]); // color white

// when drawing the right controller
const red = controllers.right.gamepad.buttons[0].value; // left controller's trigger's value
const green = controllers.right.gamepad.buttons[1].value; // left controller's grab's value
const blue = controllers.right.gamepad.buttons[4].value; // left controller's A button's value
controllerMaterial.setColor([red, green, blue, 1.0]); // color black
```

Nice, so now, if we press our buttons, our arms will change their colors.

Let's do some more testing, for instance let's make moving around our big scene a little bit easier. For that we will use our left controller's axes. First let's just add our analog stick's `x` value to our position's `x`, and do the same for the analog stick's `y` and our position's `z`.
```js
// after every controllers' update
xrRefSpace = xrRefSpace.getOffsetReferenceSpace(new XRRigidTransform({x: controllers.left.gamepad.axes[2], y: 0.0, z: controllers.left.gamepad.axes[3]})); // we offset our reference space by our analog stick's position
```

This approach works, but not as expected - when we turn, our joysticks forward will suddenly not be our forward, therefore we have to implement some kind of a "cheat" that will let us tell where the player wants to go. For that we will use the rotation of our controller. Which means, that our "forward" will be the direction in which our controller is facing.

First, let's make it easier for ourselves to get the forward direction:
```js
function matFromQuat(out, q) { // ripped this straight out of the glMatrix lib
	let x = q[0],
	  y = q[1],
	  z = q[2],
	  w = q[3];
	let x2 = x + x;
	let y2 = y + y;
	let z2 = z + z;
  
	let xx = x * x2;
	let yx = y * x2;
	let yy = y * y2;
	let zx = z * x2;
	let zy = z * y2;
	let zz = z * z2;
	let wx = w * x2;
	let wy = w * y2;
	let wz = w * z2;
  
	out[0] = 1 - yy - zz;
	out[1] = yx + wz;
	out[2] = zx - wy;
	out[3] = 0;
  
	out[4] = yx - wz;
	out[5] = 1 - xx - zz;
	out[6] = zy + wx;
	out[7] = 0;
  
	out[8] = zx + wy;
	out[9] = zy - wx;
	out[10] = 1 - xx - yy;
	out[11] = 0;
  
	out[12] = 0;
	out[13] = 0;
	out[14] = 0;
	out[15] = 1;
}
function mulVecByMat(out, m, v) {
	out[0] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
	out[1] = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
	out[2] = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
	out[3] = m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3];
}
function getDirectionFromQuat(q, forward) {
	let matrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	let vec = new Float32Array([0.0, 0.0, 0.0, 1.0]);
	let forw = new Float32Array([forward[0], forward[1], forward[2], 1.0]);
	
	matFromQuat(matrix, q);
	mulVecByMat(vec, matrix, forw);

	return vec;
}
function dirFromQuatXR(q, forward) {
	return getDirectionFromQuat([q.x, q.y, q.z, q.w], forward);
}
```

All of this is just some basic matrix - quaternion mathematics. It boils down to a function named `dirFromQuatXR()` that takes in our quaternion of rotation (in the format of `{x: x, y: y, z: z, w: w}`) and our direction, which would be the forward direction if no rotation was applied, normally it's `[0.0, 0.0, -1.0]`.

So now, that we have a way of getting our controller's direction, let's use it to change our player's position (offset our reference space):
```js
// we get our controller's direction, based on it's rotation
const dir = dirFromQuatXR(controllers.left.pose.transform.orientation, [0.0, 0.0, -1.0]);

// we make it easier to use
let xDir = -dir[0];
let zDir = dir[1];

// we set our offsets up
let xOffset = controllers.left.gamepad.axes[3] * xDir + controllers.left.gamepad.axes[2] * zDir;
let zOffset = controllers.left.gamepad.axes[3] * zDir - controllers.left.gamepad.axes[2] * xDir;

// we slow it down a little bit, so that it will not make us nauseous once we move 
xOffset *= 0.1; 
zOffset *= 0.1;

xrRefSpace = xrRefSpace.getOffsetReferenceSpace(new XRRigidTransform({x: xOffset, y: 0.0, z: zOffset})); // we offset our reference space
```

And our final result is being able to move around the scene!

![screenshot](data/tutorial8/tutorial8_screenshot.png)

You can check out the project's files [here](https://github.com/beProsto/webxr-tutorial/tree/master/projects/tutorial8)!

Previous: [Finding the controllers](tutorial7)

<div GITHUB_API_ID="8"></div>

{% include comments.html %}