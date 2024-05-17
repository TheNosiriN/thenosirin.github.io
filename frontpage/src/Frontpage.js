SetupForegroundRenderer();

window.addEventListener("DOMContentLoaded", () => {
    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("main_page_container"));
    }

    const bg = `rgb(${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255})`;
    document.getElementById("main_page_container").style.backgroundColor = bg;

    var welcome = document.getElementById("welcome_message");
    welcome.innerHTML = WelcomeMessages[Math.floor(Math.random()*WelcomeMessages.length)];

    StartForegroundRenderer(() => {
        setupWelcomeScheduledAnimation();
        RefreshAnimatedRectDivs();
        setInterval(updateAnimatedRectDivs, 16);
        // enterPage(scheduler, 0, true);
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



function setupWelcomeScheduledAnimation(){
    var title_text = document.getElementById("title_text_div");
    var events = [];

    const activate = (div, time, duration) => {
        div.dataset.startTime = time;
        div.dataset.stopTime = time+duration;
        div.style.display = "grid";
    }
    const deactivate = (div) => {
        div.dataset.startTime = -10;
        div.dataset.stopTime = -10;
        div.style.display = "none";
    }

    let div = title_text.children[0];
    div.style.opacity = 0;
    div.style.display = "grid";

    // start with name
    scheduler.addEventNoSort(1, (time) => {
        activate(title_text.children[0], time, 3.5);
        title_text.children[0].dataset.startTime = -10;
        title_text.children[0].style.opacity = 1;
    });

    // from name to text
    scheduler.addEventNoSort(6, (time) => {
        deactivate(title_text.children[0]);
        activate(title_text.children[1], time, 10);
    });

    // from text to transition
    scheduler.addEvent(9, (time) => {
        leavePage("home.html", scheduler, time);
    });
}
