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

var video = document.getElementById("myVideo");

function update(){
    requestAnimationFrame(update);

    if (video !== null && video.pasued){
        var playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
                console.log("video started playing");
            })
            .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
                console.log("video not playing");
                console.log(error);
            });
        }
    }
}




async function logJSONData() {
    const response = await fetch("https://www.shadertoy.com/api/v1/shaders/WdGBWt?key=rt8lhH");
    const jsonData = await response.json();
    console.log("printing json data");
    console.log(jsonData);
}


window.addEventListener("DOMContentLoaded", function(){
    logJSONData();
    setupWebGL();

    resizeWebGL();
    update();

});
