// Polyfill makes it possible to run WebXR on devices that support only WebVR.
import WebXRPolyfill from "https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.module.js";
const polyfill = new WebXRPolyfill();

// this function multiplies a 4d vector by a 4x4 matrix (it applies all the matrix operations to the vector)
function mulVecByMat(out, m, v) {
	out[0] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
	out[1] = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
	out[2] = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
	out[3] = m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3];
}

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

// This class will contain everything we need for 3D Audio
class PlayableAudio {
	constructor(_url, _position, _loop = false) {
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

		// Wether it's playing or not 
		// - playable tells us if the sound isn't currently being stopped, 
		// whilst playing determines wether or not it is, actually, playing
		this.isPlayable = true;
		this.isPlaying = false;
		
		// These are useless callbacks but whatever
		this.onFinished = () => {};
		this.onStarted = () => {};
		
		// Create a Resonance source and set its position in space.
		this.source = resonanceAudioScene.createSource();
		this.source.setPosition(this.posX, this.posY, this.posZ);

		// These will be filled when the sound is loaded
		this.buffer = null;
		this.bufferSource = null;

		// Now we use the previously saved URL to download, "fetch", the audio from the server
		fetch(this.url).then( // first we retrieve the data hiding behind the url, most likely it'll just be the audio file
			(response) => response.arrayBuffer() // after retrieving the file, we treat it as a buffer or data, at this point it doesn't really matter what data it is
		).then(
			(buffer) => audioContext.decodeAudioData(buffer) // then we get the data we retrieved and finally try and find sound in it
		).then( // if we found sound, as in - if the file contains audio data
			(decodedBuffer) => {
				this.buffer = decodedBuffer;
				this.genBufferSource(); // we create the actual buffer that will be played
			}
		);
	}

	// Generates the buffer that'll actually be played
	genBufferSource() {
		// Create a buffer source. This will need to be recreated every time
		// we wish to start the audio, see
		// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
		this.bufferSource = audioContext.createBufferSource();
		this.bufferSource.loop = this.isLoop; // tell it wether we want to loop it or not
		this.bufferSource.connect(this.source.input); // we connect the audio, this will have to be reversed as soon as the audio ends

		this.bufferSource.buffer = this.buffer;

		// Upon generating the buffer source, we define it's destructor - what happens, when it stops
		// Audio can be ended both by a user (the stop function), and by itself - just reaching the end
		this.bufferSource.onended = () => {
			this.bufferSource.disconnect(); // we disconnect the audio, to get rid of some nasty handlers
			delete this.bufferSource;

			this.genBufferSource(); // we regenerate the buffer source - as we know, it has to be done every time the buffer ends, thus we do it here

			// We set the state to be playable, not playing, so that we can start playing the audio whenever we use the "play" function
			this.isPlayable = true;
			this.isPlaying = false;

			// We call the user-defined callback in case of a sound ending - these seem to be pretty handy, actually! :D
			this.onFinished();

			console.log(`Audio ${this.id} was in fact stopped!`);
		};
	}

	// Play the audio (with the option of starting at a given time)
	play(_from = 0) {
		console.log(`Audio ${this.id} attempted to be played!`);
		
		// We should only be able to start playing the audio if it isn't playing already, and if it is playable (the cleanup process has finished)
		if(this.isPlayable && !this.isPlaying) {
			this.bufferSource.start(0, _from);

			console.log(`Audio ${this.id} has been indeed played!`);

			// We let the world know that the sound is, indeed, playing
			this.isPlaying = true;

			// We once again, call the user-defined callback, except this time it's for when the audio starts, which is indeed what happened :D
			this.onStarted();
		}
	}

