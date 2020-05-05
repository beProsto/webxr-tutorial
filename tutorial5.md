# WebGL 2 basics - Matrices and 3D

## We're going to go over to the topics presented in the title, but first we have to learn about something very important.

And that important thing is named `uniform`. Uniforms are variables that are passed into our shaders once per program. Which means that they are the values that influence every vertex/fragment in the same way, therefore there is absolutely no reason to pass them per vertex. Another reason to use them is the fact that they are a lot easier to assign and modify, because rather than having to upload a modified version of our vertex data for every update of this variable, we just simply pass in the variable itself. Which means that they are easily modifiable, and we can even modify them every frame.

![test](pulpit.gif)