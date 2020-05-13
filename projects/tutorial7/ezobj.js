const ezobj = {
	insertXYZ: function(array, x, y, z) {
		array.push(x);
		array.push(y);
		array.push(z);
	},
	insertUV: function(array, u, v) {
		array.push(u);
		array.push(v);
	},
	getX: function(array, index) {
		return array[index * 3];
	},
	getY: function(array, index) {
		return array[index * 3 + 1];
	},
	getZ: function(array, index) {
		return array[index * 3 + 2];
	},
	getU: function(array, index) {
		return array[index * 2];
	},
	getV: function(array, index) {
		return array[index * 2 + 1];
	},
	getIndex: function(index) {
		return parseInt(index) - 1;
	},
	insertVertex: function(dest, positions, texcoords, normals, vertstr) {
		const indicesStr = vertstr.split("/");
		const indexPos = ezobj.getIndex(indicesStr[0]);
		const indexTex = ezobj.getIndex(indicesStr[1]);
		const indexNor = ezobj.getIndex(indicesStr[2]);

		dest.push(ezobj.getX(positions, indexPos));
		dest.push(ezobj.getY(positions, indexPos));
		dest.push(ezobj.getZ(positions, indexPos));

		dest.push(ezobj.getU(texcoords, indexTex));
		dest.push(ezobj.getV(texcoords, indexTex));
		
		dest.push(ezobj.getX(normals, indexNor));
		dest.push(ezobj.getY(normals, indexNor));
		dest.push(ezobj.getZ(normals, indexNor));
	},
	load: function(obj) {
		let dest = [];
		let positions = [];
		let texcoords = [];
		let normals = [];
		
		const lines = obj.split("\n");
		for(let i = 0; i < lines.length; i++) {
			const line = lines[i].split(" ");
			
			if(line[0] == "vt") {
				ezobj.insertUV(texcoords, parseFloat(line[1]), parseFloat(line[2]));
			}
			else if(line[0] == "vn") {
				ezobj.insertXYZ(normals, parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));
			}
			else if(line[0] == "v") {
				ezobj.insertXYZ(positions, parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));
			}
			else if(line[0] == "f") {
				ezobj.insertVertex(dest, positions, texcoords, normals, line[1]);
				ezobj.insertVertex(dest, positions, texcoords, normals, line[2]);
				ezobj.insertVertex(dest, positions, texcoords, normals, line[3]);
			}
		}
		return dest;
	},
};