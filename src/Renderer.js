const vertexShader = `
attribute vec4 a_position;

void main() {

    gl_Position = a_position;
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;

void main() {
    gl_FragColor = vec4(fract((gl_FragCoord.xy - u_mouse) / u_resolution), fract(u_time), 1);
}
`;


let mouseX = 0;
let mouseY = 0;
function setMousePosition(e) {
    const rect = inputElem.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
}


function createShaders(){

}


function setupWebGL(){
    const canvas = document.querySelector("#background_canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    const resolutionLocation = gl.getUniformLocation(program, "iResolution");
    const mouseLocation = gl.getUniformLocation(program, "iMouse");
    const timeLocation = gl.getUniformLocation(program, "iTime");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  // first triangle
        1, -1,
        -1,  1,
        -1,  1,  // second triangle
        1, -1,
        1,  1,
    ]), gl.STATIC_DRAW);
}


let then = 0;
let time = 0;
function render(now) {
    requestId = undefined;
    now *= 0.001;  // convert to seconds
    const elapsedTime = Math.min(now - then, 0.1);
    time += elapsedTime;
    then = now;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,          // 2 components per iteration
        gl.FLOAT,   // the data is 32bit floats
        false,      // don't normalize the data
        0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
        0,          // start at the beginning of the buffer
    );

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(mouseLocation, mouseX, mouseY);
    gl.uniform1f(timeLocation, time);

    gl.drawArrays(
        gl.TRIANGLES,
        0,     // offset
        6,     // num vertices to process
    );
}



function resizeWebGL(){
    const w = window.innerWidth;
    const h = window.innerHeight;
}



window.addEventListener('resize', resizeWebGL);