	// Stop the audio 
	stop() {
		console.log(`Audio ${this.id} attempted to be stopped!`);

		// We only stop the audio if it is, in fact, playing AND isn't currently in the process of being stopped
		if(this.isPlayable && this.isPlaying) {
			this.isPlayable = false; // We mark that the audio is in the process of being stopped, thus can't be stopped nor played now

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

	// Check if the audio is currently playing
	get playing() {
		return this.isPlayable && this.isPlaying;
	}
}

// Make the audio
let audio1 = new PlayableAudio("/irritating_noise.wav", [0.0, 0.0, 0.0]);

// Play the audio. (shall the user so wish)
const playTime = document.getElementById("sound-time");
const playButton = document.getElementById("sound-button");
// A simple toggle between the states of wanting to stop and play the audio
playButton.onclick = (e) => {
	// We have to do it inside an event! No worries tho, we'll have it inside the "Enter VR" button's onclick function
	audioContext.resume(); 

	// A simple toggle
	if(playButton.innerHTML == "Play sound") {
		playButton.innerHTML = "Stop sound";

		// Play the audio at a given time
		audio1.play(parseFloat(playTime.value));
	}
	else {
		playButton.innerHTML = "Play sound";

		// Stop the audio
		audio1.stop();
	}
};

// When audio finishes we want to automatically reset to a play button
audio1.onFinished = () => { playButton.innerHTML = "Play sound"; };



let canvas = null; // we'll keep it as a global object

// XR globals.
let xrButton = document.getElementById("xr-button");
let xrSession = null;
let xrRefSpace = null;

const lightShader = {
	vertex: "\n\
	out float v_Brightness;\n\
	vec4 vertex() {\
		\
		vec3 lightDirection = normalize(vec3(1.0, -1.0, -1.0));\
		\
		vec4 worldPoint = u_Model * vec4(a_Position, 1.0);\
		vec4 worldPointPlusNormal = u_Model * vec4(a_Position + normalize(a_Normal), 1.0);\
		\
		v_Brightness = -dot(normalize(worldPointPlusNormal.xyz - worldPoint.xyz), lightDirection);\
		\
		return u_Projection * u_View * worldPoint;\
	}",
	shader: "\
	in float v_Brightness;\
	vec4 shader() {\
		return vec4(u_Color.rgb * vec3(v_Brightness), 1.0);\
	}"
};

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

	const planeMaterial = new ezgfx.Material(lightShader.vertex, null, lightShader.shader);
	planeMaterial.setProjection(identityMatrix);
	planeMaterial.setView(identityMatrix);
	planeMaterial.setModel(identityMatrix);
	
	planeMaterial.setColor([0.5, 0.5, 0.5, 1.0]);

	const cubeMesh = new ezgfx.Mesh();
	cubeMesh.loadFromOBJ("/cube.obj");

	const cubeMaterial = new ezgfx.Material(lightShader.vertex, null, lightShader.shader);
	cubeMaterial.setProjection(identityMatrix);
	cubeMaterial.setView(identityMatrix);
	cubeMaterial.setModel(offsetMatrix);

	cubeMaterial.setColor([0.4, 0.3, 1.0, 1.0]);

	const controllerMesh = new ezgfx.Mesh();
	controllerMesh.loadFromOBJ("/controller.obj");

	const controllerMaterial = new ezgfx.Material(lightShader.vertex, null, lightShader.shader);
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

			// we want to let the player move around only if the controller is detected, otherwise we will be trying to use non-existing values, which would crash our application
			if(controllers.left) {
				// we get our controller's center and front
				let front = [0.0, 0.0, 0.0, 1.0];
				let center = [0.0, 0.0, 0.0, 1.0];

				let matrix = controllers.left.pose.transform.matrix;

				mulVecByMat(front, matrix, [0.0, 0.0, -1.0, 1.0]);
				mulVecByMat(center, matrix, [0.0, 0.0, 0.0, 1.0]);

				// we convert front and center into the direction
				let xDir = front[0] - center[0];
				let zDir = front[1] - center[1];
				xDir = -xDir;

				// we normalize the direction
				const l = Math.sqrt(xDir * xDir + zDir * zDir);
				xDir = xDir / l;
				zDir = zDir / l;

				// we set our offsets up, this will include both the direction of the controller and the direction of our analog sticks
				let xOffset = controllers.left.gamepad.axes[3] * xDir + controllers.left.gamepad.axes[2] * zDir;
				let zOffset = controllers.left.gamepad.axes[3] * zDir - controllers.left.gamepad.axes[2] * xDir;

				// we slow it down a little bit, so that it will not make us nauseous once we move 
				xOffset *= 0.1; 
				zOffset *= 0.1;

				// we offset our reference space
				xrRefSpace = xrRefSpace.getOffsetReferenceSpace(new XRRigidTransform({x: xOffset, y: 0.0, z: zOffset})); 
			}

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