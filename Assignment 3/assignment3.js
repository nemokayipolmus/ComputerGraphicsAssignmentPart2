"use strict";

var canvas;
var gl;
var bufferTri,triVertices,bufferGib,gibVertices;
var bufferSquare,squareVertices; 
var bufferRect, bufferRect2, bufferRect3, rectVertices, rectVertices2, rectVertices3;

var translate_X = 0;
var translate_Y = 0;
var translate_Z = 0;
var scaling = 1;
var rotate_x = 0;
var rotate_y = 0;
var rotate_z = 0;
var speed = 1;

var CamPos = vec3(0,0,5); //eye
var CamTar = vec3(0,0,0); //at
var UP = vec3(0,1,0); //up
var FOVY = 45;


var vPosition;
var transformationMatrix, transformationMatrixLoc;
var viewMatrix, viewMatrixLoc;
var projectionMatrix, projectionMatrixLoc;

var color;
var red = 0;
var green = 0;
var blue = 0;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Make the letters
	triVertices = [
		// Front face
      vec3( 0.0, 0.185, 0.0),
      vec3( -0.1, -0.185, 0.1),
      vec3( 0.1, -0.185, 0.1),
        // Right face
      vec3( 0.0, 0.185, 0.0),
      vec3( 0.1, -0.185,  0.1),
      vec3( 0.1, -0.185, -0.1),
        // Back face
      vec3( 0.0,  0.185,  0.0),
      vec3( 0.1, -0.185, -0.1),
      vec3( -0.1, -0.185, -0.1),
        // Left face
      vec3( 0.0,  0.185,  0.0),
      vec3( -0.1, -0.185, -0.1),
      vec3( -0.1, -0.185,  0.1)

];

	gibVertices = [
	  vec3( 0.00,  0.09,  0.0),
      vec3( 0.00, 0.09,  0.375),
      vec3( -0.03, 0.09,  0.0),
	  
	  vec3( 0.00,  0.09,  0.0),
      vec3( 0.00, 0.09,  0.375),
      vec3( 0.03, 0.09,  0.0),
	  
	  vec3( -0.03,  0.09,  0.0),
      vec3( 0.00, 0.09,  0.375),
      vec3( 0.00, 0.09,  0.0)
	  
];

	rectVertices = [
        vec3(  -0.1,  -0.2, 0.2),
        vec3(  0.1,  -0.2, 0.2),
        vec3(  -0.1,  0.2, 0.2),
        vec3(  0.1,  0.2, 0.2)
    ];
	
    rectVertices2 = [
        vec3(  -0.1,  -0.2, 0.205),
        vec3(  0.1,  -0.2, 0.205),
        vec3(  -0.1,  0.2, 0.205),
        vec3(  0.1,  0.2, 0.205)
    ];
	
    rectVertices3 = [
        vec3(  -0.1,  -0.2, 0.21),
        vec3(  0.1,  -0.2, 0.21),
        vec3(  -0.1,  0.2, 0.21),
        vec3(  0.1,  0.2, 0.21)
    ];
	
    squareVertices = [
        vec3(   1.25,  -1.25,  1.25 ),
        vec3(  -1.25,  -1.25,  1.25 ),
        vec3(   1.25,  -1.25, -1.25 ),
        vec3(  -1.25,  -1.25, -1.25 ),
    ];

    // Load the data into the GPU
	
	bufferTri = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triVertices), gl.STATIC_DRAW );
	
	bufferGib = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferGib );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(gibVertices), gl.STATIC_DRAW );
	
	bufferRect = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices), gl.STATIC_DRAW );

	bufferRect2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices2), gl.STATIC_DRAW );
	
	bufferRect3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect3 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectVertices3), gl.STATIC_DRAW );
    	
    bufferSquare = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transformationMatrixLoc = gl.getUniformLocation( program, "transformationMatrix" );
	viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix");
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix");
    
	color = gl.getUniformLocation(program, "color");

    document.getElementById("FOVY").oninput = function(event) {
        FOVY = event.target.value;//
    };
    document.getElementById("cam_posX").oninput = function(event) {
        CamPos[0] = event.target.value;//
    };
    document.getElementById("cam_posY").oninput = function(event) {
        CamPos[1] = event.target.value;//
    };
    document.getElementById("cam_posZ").oninput = function(event) {
        CamPos[2] = event.target.value;//
    };
    document.getElementById("cam_tarX").oninput = function(event) {
        CamTar[0] = event.target.value;//
    };
    document.getElementById("cam_tarY").oninput = function(event) {
        CamTar[1] = event.target.value;//
    };
    document.getElementById("cam_tarZ").oninput = function(event) {
        CamTar[2] = event.target.value;//
    };
	document.getElementById("inp_objX").oninput = function(event) {
        translate_X = document.getElementById("inp_objX").value;
    };
    document.getElementById("inp_objY").oninput = function(event) {
        translate_Y = document.getElementById("inp_objY").value;
    };
	document.getElementById("inp_objZ").oninput = function(event) {
    translate_Z = document.getElementById("inp_objZ").value;
    };
    document.getElementById("inp_obj_scale").oninput = function(event) {
        scaling = document.getElementById("inp_obj_scale").value;
    };
	document.getElementById("inp_obj_rotation_x").oninput = function(event) {
		rotate_x = document.getElementById("inp_obj_rotation_x").value;
    };  
	document.getElementById("inp_obj_rotation_y").oninput = function(event) {
		rotate_y = document.getElementById("inp_obj_rotation_y").value;
    };
	document.getElementById("inp_obj_rotation_z").oninput = function(event) {
		rotate_z = document.getElementById("inp_obj_rotation_z").value;
    };
	document.getElementById("inp_wing_speed").oninput = function(event) {
        speed = document.getElementById("inp_wing_speed").value;
    };
    document.getElementById("redSlider").oninput = function(event) {
        red = document.getElementById("redSlider").value;
    };
    document.getElementById("greenSlider").oninput = function(event) {
        green = document.getElementById("greenSlider").value;
    };
    document.getElementById("blueSlider").oninput = function(event) {
        blue = document.getElementById("blueSlider").value;
    };

    render();

};

