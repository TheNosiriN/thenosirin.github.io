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
function update(now){
    requestAnimationFrame(update);

    now *= 0.001;  // convert to seconds
    const elapsedTime = Math.min(now - then, 0.1);
    renderer.time += elapsedTime;
    then = now;

    renderer.drawPasses();

    renderer.frame++;
}


function resize(){
    renderer.resize(window.innerWidth, window.innerHeight);
}





function setupWebGL(){
    canvas = document.querySelector("#background_canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        return false;
    }
    return true;
}


async function loadShaderToy() {
    const response = await fetch("https://www.shadertoy.com/api/v1/shaders/mlySzt?key=rt8lhH");
    const jsonData = await response.json();
    return jsonData;
}




window.addEventListener('resize', resize);

window.addEventListener("mousemove", function(e){
    const rect = canvas.getBoundingClientRect();
    renderer.mouseX = e.clientX - rect.left;
    renderer.mouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
});

window.addEventListener("DOMContentLoaded", function(){
    if (!setupWebGL())return;

    renderer = new Renderer();


    function get_rp_inputs(inputs){
        var descs = [];
        for (var i=0; i<inputs.length; ++i){
            var buffered = true;
            if (inputs[i].ctype == "texture"){
                var tex = new TextureResource(inputs[i].id);
                tex.init("https://www.shadertoy.com"+inputs[i].src);
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
