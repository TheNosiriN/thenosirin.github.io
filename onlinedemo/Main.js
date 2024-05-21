
var ReadyToStart = false;
function StartShaderDemo(){
    canvas = document.querySelector("#background_canvas");
    toy = new ShaderToyLite(canvas, {
        powerPreference: "high-performance"
    });
    gl = toy.getContext();

    background.canvas = canvas;
    background.toy = toy;
    background.gl = gl;

    toy.addTexture(SetupTexture2D(gl, "img/shader/rgbanoise.png", gl.LINEAR, gl.REPEAT), "rgba_noise");
    toy.addTexture(SetupTexture2D(gl, "img/shader/bluenoise.png", gl.NEAREST, gl.REPEAT), "blue_noise");
    toy.addTexture(SetupTexture2D(gl, "img/shader/organic2.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_2");
    toy.addTexture(SetupTexture2D(gl, "img/shader/organic3_256.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_3");

    resizeRenderer(background);
    window.addEventListener('resize', (e) => resizeRenderer(background));
    window.addEventListener("mousemove", background.toy.bindMousemove);

    Promise.all([
        UTILS.loadFile("shader/portfolio_shader1/portfolio_shader1_common.glsl"),
        UTILS.loadFile("shader/portfolio_shader1/portfolio_shader1_buffA.glsl"),
        UTILS.loadFile("shader/portfolio_shader1/portfolio_shader1_image.glsl")
    ]).then((data) => {
        var PORTFOLIO_SHADER1_COMMON = data[0];
        var PORTFOLIO_SHADER1_BUFFA = data[1];
        var PORTFOLIO_SHADER1_IMAGE = data[2];

        toy.setCommon(PORTFOLIO_SHADER1_COMMON);
        toy.setBufferA({
            source: PORTFOLIO_SHADER1_BUFFA,
            iChannel0: "organic_2", iChannel1: "organic_3"
        });
        toy.setImage({
            source: PORTFOLIO_SHADER1_IMAGE, iChannel0: "A"
        });

        ReadyToStart = true;
    });
}
StartShaderDemo();



const SHOW_DEBUG_BORDERS = false;
var warning_text;

window.addEventListener("DOMContentLoaded", () => {

    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("main_page_container"));
    }

    warning_text = document.getElementById("warning_text");

    scheduler.addEvent(2, () => {
        warning_text.children[0].innerHTML = "This scene is rendered in real-time";
        warning_text.style.opacity = 1;
    });
    scheduler.addEvent(5, () => {
        warning_text.style.opacity = 0;
    });
    scheduler.addEvent(6.5, () => {
        warning_text.children[0].innerHTML = "Its not optimized to run on mobile devices";
        warning_text.style.opacity = 1;
    });
    scheduler.addEvent(9.5, () => {
        warning_text.style.opacity = 0;
    });
    scheduler.addEvent(11, () => {
        warning_text.style.display = "none";
        const waitfunc = () => {
            if (ReadyToStart){
                background.toy.play();
                return;
            }
            requestAnimationFrame(waitfunc);
        };
        waitfunc();
    });


    update();
});



function update(){
    scheduler.nextEvent();
    requestAnimationFrame(update);
}
