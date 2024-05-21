function ContainedPage_Frontpage(){
    function setupWelcomeScheduledAnimation(){
        var welcome = document.getElementById("welcome_message");
        welcome.innerHTML = WelcomeMessages[Math.floor(Math.random()*WelcomeMessages.length)];

        var title_text = document.getElementById("title_text_div");
        var mainpage = document.getElementById("main_page_container");
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
            activate(title_text.children[0], time, 4.5);
            title_text.children[0].dataset.startTime = -10;
            title_text.children[0].style.opacity = 1;
        });

        // hide everything in the in-between
        scheduler.addEventNoSort(1+4.5+(1.0/title_text.children[0].dataset.speed), (time) => {
            mainpage.style.opacity = 0;
        });

        // from name to text
        scheduler.addEventNoSort(7, (time) => {
            deactivate(title_text.children[0]);
            activate(title_text.children[1], time, 10);
        });

        // unhide everything just after the rect for the text has been updated
        scheduler.addEventNoSort(7.1, (time) => {
            mainpage.style.opacity = 1;
        });

        // from text to transition
        scheduler.addEvent(10, (time) => {
            leavePage(ContainedPage_Home, scheduler, time);
        });
    }


    this.setup = () => {
        setupWelcomeScheduledAnimation();
    };

    this.update = () => {
        scheduler.nextEvent();
    };

    this.getProps = () => {
        return { name: "frontpage", html: "frontpage/frontpage.html", css: "frontpage", title: "Chinomso Nosiri" };
    }
}



PixelPageHeader();

pageClasses = [
    ContainedPage_Frontpage,
    ContainedPage_Home,
    ContainedPage_Projects,
    ContainedPage_About,
    ContainedPage_Contact,
    ContainedPage_Work
];
pageClassesNamedMap = {};
for (var i=0; i<pageClasses.length; ++i){
    const PageClass = pageClasses[i];
    pageClassesNamedMap[new PageClass().getProps().name] = PageClass;
}



window.addEventListener("beforeunload", (e) => {
    leavePage("", scheduler, foreground.toy.getTime());
});
window.addEventListener("pushstate", (e) => {
    if (!e.state.name)return;
    if (!pageClassesNamedMap[e.state.name])return;
    leavePage(pageClassesNamedMap[e.state.name], scheduler, foreground.toy.getTime());
});
window.addEventListener("popstate", (e) => {
    if (!e.state.name)return;
    if (!pageClassesNamedMap[e.state.name])return;
    leavePage(pageClassesNamedMap[e.state.name], scheduler, foreground.toy.getTime());
});

window.addEventListener("DOMContentLoaded", () => {
    var PageClass = ContainedPage_Frontpage;
    const pageParams = new URLSearchParams(window.location.search);
    if (pageParams.has("page")){
        PageClass = pageClassesNamedMap[pageParams.get("page")];
    }

    LoadPageClasses(pageClasses, () => {
        StartForegroundRenderer(() => {
            ResetPageResources();
            LoadContainedPage(PageClass, true);
        }, () => {
            ResetPageResources();
            LoadContainedPage(PageClass, false);
        });
    });
});
