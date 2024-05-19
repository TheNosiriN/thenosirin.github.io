var toy, gl, canvas;


class RenderContext {
    constructor(){
        this.toy = null;
        this.gl = null;
        this.canvas = null;
    }
}

var foreground = new RenderContext();
var background = new RenderContext();



function LoadTextureFile(path, callback, binary){
    if (FileReader){
        var fr = new FileReader();
        fr.onload = () => callback(fr.result);
        fetch(path).then((response) => response.blob()).then(
            (blob) => (binary ? fr.readAsArrayBuffer(blob) : fr.readAsDataURL(blob))
        );
    }
}

function SetupTexture2D(gl, path, filter, wrap){
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

function SetupTexture3D(gl, path, width, height, depth, filter, wrap){
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

function resizeRenderer(ctx){
    ctx.toy.resize(window.innerWidth, window.innerHeight);
}



var rects_buffer;
const RectBufferStride = 9*4;
const RectVertexCount = 6;

function makeRectVerts(rect, start_time=0, stop_time=0, speed=1, type=0, grid_mult=1){
    const x1 = rect.x;
    const y1 = rect.y;
    const x2 = rect.x+rect.w;
    const y2 = rect.y+rect.h;
    return new Float32Array([
        x1, y1, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult,
        x2, y1, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult,
        x1, y2, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult,
        x2, y2, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult,
        x1, y2, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult,
        x2, y1, rect.w, rect.h, start_time, stop_time, speed, type, grid_mult
    ]);
}

function ConfigureForegroundRenderer(){
    foreground.canvas = document.getElementById("foreground_canvas");
    if (!foreground.canvas)return;

    var toy = new ShaderToyLite(foreground.canvas, {
        alpha: true,
        premultipliedAlpha: true,
        vertexBufferProps: [
            { size: 2, stride: RectBufferStride },
            { size: 3, stride: RectBufferStride, offset: 2*4 },
            { size: 3, stride: RectBufferStride, offset: 4*4 },
            { size: 2, stride: RectBufferStride, offset: 7*4 },
        ]
    });
    var gl = toy.getContext();

    // toy.addTexture(SetupTexture2D(gl, "img/shader/pebbles.png", gl.LINEAR, gl.REPEAT), "pebbles");
    toy.addTexture(SetupTexture2D(gl, UTILS.getSitePath()+"img/shader/rgbanoise.png", gl.NEAREST, gl.REPEAT), "rgba_noise");
    // toy.addTexture(SetupTexture2D(gl, "img/shader/bluenoise.png", gl.NEAREST, gl.REPEAT), "blue_noise");
    // toy.addTexture(SetupTexture2D(gl, "img/shader/greynoise.png", gl.NEAREST, gl.REPEAT), "grey_noise");
    // toy.addTexture(SetupTexture3D(gl, "img/shader/greynoise3d.bin", 32, 32, 32, gl.LINEAR, gl.REPEAT), "grey_noise_3d");
    // toy.addTexture(SetupTexture2D(gl, "img/shader/organic2.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_2");
    // toy.addTexture(SetupTexture2D(gl, "img/shader/organic3_256.jpg", gl.LINEAR_MIPMAP_NEAREST, gl.REPEAT), "organic_3");

    rects_buffer = toy.getVertexBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rects_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, RectBufferStride * RectVertexCount, gl.DYNAMIC_DRAW);

    foreground.toy = toy;
    foreground.gl = gl;
}


function SetupForegroundRenderer(){
    if (!SHOW_ANIMATED_TRANSITIONS)return;

    ConfigureForegroundRenderer();
    resizeRenderer(foreground);
    window.addEventListener('resize', (e) => resizeRenderer(foreground));
    window.addEventListener("mousemove", foreground.toy.bindMousemove);

    Promise.all([
        UTILS.loadFile(UTILS.getSitePath()+"frontpage/shader/foreground_shader_vertex.glsl"),
        UTILS.loadFile(UTILS.getSitePath()+"frontpage/shader/foreground_shader_image.glsl"),
    ]).then((data) => {
        var FOREGROUND_SHADER_VERTEX = data[0];
        var FOREGROUND_SHADER_IMAGE = data[1];

        foreground.toy.setVertex(FOREGROUND_SHADER_VERTEX);
        foreground.toy.setImage({
            source: FOREGROUND_SHADER_IMAGE, iChannel0: "rgba_noise",
            uniforms: ["devicePixelRatio", "backgroundColor"]
        });

        foreground.toy.setOnUniforms((gl, uniforms) => {
            gl.uniform1f(uniforms["devicePixelRatio"], window.devicePixelRatio);
            gl.uniform3f(uniforms["backgroundColor"], BackgroundColor.x, BackgroundColor.y, BackgroundColor.z);
        });
    });
}


function StartForegroundRenderer(callback){
    if (!SHOW_ANIMATED_TRANSITIONS){
        if (callback){ callback(); }
        return;
    }

    const waitfunc = () => {
        if (!foreground.toy){
            requestAnimationFrame(waitfunc);
            return;
        }
        foreground.toy.play();
        if (callback){ callback(); }
        foreground.gl.finish();
    };
    waitfunc();
}
