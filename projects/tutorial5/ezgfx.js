let ezgfxGlobals = {}; // not for use by the user - it's just some global constants that are needed by our shaders 
const ezgfx = {
	Mesh: class {
		constructor() {
			this.vertexbuffer = new ezgl.VertexBuffer();
			this.vertexbuffer.vertexLayout([3, 2, 3]);
		}
		free() {
			this.vertexbuffer.free();
		}

		loadFromData(data) {
			this.vertexbuffer.vertexData(data);
		}
		loadFromOBJ(url) {
			this.vertexbuffer.vertexData(ezgfxGlobals.triangle);
			fetch(url).then(response => {
				response.text().then(text => {
					const verticesLoaded = ezobj.load(text);
					this.vertexbuffer.vertexData(verticesLoaded);
				});
			});
		}
	},
	Texture: class {
		constructor() {
			this.texture = new ezgl.Texture();
		}
		free() {
			this.texture.free();
		}

		loadFromFile(url, options = {wrap: gl.REPEAT, filter: gl.NEAREST}) {
			this.texture.fromFile(url, options);
		}
		loadFromData(data, options = {wrap: gl.REPEAT, filter: gl.NEAREST}) {
			this.texture.fromData(data, options);
		}
	},
	Material: class {
		constructor(customShader = null) {
			this.shader = new ezgl.Shader();
			this.shader.join(ezgfxGlobals.vSS);
			if(!customShader) {
				this.shader.join(ezgfxGlobals.fSS);
				this.shader.link();
			}
			else {
				let fSS = new ezgl.SubShader(gl.FRAGMENT_SHADER, ezgfxGlobals.fSSC0 + customShader + ezgfxGlobals.fSSC1); 
				this.shader.join(fSS);
				this.shader.link();
				fSS.free();
			}

			this.shader.bind();
			this.textures = [];
			this.shader.set4f("u_Color", 1.0, 1.0, 1.0, 1.0);
			for(let i = 0; i < 16; i++) {
				this.shader.set1i("u_TexID[" + i + "]", i);
			}
			this.shader.unbind();
		}
		free() {
			this.shader.free();
		}

		setProjection(mat) {
			this.shader.bind();
			this.shader.set4x4f("u_Projection", mat);
			this.shader.unbind();
		}
		setView(mat) {
			this.shader.bind();
			this.shader.set4x4f("u_View", mat);
			this.shader.unbind();
		}
		setModel(mat) {
			this.shader.bind();
			this.shader.set4x4f("u_Model", mat);
			this.shader.unbind();
		}

		setColor(rgba = [1.0, 1.0, 1.0, 1.0]) {
			this.shader.bind();
			this.shader.set4f("u_Color", rgba[0], rgba[1], rgba[2], rgba[3], rgba[4]);
			this.shader.unbind();
		}
		setTexture(texture, slot = 0) {
			this.textures[slot] = texture.texture;
		}
	},
	Renderer: class {
		constructor() {
			this.color = [0.0, 0.0, 0.0, 1.0];
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			
			this.masks = gl.COLOR_BUFFER_BIT;
			this.depthTest = false;

			ezgfxGlobals.fSSC0 = "#version 300 es\n\
			precision mediump float;\n\
			\n\
			out vec4 o_Color;\n\
			\n\
			in vec2 v_TexCoord;\n\
			\n\
			uniform vec4 u_Color;\n\
			uniform sampler2D u_TexID[16];\n";
			ezgfxGlobals.fSSC1 = "\nvoid main() {\n\
				o_Color = shader();\n\
			}";
			ezgfxGlobals.vSS = new ezgl.SubShader(gl.VERTEX_SHADER, "#version 300 es\n\
			precision mediump float;\n\
			\n\
			layout(location = 0) in vec3 a_Position;\n\
			layout(location = 1) in vec2 a_TexCoord;\n\
			layout(location = 2) in vec3 a_Normal;\n\
			\n\
			uniform mat4 u_Projection;\n\
			uniform mat4 u_View;\n\
			uniform mat4 u_Model;\n\
			\n\
			out vec2 v_TexCoord;\n\
			\n\
			void main() {\n\
			gl_Position = u_Projection * u_View * u_Model * vec4(a_Position, 1.0);\n\
				v_TexCoord = a_TexCoord;\n\
				v_TexCoord.y = 1.0 - v_TexCoord.y;\n\
			}");
			ezgfxGlobals.fSS = new ezgl.SubShader(gl.FRAGMENT_SHADER, ezgfxGlobals.fSSC0 + "\nvec4 shader() { return u_Color; }\n" + ezgfxGlobals.fSSC1),
				
			ezgfxGlobals.triangle = [
					-0.5, -0.5, 0.0,
						0.0, 0.0,
							0.0, 0.0, 1.0,
					0.0, 0.5, 0.0,
						0.5, 1.0,
							0.0, 0.0, 1.0,
					0.5, -0.5, 0.0,
						1.0, 0.0,
							0.0, 0.0, 1.0 
			];
		}
		depthTesting(enable) {
			if(enable && !this.depthTest) {
				this.masks = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
				gl.enable(gl.DEPTH_TEST);

				this.depthTest = true;
			}
			else if(!enable && this.depthTest) {
				this.masks = gl.COLOR_BUFFER_BIT;
				gl.disable(gl.DEPTH_TEST);

				this.depthTest = false;
			}
		}
		clear(color = [0.0, 0.0, 0.0, 1.0]) {
			if(color != this.color) {
				gl.clearColor(color[0], color[1], color[2], color[3]);
				this.color = color;
			}
			gl.clear(this.masks);
		}
		draw(mesh, material) {
			material.shader.bind();
			for(let i = 0; i < material.textures.size; i++) {
				material.textures[i].bind(i);
			}
			mesh.vertexbuffer.draw();
			material.shader.unbind();
		}
	}
};