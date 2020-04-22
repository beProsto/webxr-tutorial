# Setup - the html document

# In this article I'm going to cover a simple html document template and tools needed for WebXR projects.

For our project we're going to need a couple of simple tools:
- Python - for running the server
- A text editor - you can use any you want, I'll be going with VS Code.

Now, for the project's setup:
- Test if you have python by writing `python --version` in your terminal/console.
- If you have installed python properly it should say `Python <version>`.
- Now create a directory/folder in which you will keep all your project files.
- Head over there and create a file named `index.html`.
- Head over there using your terminal and type in `python -m http.server 8080`. 
- It should've run a server on your PC on the port `8080`
- To connect to your server, go to your web browser and connect to `http://localhost:8080/`.
- Now, if you connect properly you should see a blank page. If it happens, congrats! Now you have a server!

In the near future, I'll want to test our website out using my phone or oculus quest.
To be able to connect to it using these devices, you'll have to do these things:
- Find out your computer's IP address
	- On windows, go to your console and type in `ipconfig`. You should see your IP in the `IPv4 Address` section.
	- On debian, go to your terminal and type in `ifconfig`. You should see your IP in the `inet` section.
	- On arch, go to your terminal and type in `ip address`. You should see your IP in the `inet` section.
- Now run the server on this computer.
- Go to your other device and make sure you're both connected to the same network.
- Now go to the web browser on your other device, and type in `http://<IP>:8080/`.
- If your other device connected succesfully, you're good to go!

Our project, being a web project, needs an html document. 
Fortunetly for us, WebXR doesn't require anything hard to do in our html document.
We just setup a simple html document with a twist of it having one button, and some meta tags that make our app work properly on mobile devices.

So let's start by defining a simple html document:
```html
<!doctype html>
<html>
	<head>
	
	</head>
	
	<body>
	
	</body>
</html>
```

Let's give it a nice title (remember to do it in between the head tags):
```html
<title>A neat little WebXR example</title>
```

Let's define it's charset (remember to do it in between the head tags):
```html
<meta charset="utf-8">
```

Now, let's give it some mobile compatibility (again, head tags):
```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

Let's move on to the body section.
Now, Let's create our button and a simple project's description (we'll do it as a header):
```html
<header id="main">
	<h2 id="header">This is a neat little WebXR example.</h2>
	<button id="xr-button" disabled>VR not found</button>
</header>
```

We're gonna need the button's id to reference it in our javascript code later,
our header's id ("main") is going to be useful for writing css style for our website.
The same with the header text's id.

Speaking of the css style code - let's make it.
We're going to make the button a little bigger and modern looking, and we're gonna center both the text and the button.
Also we're gonna make our site's background a little darker, and our header text is going to be of a more standing out color.
```html
<style>
	body {
		background-color: rgb(100, 100, 100);
	}
	#header {
		color: rgb(242, 245, 78);
	}
	#xr-button {
		background-color: rgba(116, 181, 241, 0.4);
		border: rgb(95, 145, 195) 2px solid;
		color: white;
		height: 50px;
		min-width: 160px;
	}
	#main {
		text-align: center;
	}
</style>
```
Remember to put this in head!

Lastly we want to create a javascript file, in which we will store our main code.
We're gonna name it "index.js".
To include it in our document we will have to use a script tag:
```html
<script type="module" src="index.js"></script>
```
This will be an exception, as we're gonna put it into the body section (even tho we shouldn't, but it's going to make coding a little easier).
We're also including it as a module, as it will require importing an external module - WebXR Polyfill.

After all this, your code should look like this:
```html
<!doctype html>

<html>
	<head>
		<title>A neat little WebXR example</title>
		
		<style>
			body {
				background-color: rgb(100, 100, 100);
			}
			#header {
				color: rgb(242, 245, 78);
			}
			#xr-button {
				background-color: rgba(116, 181, 241, 0.4);
				border: rgb(95, 145, 195) 2px solid;
				color: white;
				height: 50px;
				min-width: 160px;
			}
			#main {
				text-align: center;
			}
		</style>

		<meta charset="utf-8">

		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
	</head>

	<body>
		<header id="main">
			<h2 id="header">WebXR VR Test</h2>
			<button id="xr-button" disabled>VR not found</button>
		</header>

		<script type="module" src="index.js"></script>
	</body>
</html>
```

Next: [Setup - WebGL 2 context initialization](_2.md)
Previous: [Index](index.md)