const vertexShader = `#version 300 es

vec2 pos[3] = vec2[3](
    vec2(-1,-1), vec2(-1,3), vec2(3,-1)
);

void main() {
    gl_Position = vec4(pos[gl_VertexID], 0, 1);
}
`;

const shadertoyfragmentShaderHeader = `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform int iFrame;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

out vec4 outColor;
void main() {
    mainImage(outColor, gl_FragCoord.xy);
    // outColor = vec4(gl_FragCoord.xy/iResolution.xy,0,1);
}
`;


function lerp(a, b, alpha) {
    return a + alpha * (b - a);
}




var gl, canvas, renderer;

class Renderer {
    constructor(options){
        this.options = options || {};

        this.mouseX = 0;
        this.mouseY = 0;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.deltaTime = 0;
        this.frame = 0;

        this.mainPass = null;
        this.passes = {};
        this.textures = {};
    }

    resize(width, height){
        this.width = width;
        this.height = height;
        canvas.width = width;
        canvas.height = height;

        for(var i in this.passes) {
            this.passes[i].resize(width, height);
        }
    }

    addTexture(tex){
        this.textures[tex.id] = tex;
    }

    addPass(pass){
        this.passes[pass.id] = pass;
    }

    updateMouse(x, y){
        if (this.options.lerpMouseFactor > 0){
            this.mouseX = lerp(this.mouseX, x, this.deltaTime * this.options.lerpMouseFactor);
            this.mouseY = lerp(this.mouseY, y, this.deltaTime * this.options.lerpMouseFactor);
        }else{
            this.mouseX = x;
            this.mouseY = y;
        }
    }

    setupPassInputs(pass){
        for (var i=0; i<pass.inputs.length; ++i){
            const desc = pass.inputs[i];
            gl.activeTexture(gl.TEXTURE0+i);
            if (desc.buffered){
                gl.bindTexture(gl.TEXTURE_2D, this.passes[desc.id].getTarget(this.frame+1).texture);
            }else{
                gl.bindTexture(gl.TEXTURE_2D, this.textures[desc.id].internal);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            }

            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.uniform1i(pass.uniforms.iChannel[desc.channel], i);
        }
    }

    drawPass(pass){
        gl.useProgram(pass.program);
        this.setupPassInputs(pass);
        gl.viewport(0, 0, this.width, this.height);
        gl.uniform3f(pass.uniforms.iResolution, this.width, this.height, 0);
        gl.uniform2f(pass.uniforms.iMouse, this.mouseX, this.mouseY);
        gl.uniform1f(pass.uniforms.iTime, this.time);
        gl.uniform1i(pass.uniforms.iFrame, this.frame);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    drawPasses(){
        for(var i in this.passes) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.passes[i].getTarget(this.frame).framebuffer);
            this.drawPass(this.passes[i]);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.drawPass(this.mainPass);
    }
}



class ChannelDesc {
    constructor(id, channel, sampler, buffered){
        this.id = id;
        this.channel = channel;
        this.buffered = buffered || false;
        this.sampler = sampler;
    }
}


class TextureResource {
    constructor(id){
        this.id = id;
        this.internal = gl.createTexture();
    }

    init(url){
        gl.bindTexture(gl.TEXTURE_2D, this.internal);

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, null);

        function isPowerOf2(value) {
            return (value & (value - 1)) === 0;
        }

        const image = new Image();
        const corsImageModified = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.internal);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            if (isPowerOf2(image.width) && isPowerOf2(image.height)){
                gl.generateMipmap(gl.TEXTURE_2D);
            }
        };

        // url = "https://cors-anywhere.herokuapp.com/"+ url + "?"+Date.now();
        image.crossOrigin = "anonymous";
        image.src = url;
        console.log(url);
    }
}



class Renderpass {
    constructor(inputs){
        this.inputs = inputs;
    }

    init(vsh, fsh){
        this.program = gl.createProgram();
        const vertId = gl.createShader(gl.VERTEX_SHADER);
        const fragId = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertId, vsh);
        gl.shaderSource(fragId, fsh);
        gl.compileShader(vertId);
        gl.compileShader(fragId);

        if (!gl.getShaderParameter(vertId, gl.COMPILE_STATUS)) {
            console.error(vsh);
            console.error("Vertex Shader Compiler Error: " + gl.getShaderInfoLog(vertId));
            gl.deleteShader(vertId);
            return false;
        }

        if (!gl.getShaderParameter(fragId, gl.COMPILE_STATUS)) {
            console.error(fsh);
            console.error("Fragment Shader Compiler Error: " + gl.getShaderInfoLog(fragId));
            gl.deleteShader(fragId);
            return false;
        }

        gl.attachShader(this.program, vertId);
        gl.attachShader(this.program, fragId);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error("Shader Linking Error: " + gl.getProgramInfoLog(this.program));
            return false;
        }

        this.uniforms = {
            iResolution: gl.getUniformLocation(this.program, "iResolution"),
            iMouse: gl.getUniformLocation(this.program, "iMouse"),
            iTime: gl.getUniformLocation(this.program, "iTime"),
            iFrame: gl.getUniformLocation(this.program, "iFrame"),
            iChannel: [
                gl.getUniformLocation(this.program, "iChannel0"),
                gl.getUniformLocation(this.program, "iChannel1"),
                gl.getUniformLocation(this.program, "iChannel2"),
                gl.getUniformLocation(this.program, "iChannel3"),
            ]
        };

        return true;
    }
}



class BufferRenderpass extends Renderpass {
    constructor(id, inputs){
        super(inputs);
        this.id = id;
        this.targets = [];
        for (var i=0; i<2; ++i){
            this.targets.push({
                texture: gl.createTexture(),
                framebuffer: gl.createFramebuffer()
            });
        }
    }

    getTarget(frame){
        return this.targets[frame % 2];
    }

    resize(width, height){
        for (var i=0; i<2; ++i){
            gl.bindTexture(gl.TEXTURE_2D, this.targets[i].texture);

            const level = 0;
            const internalFormat = gl.RGBA;
            const border = 0;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            const data = null;
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets[i].framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.targets[i].texture, level);
        }
    }
}
