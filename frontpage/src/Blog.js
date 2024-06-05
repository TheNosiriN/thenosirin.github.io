
var ContentHtmlStr2 = `
<p>this is a bold test, this text should be <strong>bold</strong> and inline, oh and <a href="#">heres a link</a></p>
<hr>
<p><img src="http://placebear.com/200/200" alt="bears"></p>
`;
// <p>this is a bold test, this text should be <strong>bold</strong> and inline, oh and <a href="#">heres a link</a></p>
// <p>Heres another test <a href="#">and another link</a> <strong>and another bold</strong>, does it work?</p>



// from: https://github.com/showdownjs/showdown/issues/577
showdown.extension('highlight', function () {
    return [{
        type: "output",
        filter: function (text, converter, options) {
            var left = "<pre><code\\b[^>]*>",
            right = "</code></pre>",
            flags = "g";

            var replacement = function (wholeMatch, match, left, right) {
                var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
                left = left.slice(0, 18) + 'hljs ' + left.slice(18);
                if (lang && hljs.getLanguage(lang)) {
                    return left + hljs.highlight(match, {language: lang}).value + right;
                } else {
                    return left + hljs.highlightAuto(match).value + right;
                }
            };

            return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
        }
    }];
});


function ContainedPage_Blog(scheduler){
    var typer;
    var pagediv;
    var indexjson;
    var commentdiv;
    var mdConverter;
    var currentPostid;
    var readingDetails;

    function func_btn_rewind(){
        const counter = typer.counter;
        const wasplaying = typer.isPlaying;
        typer.reset();
        typer.play(counter-2);
        if (!wasplaying){ typer.stop(); }
    }
    function func_btn_play(){
        if (!typer)return;
        typer.play();
        if (!typer.isPlaying)return;
        document.getElementById("btn_play").style.display = "none";
        document.getElementById("btn_pause").style.display = "flex";
    }
    function func_btn_pause(e){
        if (!typer)return;
        typer.stop();
        if (typer.isPlaying)return;
        document.getElementById("btn_pause").style.display = "none";
        document.getElementById("btn_play").style.display = "flex";
    }
    function func_btn_foward(){
        const counter = typer.counter;
        const wasplaying = typer.isPlaying;
        typer.reset();
        typer.play(counter+2);
        if (!wasplaying){ typer.stop(); }
    }
    function func_btn_reset(){
        if (!typer)return;
        const wasplaying = typer.isPlaying;
        typer.reset();
        if (wasplaying){ typer.play(); }
    }
    function func_btn_setspeed(){
        let el = document.getElementById("reading_details_div");
        if (el.classList.contains("closed")){
            el.classList.remove("closed");
        }else{
            el.classList.add("closed");
        }
    }

    function resetBlogPage(){
        typer.reset();
        scheduler.clear();
        pagediv.innerHTML = "";
        commentdiv.innerHTML = "";
    }

    function LoadPageFile(postid, callback){
        const pageurl = `blog/${postid}/${postid}.md`;
        let p =  fetch(UTILS.getSitePath()+pageurl).then((r) => {
            if (r.ok) return r.text();
            throw new Error("Error: Failed to load blog page: "+pageurl);
        });
        if (callback){
            p.then((text) => callback(text)).catch(e => callback(e.message));
        }
        return p;
    }

    function PreprocessPage(postid, dom){
        // images
        let images = dom.getElementsByTagName("img");
        for (image of images){
            const src = image.src;
            const sitepath = UTILS.getSitePath();
            const srcsite = src.substring(0, sitepath.length);
            if (srcsite == sitepath){
                const srcfilepath = src.substring(sitepath.length);
                image.src = UTILS.getSitePath() + `blog/${postid}/${srcfilepath}`;
            }

            image.style.opacity = 0;
            image.style.maxWidth = "100%";
            image.style.height = "auto";
            image.style.display = "block";
            image.style.marginLeft = "auto";
            image.style.marginRight = "auto";
            image.style.marginTop = "2em";
            image.style.marginBottom = "2em";
            image.dataset.speed = 0.5;
            image.dataset.type = 7;
            image.dataset.grid = 1;
            image.dataset.startTime = -11;
            image.dataset.stopTime = -10;
            image.classList.add("animated_transition", "unselectable", "uninteractable");

            image.typeWriterCallback = (el) => {
                foreground.backgroundColor = BackgroundColor;
                const waitInt = setIntervalH(() => {
                    if (!el.complete){ return; }
                    el.dataset.startTime = GetCurrentRenderTime();
                    updateAnimatedRectDivs();
                    el.style.opacity = 1;
                    clearInterval(waitInt);
                }, 1);
                RefreshAnimatedRectDivs();
            };
        }

        // links
        let links = dom.getElementsByTagName("a");
        for (link of links){
            link.target = "_blank";
        }

        // code
        let codes = dom.getElementsByTagName("code");
        for (code of codes){
            if (!code.classList.contains("hljs"))continue;
            code.classList.add("pixel_borders");
            code.style.boxShadow = "none";
            code.style.padding = "0.5em";
        }
    }

    function BuildIndex(url, callback){
        fetch(UTILS.getSitePath()+url).then((r) => {
            if (r.ok) return r.json();
            throw new Error("Error: Failed to load blog page: "+pageurl);
        }).then((json) => {

            for (const [name, obj] of Object.entries(json)){
                obj.time = new Date(obj.time);
                obj.shortdate = obj.time.getDate()+' '+obj.time.toLocaleString('en-us', {month: "short"})+' '+obj.time.getFullYear();
            }
            callback(json);
        });
    }

    function enterBlogPage(promise, props, scheduler, time_entered){
        typer = new TypeWriterEffectHTML(pagediv, {
            typeDelay: readingDetails.speed,
            autowaits: {
                ',': 500, ':': 500, '.': 1000, '?': 1000, '!':1000,
                "H1": 1000, "H2": 1000,
                "IMG": 4000,
            },
            onFinished: func_btn_pause,
            onNodeInserted: (node, writer, nowait) => {
                if (nowait)return;

                const isInViewport = (node) => {
                    const rect = node.getBoundingClientRect();
                    return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
                };

                if (!isInViewport(node)){
                    func_btn_pause();
                    var interval = setIntervalH(() => {
                        if (!isInViewport(node))return;
                        func_btn_play();
                        clearInterval(interval);
                    }, 16);
                }
            }
        });

        const onerror = () => {
            let divs = document.querySelectorAll(".blogpage #page_cont, .blogpage #comment_cont");
            for (d of divs){ d.classList.remove("closed"); }
            let dom = new DOMParser().parseFromString(`<p>Cannot find "${currentPostid}" page in index file</p>`, "text/html").body;
            typer.autowaits = {};
            typer.setContent(dom);
            scheduler.addEvent(time_entered+2, () => {
                func_btn_play();
            });
        };

        if (!promise){
            onerror();
            return;
        }

        const sitepath = UTILS.getSitePath();
        var forediv = document.querySelector(".blogpage .title_div");
        if (props.titleImage.length){
            forediv.style.backgroundImage = `url(${sitepath}/blog/${props.id}/${props.titleImage})`;
        }else{
            forediv.style.backgroundImage = "none";
        }

        let backdiv = document.getElementById("blogpage_container");
        if (props.backgroundImage.length){
            backdiv.style.backgroundImage = `url(${sitepath}/blog/${props.id}/${props.backgroundImage})`;
        }else{
            backdiv.style.backgroundImage = "none";
        }

        promise.then((text) => {
            let divs = document.querySelectorAll(".blogpage #page_cont, .blogpage #comment_cont");
            for (d of divs){ d.classList.remove("closed"); }

            // use json props
            document.getElementById("title_text").innerText = props.title;
            if (props.id != "welcome"){
                document.getElementById("subtitle_text").innerText = props.subtitle.length ? props.subtitle : `${props.category}, ${props.shortdate}`;
            }

            // parse page text
            let dom = new DOMParser().parseFromString(mdConverter.makeHtml(text), "text/html").body;
            PreprocessPage(currentPostid, dom);
            typer.setContent(dom);

            scheduler.addEvent(time_entered+2, () => {
                func_btn_play();
            });

            // comments
            giscus = document.createElement("script");
            giscus.setAttribute("src", "https://giscus.app/client.js");
            giscus.setAttribute("data-repo", "TheNosiriN/thenosirin.github.io");
            giscus.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkzNzI2NTk4MTk=");
            giscus.setAttribute("data-category", "Announcements");
            giscus.setAttribute("data-category-id", "DIC_kwDOFjZWa84Cfy3L");
            giscus.setAttribute("data-mapping", "specific");
            giscus.setAttribute("data-term", props.title);
            giscus.setAttribute("data-strict", "0");
            giscus.setAttribute("data-reactions-enabled", "1");
            giscus.setAttribute("data-emit-metadata", "0");
            giscus.setAttribute("data-input-position", "top");
            giscus.setAttribute("data-theme", "noborder_gray");
            giscus.setAttribute("data-lang", "en");
            giscus.setAttribute("data-loading", "lazy");
            giscus.setAttribute("crossorigin", "anonymous");
            giscus.setAttribute("async", true);
            commentdiv.appendChild(giscus);
        }).catch(e => onerror());
    }

    function leaveBlogPage(postid, scheduler, time_entered, ispop=false){
        if (!indexjson)return;
        foreground.backgroundColor = DarkerBackgroundColor;

        // remove old page
        if (currentPostid){
            let divs = document.querySelectorAll(".blogpage #page_cont, .blogpage #comment_cont");
            for (d of divs){ d.classList.add("closed"); }
            if (typer){ func_btn_pause(); }
        }

        currentPostid = postid;
        const props = indexjson[currentPostid];
        var promise = null;
        if (props){
            promise = LoadPageFile(currentPostid);
        }

        scheduler.addEvent(time_entered + 0.25, (time) => {
            resetBlogPage();
            enterBlogPage(promise, props, scheduler, 0);

            let pageprops = new ContainedPage_Blog().getProps();
            pageprops.blog_postid = postid;

            let newurl = UTILS.getSitePath();
            newurl += "index" + (IS_LOCAL_HOST ? ".html" : "") + `?page=${pageprops.name}&post=${postid}`;

            if (!ispop){
                history.pushState(pageprops, "", newurl);
            }
        });
    }
    this.leaveBlogPage = leaveBlogPage;

    function BuildSearchFilterScores(query, list){
        var scores = {};
        const criteria = ["title", "subtitle", "shortdate", "author", "category", "id"];

        for (let i=0; i<list.length; ++i){
            const item = list[i];
            let score = 0;
            for (let j=0; j<criteria.length; ++j){
                if (item[criteria[j]].toUpperCase().indexOf(query) == -1)continue;
                score += criteria.length - j;
            }
            scores[item.id] = score;
        }

        return scores;
    }


    this.setup = () => {
        pagediv = document.querySelector("#post_page");
        commentdiv = document.querySelector("#comment_page");

        readingDetails = JSON.parse(window.localStorage.getItem("blog_readingDetails"));
        if (!readingDetails){
            readingDetails = {
                speed: 60000 / (238 * 5) // 238 is average reading speed for adults
            };
            window.localStorage.setItem("blog_readingDetails", JSON.stringify(readingDetails));
        }

        scheduler.addEvent(1.5, () => {
            foreground.backgroundColor = DarkerBackgroundColor;
        });

        // see this for options: https://github.com/showdownjs/showdown/wiki/Showdown-Options
        mdConverter = new showdown.Converter({
            extensions: ['highlight'],
            simpleLineBreaks: true,
            strikethrough: true,
            noHeaderId: true,
            // tables: true,
        });


        currentPostid = "welcome";
        const postParams = new URLSearchParams(window.location.search);
        currentPostid = postParams.has("post") ? postParams.get("post") : "welcome";

        BuildIndex("blog/index.json", (json) => {
            indexjson = json;

            const props = indexjson[currentPostid];
            var promise = null;
            if (props){
                promise = LoadPageFile(currentPostid);
            }

            enterBlogPage(promise, props, scheduler, GetCurrentTime());

            const setuplist = (list) => {
                let results = document.getElementById("search_results");
                results.innerHTML = "";
                list.forEach((item, i) => {
                    let div = document.createElement("div");
                    let link = document.createElement("a");
                    let txt = document.createElement("p");

                    txt.textContent = `${item.subtitle.length ? item.subtitle : item.category}, ${item.shortdate}`;
                    txt.style.width = "100%";
                    link.textContent = item.title;
                    link.href = UTILS.getSitePath() + `index${IS_LOCAL_HOST ? ".html" : ""}?page=blog&post=${item.id}`;
                    link.classList.add("text_link_highlight");
                    link.onclick = (e) => {
                        e.preventDefault();
                        if (item.id == currentPostid)return;
                        leaveBlogPage(item.id, scheduler, GetCurrentTime());
                    };
                    link.appendChild(txt);
                    div.appendChild(link);
                    results.appendChild(div);
                });
            };

            // setup search
            const defaultListSetup = () => {
                setuplist(Object.values(indexjson).sort((a,b) => {
                    return b.time - a.time;
                }));
            };
            defaultListSetup();

            let search = document.getElementById("search_bar");
            search.oninput = (e) => {
                if (!e.target.value || !e.target.value.length){
                    defaultListSetup();
                    return;
                }

                let list = Object.values(indexjson);
                let scores = BuildSearchFilterScores(e.target.value.toUpperCase(), list);

                list = list.filter((item) => scores[item.id] > 0);
                if (!list.length){ defaultListSetup(); }

                setuplist(list.sort((a,b) => {
                    return scores[b.id] - scores[a.id];
                }));
            };

        });


        document.getElementById("blogpage_container").style.backgroundColor = `rgb(
            ${DarkerBackgroundColor.x*255}, ${DarkerBackgroundColor.y*255}, ${DarkerBackgroundColor.z*255}
        )`;

        document.querySelectorAll(".blogpage .content_background").forEach((el) => {
            el.style.backgroundColor = `rgb(
                ${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255}
            )`;
        });

        document.querySelectorAll(".blogpage .animated_transition").forEach((div) => {
            div.style.pointerEvents = "all";
            div.dataset.grid = 1.0;
            div.dataset.type = 7;
            div.dataset.speed = 0.4;
            div.dataset.startTime = 0;
            div.dataset.stopTime = -10;
            div.dataset.paddingTop = -1;
            div.dataset.paddingLeft = -10;
            div.dataset.paddingBottom = -10;
            div.dataset.paddingRight = -1;
        });

        // configure nav buttons
        {
            let buttons = document.querySelectorAll(".blogpage .nav_buttons a");
            buttons.forEach((b) => {
                b.href = UTILS.getSitePath() + `index${IS_LOCAL_HOST ? ".html" : ""}?page=${b.dataset.link}`;
                b.onclick = (e) => {
                    leavePage(pageClassesNamedMap[b.dataset.link], scheduler, GetCurrentTime());
                    b.style.pointerEvents = "none";
                    e.preventDefault();
                };
            });
        }

        // configure playback buttons
        {
            let funcs = [
                func_btn_rewind,
                func_btn_play,
                func_btn_pause,
                func_btn_foward,
                func_btn_reset,
                func_btn_setspeed
            ];

            const setupLongClick = (e, func) => {
                var interval;
                e.onmousedown = () => { interval = setInterval(func, 16); }
                e.onmouseup = () => { clearInterval(interval); }
            };

            setupLongClick(document.getElementById("btn_rewind"), func_btn_rewind);
            document.getElementById("btn_play").onclick = func_btn_play;
            document.getElementById("btn_pause").onclick = func_btn_pause;
            setupLongClick(document.getElementById("btn_foward"), func_btn_foward);
            document.getElementById("btn_reset").onclick = func_btn_reset;
            document.getElementById("btn_setspeed").onclick = func_btn_setspeed;
        }

        // configure reading details
        {
            let num = document.getElementById("reading_speed_input");
            num.value = (60000/readingDetails.speed)/5;
            num.oninput = (e) => {
                if (!num.value || num.value==0)return;
                // milliseconds_per_minute / reading_speed * average_letters_in_a_word
                readingDetails.speed = 60000 / (num.value * 5);
                window.localStorage.setItem("blog_readingDetails", JSON.stringify(readingDetails));
                if (typer){
                    typer.stop();
                    typer.setdelay(readingDetails.speed);
                    typer.play();
                }
            };
        };
    }

    this.onresize = (width, height) => {
        const playback = document.getElementById("playback_cont");
        let parent;
        if (width <= 600){
            // parent = document.getElementById("main_page_container");
            parent = document.body;
        }else{
            parent = document.querySelector("#index_grid_div > div");
        }
        if (playback.parentElement !== parent){
            parent.appendChild(playback);
        }
    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.onexit = () => {
        foreground.backgroundColor = BackgroundColor;
        if (window.innerWidth <= 600){
            document.body.removeChild(document.getElementById("playback_cont"));
        }
    }

    this.getProps = () => {
        return { name: "blog", html: "frontpage/blog.html", css: "blogpage", title: "Blog" };
    }
}
