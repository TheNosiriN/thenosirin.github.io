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
    canvas = document.querySelector("#background_canvas");
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




window.addEventListener('resize', resize);

window.addEventListener("mousemove", function(e){
    const rect = canvas.getBoundingClientRect();
    tmouseX = e.clientX - rect.left;
    tmouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
});

window.addEventListener("DOMContentLoaded", function(){
    if (!setupWebGL())return;

    renderer = new Renderer({
        lerpMouseFactor: 2,
    });


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

});
