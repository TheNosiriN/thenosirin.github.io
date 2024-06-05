function ContainedPage_Frontpage(scheduler){
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
        scheduler.addEvent(9.5, (time) => {
            leavePage(ContainedPage_Home, main_scheduler, GetCurrentMainTime());
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
    ContainedPage_Work,
    ContainedPage_Blog
];
pageClassesNamedMap = {};
for (var i=0; i<pageClasses.length; ++i){
    const PageClass = pageClasses[i];
    pageClassesNamedMap[new PageClass().getProps().name] = PageClass;
}



function StartPortfolioSite(){
    var PageClass = ContainedPage_Frontpage;
    const pageParams = new URLSearchParams(window.location.search);
    if (pageParams.has("page")){
        PageClass = pageClassesNamedMap[pageParams.get("page")];
    }

    main_scheduler = new TimeScheduler();

    if (SHOW_DEBUG_BORDERS){
        // main_scheduler.addEvent(5, () => AddDebugBorders(mainpage));
        document.addEventListener("keypress", (event) => {
            if (event.key === "D") {
                AddDebugBorders(document.getElementById("main_page_container"));
            }
        });
    }

    LoadPageClasses(pageClasses, () => {
        StartForegroundRenderer(() => {
            ResetPageResources();
            LoadContainedPage(PageClass, true);
            UpdateWithFrame();
        }, () => {
            ResetPageResources();
            LoadContainedPage(PageClass, false);
            UpdateWithFrame();
        });
    });
}



window.addEventListener("pushstate", (e) => {
    historyStateCallback(e, false);
});
window.addEventListener("popstate", (e) => {
    historyStateCallback(e, true);
});

window.addEventListener("resize", resizeCallback);

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", StartPortfolioSite);
} else {
    // `DOMContentLoaded` has already fired
    StartPortfolioSite();
}
