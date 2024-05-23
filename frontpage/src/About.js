function ContainedPage_About(){
    var universeVideo;
    function PreloadUniverseVideos(){
        const path = UTILS.getSitePath() + "img/videos/universe_ex1.mp4";
        universeVideo = document.createElement("video");
        universeVideo.src = path;
        universeVideo.preload = "auto";
        universeVideo.autoplay = true;
        universeVideo.loop = true;
        universeVideo.muted = true;
        universeVideo.style.opacity = 0;
        universeVideo.style.width = "100%";
        universeVideo.style.height = "auto";
        universeVideo.style.display = "block";
        universeVideo.style.marginLeft = "auto";
        universeVideo.style.marginRight = "auto";
        universeVideo.dataset.speed = 0.5;
        universeVideo.dataset.type = 7;
        universeVideo.dataset.grid = 1;
        universeVideo.dataset.startTime = -11;
        universeVideo.dataset.stopTime = -10;
    }


    function insertImage(args, writer){
        const path = UTILS.getSitePath() + "img/"+args;

        var image = document.createElement("img");
        image.src = path;
        image.style.opacity = 0;
        image.style.width = "100%";
        image.style.height = "auto";
        image.style.display = "block";
        image.style.marginLeft = "auto";
        image.style.marginRight = "auto";
        image.dataset.speed = 0.5;
        image.dataset.type = 7;
        image.dataset.grid = 1;
        image.dataset.startTime = -11;
        image.dataset.stopTime = -10;
        image.classList.add("animated_transition", "unselectable", "uninteractable");
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


    function insertUniverseVideo(args, writer){
        universeVideo.classList.add("animated_transition", "unselectable", "uninteractable");
        writer.element.appendChild(universeVideo);

        RefreshAnimatedRectDivs();
        writer.stop();

        universeVideo.addEventListener('play', () => {
            universeVideo.muted = true;
            universeVideo.dataset.startTime = foreground.toy.getTime();
            updateAnimatedRectDivs();
            universeVideo.style.opacity = 1;
            writer.play();
        });
    }


    const Content = [
        TypeWriterEffect.wait(3000),

        TypeWriterEffect.setdelay(45),
        "My name is Chinomso Nosiri, ", TypeWriterEffect.wait(1000), "I make cool stuff.\n",
        TypeWriterEffect.wait(700), "\n",

        TypeWriterEffect.setdelay(40),
        "I make pretty graphics, ", TypeWriterEffect.wait(500), "I make pretty games, ", TypeWriterEffect.wait(500), "I make pretty websites, ", TypeWriterEffect.wait(500), "and I make C++ look prettier than it already is.\n",
        TypeWriterEffect.wait(1500), "\n",

        "So basically I'm just a Programmer.\n",
        TypeWriterEffect.wait(2000), "\n",

        "I'm also a space enthusiast, so much so that I create stars and galaxies all on my potato laptop.\n",
        TypeWriterEffect.wait(1500), "\nLet me show you a quick video...\n\n", TypeWriterEffect.wait(1000),

        TypeWriterEffect.callback(insertUniverseVideo), "\n", TypeWriterEffect.wait(7000), "\n",
        TypeWriterEffect.setdelay(45),

        "Pretty isn't it? ", TypeWriterEffect.wait(1000), "I mean, its not perfect, but it's pretty and it's to scale.\n",
        TypeWriterEffect.wait(1000), "\n",

        TypeWriterEffect.setdelay(40),

        "I made that one in my C++ game engine. ", TypeWriterEffect.wait(1000), "There are others, even one in JavaScript but thats for another day.\n",
        TypeWriterEffect.wait(1000), "\n",

        "Aside from space, I also make SDF modelling, raytracing, and light transport demos, ", TypeWriterEffect.wait(700), "you know, ", TypeWriterEffect.wait(700), "applied mathematics stuff.\n\n",
        TypeWriterEffect.wait(4000),

        TypeWriterEffect.callback(insertImage, "graphics/lighthouse_pt.png"), "\n", TypeWriterEffect.wait(2000), "\n",

        "Just look at this beautiful picture! ", TypeWriterEffect.wait(1000), "That is not a 3D model, ", TypeWriterEffect.wait(700), "its a group of math functions combined to make that shape.\n",
        TypeWriterEffect.wait(1000), "\n",

        "This is the result of simulating how light interacts with an environment just like it does in real-life!",
    ];


    var typer = null;
    function StartPageContent(){
        typer = new TypeWriterEffect(document.getElementById("typed_content"), {
            content: Content,
            typeDelay: 33,
            onInserted: (lastchar, writer) => {
                if (lastchar != '\n')return;
                writer.element.parentElement.parentElement.scrollTop = writer.element.parentElement.parentElement.scrollHeight;
            }
        });
        typer.play();
    }


    this.setup = () => {
        PreloadUniverseVideos();
        StartPageContent();
    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.getProps = () => {
        return { name: "aboutme", html: "frontpage/about.html", css: "aboutpage", title: "About Me" };
    }
}
