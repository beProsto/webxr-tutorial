// Polyfill makes it possible to run WebXR on devices that support only WebVR.
import WebXRPolyfill from "https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.module.js";
const polyfill = new WebXRPolyfill();

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

let canvas = null; // we'll keep it as a global object

// XR globals.
let xrButton = document.getElementById("xr-button");
let xrSession = null;
let xrRefSpace = null;

let controllers = {};

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

function onResize() { // this function resizes our canvas in a way, that makes it fit the entire screen perfectly!
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
window.onresize = onResize; // sets the window's resize function to be the exact function we use for resizing our canvas

function initWebGL2(attributes) {
	canvas = document.createElement("canvas"); // creates a new canvas element ( <canvas></canvas> )
	gl = canvas.getContext("webgl2", attributes || {alpha: false}); // creates a WebGL2 context using the canvas and the given attributes, with an addition of {alpha: false} attribute, which just disables transparency of our canvas
	if(!gl) { // if the gl DIDN'T create properly
		alert("This browser does not support WebGL 2."); // alert the user about it
		return; // go out of the function; stop this function
	}
	canvas.style = "position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0; z-index: -1;"; // we add a simple style to our canvas
	document.body.appendChild(canvas); // appends/adds the canvas element to the document's body
	onResize(); // resizes the canvas (it needs to be done, because otherwise it will not resize until you resize your window)
}

function initWebXR() { // our new init function
	if(navigator.xr) { // checks if our device supports WebXR
		navigator.xr.isSessionSupported("immersive-vr").then((supported) => { // we check if immersive-vr session is supported
			if(supported) { // if it is supported
				xrButton.disabled = false; // enable the button (makes it possible to click it)
				xrButton.textContent = "Enter VR"; // change text on the button
				xrButton.addEventListener("click", onButtonClicked); // add a new event to the button, which will run the onButtonClicked function
			}
		});
	}
}

function onButtonClicked() { // this function specifies what our button will do when clicked
	if(!xrSession) { // if our session is null - if it wasn't created
		navigator.xr.requestSession("immersive-vr", {requiredFeatures: ["local-floor"]}).then(onSessionStarted); // request it (start the session), and when the request is handled, call onSessionStarted
	} else { // if our session was started already
		xrSession.end(); // request our session to end
	}
}

function onSessionStarted(_session) { // this function defines what happens when the session is started
	xrSession = _session; // we set our session to be the session our request created
	xrSession.addEventListener("end", onSessionEnded); // we set what happenes when our session is ended

	initWebGL2({xrCompatible: true}); // we initialize WebGL2, in a way that makes it compatible with WebXR
	xrSession.updateRenderState({baseLayer: new XRWebGLLayer(xrSession, gl)}); // this line simply sets our session's WebGL context to our WebGL2 context
	
	
	const renderer = new ezgfx.Renderer();
	renderer.depthTesting(true); // if you don't know what that means - it means that our meshes will be rendered properly ¯\_(ツ)_/¯

	const identityMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	const offsetMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		-2.0, 1.0, -5.0, 1.0
	]);
	
	const planeMesh = new ezgfx.Mesh();
	planeMesh.loadFromOBJ("/plane.obj");

	const planeMaterial = new ezgfx.Material();
	planeMaterial.setProjection(identityMatrix);
	planeMaterial.setView(identityMatrix);
	planeMaterial.setModel(identityMatrix);

	planeMaterial.setColor([0.5, 0.5, 0.5, 1.0]);

	const cubeMesh = new ezgfx.Mesh();
	cubeMesh.loadFromOBJ("/cube.obj");

	const cubeMaterial = new ezgfx.Material();
	cubeMaterial.setProjection(identityMatrix);
	cubeMaterial.setView(identityMatrix);
	cubeMaterial.setModel(offsetMatrix);

	cubeMaterial.setColor([0.4, 0.3, 1.0, 1.0]);

	const controllerMesh = new ezgfx.Mesh();
	controllerMesh.loadFromOBJ("/controller.obj");

	const controllerMaterial = new ezgfx.Material();
	controllerMaterial.setProjection(identityMatrix);
	controllerMaterial.setView(identityMatrix);
	controllerMaterial.setModel(identityMatrix);

	xrSession.requestReferenceSpace("local-floor").then((refSpace) => { // we request our referance space - an object that defines where the center of our space lies. Here we request a local-floor referance space - that one defines the center of the world to be where the center of the ground is
		xrRefSpace = refSpace; // we set our referance space to be the one returned by this function
		
		xrSession.requestAnimationFrame(onSessionFrame); // at this point everything has been set up, so we can finally request an animation frame, on a function with the name of onSessionFrame
	});

	function onSessionFrame(t, frame) { // this function will happen every frame
		const session = frame.session; // frame is a frame handling object - it's used to get frame sessions, frame WebGL layers and some more things
		session.requestAnimationFrame(onSessionFrame); // we simply set our animation frame function to be this function again
		let pose = frame.getViewerPose(xrRefSpace); // gets the pose of the headset, relative to the previously gotten referance space

		if(pose) { // if the pose was possible to get (if the headset responds)
			let glLayer = session.renderState.baseLayer; // get the WebGL layer (it contains some important information we need)
	
			onControllerUpdate(session, frame); // update the controllers' state
			
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

			gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer); // sets the framebuffer (drawing target of WebGL) to be our WebXR display's framebuffer
			
			renderer.clear([0.3, 1.0, 0.4, 1.0]);


			for(let view of pose.views) { // we go through every single view out of our camera's views
				let viewport = glLayer.getViewport(view); // we get the viewport of our view (the place on the screen where things will be drawn)
				gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height); // we set our viewport appropriately
	
				planeMaterial.setProjection(view.projectionMatrix);
				planeMaterial.setView(view.transform.inverse.matrix);
				
				renderer.draw(planeMesh, planeMaterial);

				cubeMaterial.setProjection(view.projectionMatrix);
				cubeMaterial.setView(view.transform.inverse.matrix);
				
				renderer.draw(cubeMesh, cubeMaterial);
			
				if(controllers.left) { // checks if WebXR got our left controller
					controllerMaterial.setProjection(view.projectionMatrix);
					controllerMaterial.setView(view.transform.inverse.matrix);
					controllerMaterial.setModel(controllers.left.pose.transform.matrix); // we just get our model matrix for the controller
					
					const red = controllers.left.gamepad.buttons[0].value; // left controller's trigger's value
					const green = controllers.left.gamepad.buttons[1].value; // left controller's grab's value
					const blue = controllers.left.gamepad.buttons[4].value; // left controller's X button's value

					controllerMaterial.setColor([red, green, blue, 1.0]); // color white

					renderer.draw(controllerMesh, controllerMaterial);
				}
				if(controllers.right) { // checks if WebXR got our right controller
					controllerMaterial.setProjection(view.projectionMatrix);
					controllerMaterial.setView(view.transform.inverse.matrix);
					controllerMaterial.setModel(controllers.right.pose.transform.matrix); // we just get our model matrix for the controller
					
					const red = controllers.right.gamepad.buttons[0].value; // left controller's trigger's value
					const green = controllers.right.gamepad.buttons[1].value; // left controller's grab's value
					const blue = controllers.right.gamepad.buttons[4].value; // left controller's A button's value

					controllerMaterial.setColor([red, green, blue, 1.0]); // color black

					renderer.draw(controllerMesh, controllerMaterial);
				}
			}
		}
	}

	function onSessionEnded() { // this function defines what happens when the session has ended
		xrSession = null; // we set our xrSession to be null, so that our button will be able to reinitialize it when we click it the next time
	}
}

initWebXR(); // we call our init function, therefore initializing the application