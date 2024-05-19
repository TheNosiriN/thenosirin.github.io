PixelPageHeader();



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

        scheduler.addEvent(3, StartPageContent);
    });
});



var typer = null;
function StartPageContent(){
    typer = new TypeWriterEffect(document.getElementById("typed_content"), {
        content: Content,
        typeDelay: 33,
        onFinished: () => {
            console.log("done");
        },
        onInserted: (writer) => {
            writer.element.parentElement.scrollTop = writer.element.parentElement.scrollHeight;
        }
    });
    typer.play();
}



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



function insertSpaceImage(args, writer){
    const path = UTILS.getSitePath() + "img/background/"+args;

    var image = document.createElement("img");
    image.src = path;
    image.style.opacity = 0;
    image.style.width = "85%";
    image.style.height = "auto";
    image.style.display = "block";
    image.style.marginLeft = "auto";
    image.style.marginRight = "auto";
    image.dataset.speed = 0.5;
    image.dataset.type = 7;
    image.dataset.grid = 1;
    image.dataset.startTime = -11;
    image.dataset.stopTime = -10;
    image.classList.add("animated_transition");
    writer.element.appendChild(image);

    RefreshAnimatedRectDivs();
    writer.stop();
    // console.log(image.parentElement.id);

    image.onload = () => {
        image.dataset.startTime = foreground.toy.getTime();
        updateAnimatedRectDivs();
        image.style.opacity = 1;
        writer.play();
    };
}


const Content = [
    TypeWriterEffect.setdelay(45),
    "My name is Chinomso Nosiri, ", TypeWriterEffect.wait(1000), "And I make cool stuff.\n",
    TypeWriterEffect.wait(700), "\n",

    TypeWriterEffect.setdelay(40),
    "I make pretty graphics, ", TypeWriterEffect.wait(500), "I make pretty games, ", TypeWriterEffect.wait(500), "I make pretty websites, ", TypeWriterEffect.wait(500), TypeWriterEffect.setdelay(25), "and I make C++ look prettier than it already is.\n",
    TypeWriterEffect.wait(1500), "\n",

    TypeWriterEffect.setdelay(40),
    "So basically I'm just a Programmer.\n",
    TypeWriterEffect.wait(2000), TypeWriterEffect.setdelay(25), "\n",

    "I'm also a space enthusiast, so much so that I create stars and galaxies all on my potato laptop.\n",
    TypeWriterEffect.wait(1500), "\nLet me show you a picture...\n\n", TypeWriterEffect.wait(1000),

    TypeWriterEffect.callback(insertSpaceImage, "universe_bg1.png"), "\n", TypeWriterEffect.wait(4000), "\n",

    TypeWriterEffect.setdelay(45),
    "Pretty isn't it? ", TypeWriterEffect.wait(1000), "I mean, its not perfect, but it's pretty.\n", TypeWriterEffect.setdelay(30),
    TypeWriterEffect.wait(1000), "I made that one in my C++ game engine. ", TypeWriterEffect.wait(1000), "There are others, even one in JavaScript but thats for another day.\n",
    TypeWriterEffect.wait(1000), "\n",

    "Aside from space, I also make SDF modelling, raytracing, and light transport demos, ", TypeWriterEffect.wait(700), "you know, ", TypeWriterEffect.wait(700), "applied mathematics stuff.\n"

];
