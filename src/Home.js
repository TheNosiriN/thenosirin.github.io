// import { el, mount } from "https://redom.js.org/redom.es.min.js";
//
//
//
//
// const hello = el("h1", "Hello world!");
//
//
// mount(document.body, hello);
//
// console.log(hello.textContent);


let then = 0;
let tmouseX = 0;
let tmouseY = 0;
function update(now){
    requestAnimationFrame(update);

    now *= 0.001;  // convert to seconds
    const elapsedTime = Math.min(now - then, 0.1);
    renderer.deltaTime = elapsedTime;
    renderer.time += elapsedTime;
    then = now;

    renderer.updateMouse(tmouseX, tmouseY);
    renderer.drawPasses();

    renderer.frame++;
}


function resize(){
    if (renderer){
        renderer.resize(window.innerWidth, window.innerHeight);
    }
}





function setupWebGL(){
    gl = canvas.getContext("webgl2");
    if (!gl) {
        return false;
    }
    return true;
}


async function loadShaderToy(){
    const response = await fetch("https://www.shadertoy.com/api/v1/shaders/mlySzt?key=rt8lhH");
    const jsonData = await response.json();
    return jsonData;
}


async function fetchBlob(url){
    const response = await fetch(url, {mode: "no-cors"});
    return response.blob();
}
async function downloadImageAndSetSource(imageUrl){
    const image = await fetchBlob(imageUrl);
    return URL.createObjectURL(image);
}
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        img.crossOrigin = "";
    }
}

function fetchNoCors(url, options = {}, corsAnyWhereInstanceURL = "https://cors-anywhere.herokuapp.com/"){
    return new Promise(async function(resolve, reject){
        try {
            const res = await fetch(`${corsAnyWhereInstanceURL}${url}`, {
                ...options,
                headers: {
                    ...options.headers,
                    "X-Requested-With": "XMLHttpRequest",
                }
            });
            resolve(res);
        } catch (err) {
            reject(err);
        }
    });
};



function createShadertoyBackground(){
    function get_rp_inputs(inputs){
        var descs = [];
        for (var i=0; i<inputs.length; ++i){
            var buffered = true;
            if (inputs[i].ctype == "texture"){
                let tex = new TextureResource(inputs[i].id);

                fetchNoCors(
                    "https://www.shadertoy.com"+inputs[i].src
                ).then(function(response){
                    response.blob().then(function(blob){
                        tex.init(URL.createObjectURL(blob));
                    });
                });

                renderer.addTexture(tex);
                buffered = false;
            }
            descs.push(new ChannelDesc(inputs[i].id, inputs[i].channel, null, buffered));
        }
        return descs;
    }


    loadShaderToy().then(function(blob){
        console.log(blob);

        var common = shadertoyfragmentShaderHeader;
        var buffercode = [];
        var tpasses = [];

        for (var i=blob.Shader.renderpass.length; i--;){
            const pass = blob.Shader.renderpass[i];
            console.log(pass);
            const code = common+"\n"+pass.code+"\n";

            switch (pass.type){
                case "common": common = code; break;
                case "image": {
                    var r = new Renderpass(get_rp_inputs(pass.inputs));
                    if (!r.init(vertexShader, code))return;
                    renderer.mainPass = r;
                } break;
                case "buffer": {
                    buffercode.push(code);
                    tpasses.push(new BufferRenderpass(pass.outputs[0].id, get_rp_inputs(pass.inputs)));
                } break;
            }
        }


        for (var i=0; i<tpasses.length; ++i){
            if (!tpasses[i].init(vertexShader, buffercode[i]))return;
            renderer.addPass(tpasses[i]);
        }


        resize();
        console.log(renderer);
        update(0);
    });
}




function LoadTextureFile(path, callback, binary){
    if (FileReader){
        var fr = new FileReader();
        fr.onload = () => callback(fr.result);
        fetch(path).then((response) => response.blob()).then(
            (blob) => (binary ? fr.readAsArrayBuffer(blob) : fr.readAsDataURL(blob))
        );
    }
}

