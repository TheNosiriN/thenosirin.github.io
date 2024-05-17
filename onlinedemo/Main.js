
function StartShaderDemo(){
    canvas = document.querySelector("#background_canvas");
    toy = new ShaderToyLite(canvas);
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
        toy.play();
    });
}
StartShaderDemo();



const SHOW_DEBUG_BORDERS = false;

window.addEventListener("DOMContentLoaded", () => {
    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("home_page_container"));
    }
});
