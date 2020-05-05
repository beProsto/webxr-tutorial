let canvas = null; // we'll keep it as a global object

function onResize() { // this function resizes our canvas in a way, that makes it fit the entire screen perfectly!
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

window.onresize = onResize; // sets the window's resize function to be the exact function we use for resizing our canvas

function initWebGL2() {
	canvas = document.createElement("canvas"); // creates a new canvas element ( <canvas></canvas> )
	gl = canvas.getContext("webgl2"); // creates a WebGL2 context, using the canvas
	if(!gl) { // if the gl DIDN'T create properly
		alert("This browser does not support WebGL 2."); // alert the user about it
		return; // go out of the function; stop this function
	}
	canvas.style = "position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0; z-index: -1;"; // we add a simple style to our canvas
	document.body.appendChild(canvas); // appends/adds the canvas element to the document's body
	onResize(); // resizes the canvas (it needs to be done, because otherwise it will not resize until you resize your window)
	
	const renderer = new ezgfx.Renderer(); // creates a new ezgfx Renderer
	renderer.clear([0.3, 1.0, 0.4, 1.0]); // clears the screen to be nice and green

	const mesh = new ezgfx.Mesh(); // we create a new mesh
	mesh.loadFromData(ezgfxGlobals.triangle); // we make our mesh to be a simple triangle

	const material = new ezgfx.Material(); // we create a material
	// We're setting all our matrices to identity (i'll talk about it in a minute)
	const identityMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	material.setProjection(identityMatrix);
	material.setView(identityMatrix);
	material.setModel(identityMatrix);

	// we declare this function inside of the init function to make passing variables between them easier
	function onFrame() { // this function specifies what will happen every frame
		gl.viewport(0, 0, canvas.width, canvas.height); // resizes the webgl2's virtual viewport to fit the entire screen
		renderer.clear([0.3, 1.0, 0.4, 1.0]); // clears the screen with the specified green color (RGBA)

		renderer.draw(mesh, material); // draws our triangle combined with the material of our choice

		// we also have to tell our browser that we want this function to be called again in the next frame
		window.requestAnimationFrame(onFrame);
	}	
	// here we have to tell our browser what function we will call during the next frame
	window.requestAnimationFrame(onFrame);
}

initWebGL2(); // we call our init function, therefore initializing the application