function SetupTexture2D(path, filter, wrap){
    const ftex = gl.createTexture();
    LoadTextureFile(path, (result) => {
        var image = new Image();
        image.src = result;
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, ftex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter == gl.LINEAR_MIPMAP_NEAREST ? gl.LINEAR : filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);

            if (filter == gl.LINEAR_MIPMAP_NEAREST){
                gl.generateMipmap(gl.TEXTURE_2D);
            }
        };
    });
    return ftex;
}

function SetupTexture3D(path, width, height, depth, filter, wrap){
    const ftex = gl.createTexture();
    LoadTextureFile(path, (result) => {
        gl.bindTexture(gl.TEXTURE_3D, ftex);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.R8, width, height, depth, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(result));
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, wrap);
    }, true);
    return ftex;
}


var toy;
function UseShaderToyLite(){
    var image = `
    void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
        vec2 uv = fragCoord.xy / iResolution.xy;
        vec4 col = texture(iChannel2, uv);
        fragColor = vec4(col.rgb, 1.);
    }
    `;

    toy = new ShaderToyLite('background_canvas');
    gl = toy.getContext();

    toy.addTexture(SetupTexture2D("img/shader/pebbles.png", gl.LINEAR, gl.REPEAT), "pebbles");
    toy.addTexture(SetupTexture2D("img/shader/rgbanoise.png", gl.LINEAR, gl.REPEAT), "rgba_noise");
    toy.addTexture(SetupTexture2D("img/shader/bluenoise.png", gl.NEAREST, gl.REPEAT), "blue_noise");
    toy.addTexture(SetupTexture3D("img/shader/greynoise3d.bin", 32, 32, 32, gl.LINEAR, gl.REPEAT), "grey_noise_3d");
    toy.addTexture(SetupTexture2D("img/shader/organic2.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_2");
    toy.addTexture(SetupTexture2D("img/shader/organic3_256.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_3");

    // toy.setCommon(NEBULA_SHADER_COMMON);
    // toy.setImage({
    //     source: NEBULA_SHADER_IMAGE,
    //     iChannel0: "rgba_noise", iChannel1: "blue_noise", iChannel2: "pebbles", iChannel3: "grey_noise_3d"
    // });
    toy.setCommon(PORTFOLIO_SHADER1_COMMON);
    toy.setBufferA({
        source: PORTFOLIO_SHADER1_BUFFA,
        iChannel0: "organic_2", iChannel1: "organic_3"
    });
    toy.setImage({
        source: PORTFOLIO_SHADER1_IMAGE, iChannel0: "A"
    });
    toy.play();

    resizeShaderToyLite();

    window.addEventListener('resize', resizeShaderToyLite);
    window.addEventListener("mousemove", toy.bindMousemove);
}

function resizeShaderToyLite(e){
    toy.resize(window.innerWidth, window.innerHeight);
}






window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    tmouseX = e.clientX - rect.left;
    tmouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
});

window.addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#background_canvas");
    // if (!setupWebGL())return;
    //
    // renderer = new Renderer({
    //     lerpMouseFactor: 3,
    // });

    Promise.all([
        UTILS.loadFile("src/shader/portfolio_shader1/portfolio_shader1_common.glsl"),
        UTILS.loadFile("src/shader/portfolio_shader1/portfolio_shader1_buffA.glsl"),
        UTILS.loadFile("src/shader/portfolio_shader1/portfolio_shader1_image.glsl"),
        UTILS.loadFile("src/shader/nebula/nebula_shader_common.glsl"),
        UTILS.loadFile("src/shader/nebula/nebula_shader_image.glsl"),
    ]).then((data) => {

        PORTFOLIO_SHADER1_COMMON = data[0];
        PORTFOLIO_SHADER1_BUFFA = data[1];
        PORTFOLIO_SHADER1_IMAGE = data[2];

        NEBULA_SHADER_COMMON = data[3];
        NEBULA_SHADER_IMAGE = data[4];

        UseShaderToyLite();
    });


});
