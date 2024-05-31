function ContainedPage_About(scheduler){
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
        var path;
        if (args.substring(0, 4) == "http"){
            path = args;
        }else{
            path = UTILS.getSitePath() + "img/"+args;
        }

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

        image.onload = () => {
            image.dataset.startTime = GetCurrentRenderTime();
            updateAnimatedRectDivs();
            image.style.opacity = 1;
            writer.play();
        };

        image.onerror = () => {
            var sp = document.createElement("span");
            sp.style.color = "red";
            sp.innerHTML = "<br><strong>Failed to load image: "+args+"</strong><br>";
            writer.element.appendChild(sp);
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
            universeVideo.dataset.startTime = GetCurrentRenderTime();
            updateAnimatedRectDivs();
            universeVideo.style.opacity = 1;
            writer.play();
        });
    }


    const Content = [
        TypeWriterEffect.wait(3000),
        TypeWriterEffect.setdelay(50),

        "My name is Chinomso Nosiri, ", TypeWriterEffect.wait(1000), "I make cool stuff.\n",
        TypeWriterEffect.wait(700), "\n",

        // TypeWriterEffect.setdelay(45),

        "I make pretty graphics, ", TypeWriterEffect.wait(500), "I make pretty games, ", TypeWriterEffect.wait(500), "I make pretty websites, ", TypeWriterEffect.wait(500), "and I make C++ look prettier than it already is.\n",
        TypeWriterEffect.wait(1500), "\n",

        "So basically I'm a Programmer.\n",
        TypeWriterEffect.wait(2000), "\n",

        "I'm also a space enthusiast, so much so that I create stars and galaxies all on my potato laptop.\n",
        TypeWriterEffect.wait(1000), "\nLet me show you something...\n",
        TypeWriterEffect.wait(1000), "\n",

        TypeWriterEffect.wait(1000),
        TypeWriterEffect.callback(insertUniverseVideo), "\n", TypeWriterEffect.wait(7000), "\n",

        "Pretty isn't it? ", TypeWriterEffect.wait(1000), "I mean, its not perfect, but it's pretty and it's to scale.\n",
        TypeWriterEffect.wait(1000), "\n",

        "I made that one in my C++ game engine. ", TypeWriterEffect.wait(700), "There are others, even one in JavaScript, ", TypeWriterEffect.wait(700), "and another that's physically based, but thats coming soon.\n",
        TypeWriterEffect.wait(1000), "\n",

        "Aside from space, I also make SDF modelling, raytracing, and path tracing research demos, ", TypeWriterEffect.wait(700), "you know, ", TypeWriterEffect.wait(700), "applied mathematics stuff. ",
        TypeWriterEffect.wait(1000), "But thats me as a Graphics Programmer.\n", TypeWriterEffect.wait(1000), "\n\n",

        "I'm also a Full-stack developer. ", TypeWriterEffect.wait(1000), "I code for every part of a web service's pipeline, ", TypeWriterEffect.wait(700),
        "I've worked with C# servers, ", TypeWriterEffect.wait(700), "node.js servers, ", TypeWriterEffect.wait(700), "Typescript frontends, ", TypeWriterEffect.wait(700), `"This" SQL, "That" SQL... etc...\n`,
        TypeWriterEffect.wait(1000), "\n",

        "Theres just so much under web development, but not a lot of pretty pictures I can show here.\n",
        TypeWriterEffect.wait(1000), "\n\n",

        "Though some pretty pictures I can show are some from my Game Development days. ", TypeWriterEffect.wait(700), "Stuff like this...\n",
        TypeWriterEffect.wait(1000), "\n",

        TypeWriterEffect.callback(insertImage, "projects/playing with lasers.gif"), "\n", TypeWriterEffect.wait(7000), "\n",

        "I long time ago, I used to make games, ", TypeWriterEffect.wait(700), "compete in 48hr game jams, ", TypeWriterEffect.wait(700), "and create several unreleased demos, ", TypeWriterEffect.wait(700), "each having some new quirky game mechanic.\n",
        TypeWriterEffect.wait(1000), "But the ones I did release, I did them under the name GrayScale Games on ", TypeWriterEffect.setlink("https://grayscalegames.itch.io/", true), "itch.io", "\n",
        TypeWriterEffect.wait(1000), "\n",

        "I jumped from game engine to game engine, ", TypeWriterEffect.wait(700), "Gamemaker, Unity, Godot, Unreal, JMonkey, Babylon, etc... ", TypeWriterEffect.wait(1000), "But my favourite engine ever was Gamemaker Studio 1.4\n",
        TypeWriterEffect.wait(1000), "\n\n",

        "Theres a lot more to say, including how I got into programming in the first place... ", TypeWriterEffect.wait(700), "But I'll probably leave it for some auto biography page in my blog.\n",
        TypeWriterEffect.wait(1000), "\n",

        TypeWriterEffect.wait(1000),
        TypeWriterEffect.callback(insertImage, "projects/nebula.jpg"), "\n", TypeWriterEffect.wait(2000), "\n",

        "I'll stop typing here, ", TypeWriterEffect.wait(700), "and leave you with this nebula thing I rendered for my PBR universe.\n",
        TypeWriterEffect.wait(1000), "\n",

        "Thanks for reading, and please check out the rest of my site!",

        TypeWriterEffect.wait(3000), "\n\n\nPS - I actually do make all my projects on a potato", TypeWriterEffect.wait(700), ", literally.",

        TypeWriterEffect.wait(20000), "\n\n\nWhy are you still here? ", TypeWriterEffect.wait(700), "You don't know how to go back? ", TypeWriterEffect.wait(700), "Just press the back button to go to the homepage.",
        TypeWriterEffect.wait(20000), "\n\n\nStill here I guess... ", TypeWriterEffect.wait(700), "Or are you just reading all the stuff you missed? ", TypeWriterEffect.wait(700), "Ok, I'll let you read it.",
        TypeWriterEffect.wait(20000), "\n\n\nGET OFF THIS PAGE MAN, WHY ARE YOU STILL HERE??? ", TypeWriterEffect.wait(700), "Are you waiting for an easter egg? ", TypeWriterEffect.wait(700), "Sorry man theres no easter egg this time.",
        TypeWriterEffect.wait(10000), "\n\n\n...\n\n", TypeWriterEffect.wait(1000), "Bro... ", TypeWriterEffect.wait(1000), "Leave!!",
        TypeWriterEffect.wait(10000), "\n\n\nOk I got an easter egg for you...\n", TypeWriterEffect.wait(2000), "\n",
        TypeWriterEffect.callback(insertImage, "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWRsOG9kemJjOW1hdHA0cjR3YjV5a2o2d3VtZXgyZnFzY21rOWg2ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ju7l5y9osyymQ/giphy.gif"),
        TypeWriterEffect.wait(2000), "\n\n",
        "There, ", TypeWriterEffect.wait(700), "happy?",
        TypeWriterEffect.wait(10000), "\n\n\nOk this actually is the end, ", TypeWriterEffect.wait(700), "I'm done typing.\n", TypeWriterEffect.wait(700), "Please go check out other pages on my site.\n", TypeWriterEffect.wait(700), "\nBye"

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
