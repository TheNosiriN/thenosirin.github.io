PixelPageHeader();


// splash text
var splashtext = document.getElementById("splash_text");
splashtext.innerHTML = SplashTexts[Math.floor(Math.random()*SplashTexts.length)];



// transition nav buttons
// let buttons = document.querySelectorAll(".nav_buttons > div");
// for (var i=0; i<buttons.length; ++i){
//     let b = buttons[i];
//     b.classList.add("animated_transition");
//     b.dataset.speed = 0.25 + Math.random()*0.75;
//     b.dataset.startTime = (i*0.5) + 1;
//     b.dataset.stopTime = -10;
//     b.dataset.grid = 0.4;
//     b.dataset.type = 1;
// }

// configure nav buttons
{
    let buttons = document.querySelectorAll(".nav_buttons a");
    buttons.forEach((b) => {
        b.onclick = (e) => {
            leavePage(b.href, scheduler, foreground.toy.getTime());
            b.style.pointerEvents = "none";
            e.preventDefault();
        };
    });
}




function animateText(id, animation_class, delay){
    let el = document.getElementById(id);
    el.innerHTML = el.innerHTML.split("").map(letter => {
        return "<span>" + letter + "</span>";
    }).join("");
    Array.from(el.children).forEach((span, index) => {
        span.classList.add(animation_class);
        span.style.animationDelay = `${index*delay+1}s`;
    });
}

animateText("title_text", "jumping_text", 2.0*0.1); // wavy text
animateText("splash_text", "jumping_text", 2.0*0.1); // wavy text
animateText("ref_demo", "rainbow_text", 0.05); // rainbow color text

document.getElementById("menu_container").style.backgroundColor = `rgb(${
    BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255
})`;



window.addEventListener("DOMContentLoaded", () => {
    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("main_page_container"));
    }

    StartForegroundRenderer(() => {
        RefreshAnimatedRectDivs();
        setInterval(updateAnimatedRectDivs, 16);
        enterPage(scheduler, 0);
        if (!foreground.toy){
            updateWithFrame();
        }else{
            foreground.toy.setOnDraw(update);
        }
        scheduler.addEvent(1, () => {
            document.getElementById("main_page_container").style.backgroundColor = "#252627";
        });
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
