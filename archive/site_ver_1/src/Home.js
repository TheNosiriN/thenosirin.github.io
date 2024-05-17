

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



var toy, gl, canvas;


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



function StartShaderBackground(){
    canvas = document.querySelector("#background_canvas");

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
}




function AddDebugBorders(element, level=0){
    const colors = ["red", "blue", "lime"];
    element.style.border = "5px solid";
    element.style.borderColor = colors[level % colors.length];
    for (const child of element.children) {
        // if (child.tagName != "DIV")continue;
        AddDebugBorders(child, level+1);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    SetupMainPageScrolling();
    SetupStickySections();
    if (SHOW_BACKGROUND_SHADER){
        StartShaderBackground();
    }

    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("home_page_container"));
    }
});


function SetupMainPageScrolling(){
    var event_elements = document.getElementsByClassName("centered_title_event");
    event_elements[0].style.opacity = 1;

    var lastScroll = 0;

    var mainPage = document.getElementsByClassName("main_page")[0];
    mainPage.addEventListener("scroll", (event) => {
        var scroll = mainPage.scrollTop;
        if (lastScroll == scroll)return;

        const interval = window.innerHeight;
        const nscroll = scroll + interval - 10;
        const nlastScroll = lastScroll + interval - 10;

        const downward = scroll > lastScroll;
        const top = Math.min(nscroll, nlastScroll)/interval;
        const difference = Math.abs(Math.floor(nscroll/interval) - Math.floor(nlastScroll/interval));
        lastScroll = scroll <= 0 ? 0 : scroll; // For Mobile or negative scrolling

        if (!difference)return;

        var touched = Math.floor(top);
        if (touched == 4 && toy){
            if (toy.getIsPlaying()){
                toy.pause();
                console.log("paused");
            }else{
                toy.play();
            }
        }
        // console.log("touched: "+touched+", from: "+(downward ? "down-up" : "up-down"));

        // hide other ones
        const previousIndex = touched + (downward ? -1 : 1);
        if (previousIndex >= 0 && previousIndex < event_elements.length){
            var el = event_elements[previousIndex];
            el.style.opacity = 0;
            el.style.pointerEvents = "none !important";
        }

        // show the touched one
        if (touched < event_elements.length){
            var el = event_elements[touched];
            if (el.style.opacity == 1){
                el.style.opacity = 0;
                el.querySelectorAll("a").forEach((cl) => {
                    cl.style.pointerEvents = "none";
                });
            }else{
                el.style.opacity = 1;
                el.querySelectorAll("a").forEach((cl) => {
                    cl.style.pointerEvents = "auto";
                });
            }
        }

    });
}



function SetupStickySections(){
    var currentSection;
    let callback = ([e]) => {
        if (e.isIntersecting){
            e.target.classList.add("isSticky");
        }else{
            e.target.classList.remove("isSticky");
        }
    };

    const sections = document.getElementsByClassName("section");
    for (var i=0; i<sections.length; ++i){
        if (i<sections.length-1){
            sections[i].appendChild(sections[i+1]);
        }

        let observer = new IntersectionObserver(callback, {
            root: sections[i].parentElement,
            threshold: [0.955, 1.0]
        });
        observer.observe(sections[i]);
    }
}