var ramount = 0;
var amount = 0.5;
var speedAmount = 0;

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	
    transformationMatrix=mat4();
	viewMatrix=mat4();
    projectionMatrix=mat4();
	transformationMatrix = mult(transformationMatrix, translate(translate_X, translate_Y, translate_Z, 0));
	transformationMatrix = mult(transformationMatrix, rotateX(rotate_x,));
	transformationMatrix = mult(transformationMatrix, rotateY(rotate_y));
	transformationMatrix = mult(transformationMatrix, rotateZ(rotate_z));
	transformationMatrix = mult(transformationMatrix, scalem(scaling, scaling, scaling, 1));
    viewMatrix=lookAt(CamPos,CamTar,UP);
	projectionMatrix=perspective(FOVY,1,1,20);
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(viewMatrix) );
	gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	
	
	
	gl.uniform4fv( color, flatten([red,green,blue,1]));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferGib );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 12 );
	
		
	
	transformationMatrix = mult(transformationMatrix, translate(0,-0.5,0));
	transformationMatrix = mult(transformationMatrix, scalem(4,4,4,1));
	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	
	gl.uniform4fv( color, flatten([red,green,blue,1]));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferTri );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 12 );
	
	if(speed != 0){
	speedAmount = amount * speed;
	}
	
	ramount = ramount + speedAmount;
	
	
	transformationMatrix = mult(transformationMatrix, scalem(0.4,0.4,0.4,1));
	transformationMatrix = mult(transformationMatrix, translate(0,0.15,0));
	
	transformationMatrix = mult(transformationMatrix, translate(0,0.2125,0));
	transformationMatrix = mult(transformationMatrix, rotateZ(ramount));
	transformationMatrix = mult(transformationMatrix, translate(0,-0.2125,0));

	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	
	gl.uniform4fv( color, flatten([1,0,0,1]));
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	transformationMatrix = mult(transformationMatrix, translate(0,0.175,0));
	transformationMatrix = mult(transformationMatrix, rotateZ(120));
	transformationMatrix = mult(transformationMatrix, translate(0,-0.175,0));
	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	
	gl.uniform4fv( color, flatten([0,0,1,1]));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect2 );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	transformationMatrix = mult(transformationMatrix, translate(0,0.175,0));
	transformationMatrix = mult(transformationMatrix, rotateZ(120));
	transformationMatrix = mult(transformationMatrix, translate(0,-0.175,0));
	
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	
	gl.uniform4fv( color, flatten([0,1,0,1]));
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferRect3 );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	
	transformationMatrix=mat4();
	gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(transformationMatrix) );
	gl.uniform4fv( color, flatten([0.82352,0.70558,0.54901,1.0]));
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSquare );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}