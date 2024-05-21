PixelPageHeader();


animateText("title_text", "jumping_text", 0.25);



var center_cont = document.getElementsByClassName('center_container')[0];
function addProject(url, newtab, image_url, title){
    var link = document.createElement("a");
    link.classList.add("projects_entry", "pixel_borders");
    link.style.backgroundImage = `url(${image_url})`;
    link.href = url;
    if (newtab){ link.target = "_blank"; }
    link.addEventListener("mouseenter", () => {
        link.style.transform = "scale(1.02)";
    });
    link.addEventListener("mouseleave", () => {
        link.style.transform = "scale(1)";
    });

    var h1 = document.createElement("h1");
    h1.innerHTML = title;
    h1.classList.add("title");

    link.appendChild(h1);
    center_cont.appendChild(link);
}



addProject("#", false, "../img/projects/universe_bg2.jpg", "The Universe ver. 1");
addProject("#", false, "../img/projects/babylonjs_planets1.jpeg", "Babylon.JS Planets");
addProject("https://www.shadertoy.com/user/TheNosiriN", true, "../img/projects/shadertoy_pt5.png", "Shadertoy");
addProject("#", false, "../img/projects/marching_cubes1.png", "Iso Surface Extraction");
addProject("https://grayscalegames.itch.io/", true, "../img/projects/pnp_game_1.png", "Gamedev Projects");
addProject("#", false, "", "The Physically Based Universe");



window.addEventListener("DOMContentLoaded", () => {
    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("main_page_container"));
    }

    StartForegroundRenderer(() => {
        RefreshAnimatedRectDivs();
        setInterval(updateAnimatedRectDivs, 8);
        enterPage(scheduler, 0);
        if (!foreground.toy){
            updateWithFrame();
        }else{
            foreground.toy.setOnDraw(update);
        }
    });
});



function update(){
    if (foreground.toy){
        scheduler.setTime(foreground.toy.getTime());
    }
    scheduler.nextEvent();
}

let then = 0;
function updateWithFrame(){
    update();
    requestAnimationFrame(update);
}
