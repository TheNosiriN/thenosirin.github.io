function ContainedPage_Home(scheduler){
    this.setup = () => {
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
                    leavePage(
                        b.dataset.link ? pageClassesNamedMap[b.dataset.link] : b.href,
                        scheduler, GetCurrentTime()
                    );
                    b.style.pointerEvents = "none";
                    e.preventDefault();
                };
            });
        }

        animateText("title_text", "jumping_text", 2.0*0.1); // wavy text
        animateText("splash_text", "jumping_text", 2.0*0.1); // wavy text
        animateText("ref_demo", "rainbow_text", 0.05); // rainbow color text

        document.getElementById("menu_container").style.backgroundColor = `rgb(${
            BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255
        })`;

        scheduler.addEvent(1, () => {
            document.getElementById("main_page_container").style.backgroundColor = `rgb(
                ${DarkerBackgroundColor.x*255}, ${DarkerBackgroundColor.y*255}, ${DarkerBackgroundColor.z*255}
            )`;
        });
    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.getProps = () => {
        return { name: "home", html: "frontpage/home.html", css: "homepage", title: "Home" };
    }
}
