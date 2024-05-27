function ContainedPage_Projects(scheduler){
    var center_cont;
    function addProject(url, newtab, image_url, title){
        var link = document.createElement("a");
        link.classList.add("projects_entry", "pixel_borders");
        link.style.backgroundImage = `url(${image_url})`;
        if (newtab){
            link.href = url;
            link.target = "_blank";
        }else{
            link.href = UTILS.getSitePath() + `index${IS_LOCAL_HOST ? ".html" : ""}?page=${new ContainedPage_Blog().getProps().name}&post=${url}`;
            link.onclick = (e) => {
                e.preventDefault();
                leavePage(ContainedPage_Blog, scheduler, GetCurrentTime(), `post=${url}`);
            }
        }
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

    this.setup = () => {
        center_cont = document.getElementsByClassName('center_container')[0];

        addProject("universe1", false, "../img/projects/universe_bg2.jpg", "The Universe ver. 1");
        addProject("babylon_planets", false, "../img/projects/babylonjs_planets1.jpeg", "Babylon.JS Planets");
        addProject("https://www.shadertoy.com/user/TheNosiriN", true, "../img/projects/shadertoy_pt5.png", "Shadertoy");
        addProject("marchingcubes", false, "../img/projects/marching_cubes1.png", "Iso Surface Extraction");
        addProject("https://grayscalegames.itch.io/", true, "../img/projects/pnp_game_1.png", "Gamedev Projects");
        addProject("universe2", false, "", "The Universe ver. 2");

        animateText("title_text", "jumping_text", 0.25);
    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.getProps = () => {
        return { name: "projects", html: "frontpage/projects.html", css: "projectspage", title: "Projects" };
    }
}
