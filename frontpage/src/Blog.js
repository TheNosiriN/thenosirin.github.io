
function insertImage(args, writer){
    const path = UTILS.getSitePath() + "" + args;

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
        image.dataset.startTime = foreground.toy.getTime();
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

function ParsePageFile(id, text, props={}){
    var content = [];
    var ptr = 0;

    props.wait_fullstop = props.wait_fullstop || 0;
    props.wait_comma = props.wait_comma || 0;

    const getCommandStr = () => {
        var cmd = "";
        var value = "";
        var isvalue = false;
        for (; ptr<text.length;){
            const char = text.charAt(ptr);
            ptr += 1;
            if (char == ']'){   // end of command
                isvalue = false;
                break;
            }
            if (char == '='){   // command has a value
                isvalue = true;
                continue;
            }
            if (!isvalue && (char == '\n' || char == '\t')){   // error case
                cmd = "";
                break;
            }
            if (isvalue){
                value += char;
            }else{
                cmd += char;
            }
        }

        return [cmd.trim(), value.trim()];
    };

    const addCommand = (cmd, value) => {
        if (cmd.length == 0){   // error
            console.error("Error when parsing page file: "); // TODO: print the line or around the area where the error is
            return;
        }

        switch (cmd) {
            case "bold": {
                content.push(TypeWriterEffect.setelement(document.createElement("strong")));
                if (value.length > 0)content.push(value);
            } break;
            case "wait": content.push(TypeWriterEffect.wait(parseFloat(value))); break;
            case "image": content.push(TypeWriterEffect.callback(insertImage, `blog/${id}/${value}`)); break;
            case ".": content.push(".", TypeWriterEffect.wait(props.wait_fullstop)); break;
            case ",": content.push(",", TypeWriterEffect.wait(props.wait_comma)); break;
            default: console.error(`Error command "${cmd}" not found`); break;
        }
    };

    for (var line = ""; ptr<text.length;){
        const char = text.charAt(ptr);
        ptr += 1;

        if (char == '[' && text.charAt(ptr) == '!'){
            ptr += 1;
            if (line.length > 0){
                content.push(`${line}`);
                line = "";
            }
            const [cmd, value] = getCommandStr();
            addCommand(cmd, value);
            continue;
        }

        if (char == '\n' && line.length > 0){
            content.push(`${line+char}`);
            line = "";
            continue;
        }

        line += char;
    }

    // if content was empty after the loop, or last char was a regular char then the line it was not pushed
    if (content.length == 0 || text.charAt(ptr) == '\n'){
        content.push(`${line}`);
    }

    return content;
}


var ContentHtmlStr = `
<h1 id="sample-markdown">Sample Markdown</h1>
<p>This is some basic, sample markdown.</p>
<h2 id="second-heading">Second Heading</h2>
<ul>
<li>Unordered lists, and:<ol>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ol>
</li>
<li>More</li>
</ul>
<blockquote>
<p>Blockquote</p>
</blockquote>
<p>And <strong>bold</strong>, <em>italics</em>, and even <em>italics and later <strong>bold</strong></em>. Even <del>strikethrough</del>. <a href="https://markdowntohtml.com">A link</a> to somewhere.</p>
<p>And code highlighting:</p>
<pre><code class="lang-js"><span class="hljs-keyword">var</span> foo = <span class="hljs-string">'bar'</span>;

<span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">baz</span><span class="hljs-params">(s)</span> </span>{
    <span class="hljs-keyword">return</span> foo + <span class="hljs-string">':'</span> + s;
}
</code></pre>
<p>Or inline code like <code>var foo = &#39;bar&#39;;</code>.</p>
<p>Or an image of bears</p>
<p><img src="http://placebear.com/200/200" alt="bears"></p>
<p>The end ...</p>
`;

var ContentHtmlStr2 = `
<p>this is a bold test, this text should be <strong>bold</strong> and inline, oh and <a href="#">heres a link</a></p>
<hr>
<p><img src="http://placebear.com/200/200" alt="bears"></p>
`;
// <p>this is a bold test, this text should be <strong>bold</strong> and inline, oh and <a href="#">heres a link</a></p>
// <p>Heres another test <a href="#">and another link</a> <strong>and another bold</strong>, does it work?</p>

var ContentHtmlStr3 = `
<ul>
<li>Unordered lists, and:
<ol>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ol>
</li>
<li>More</li>
</ul>
`;


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
    var mdConverter;
    var currentPostid;

    function resetBlogPage(){
        typer.reset();
        scheduler.clear();
        pagediv.innerHTML = ""; // idk if images will be removed too
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

    function PostprocessPage(postid, dom){
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
            image.dataset.speed = 0.5;
            image.dataset.type = 7;
            image.dataset.grid = 1;
            image.dataset.startTime = -11;
            image.dataset.stopTime = -10;
            image.classList.add("animated_transition", "unselectable", "uninteractable");

            image.typeWriterCallback = (el) => {
                typer.stop();
                const waitInt = setIntervalH(() => {
                    if (!el.complete){ return; }
                    typer.play();
                    el.dataset.startTime = GetCurrentTime();
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

    function enterBlogPage(promise, scheduler, time_entered){
        // load new page
        const props = indexjson[currentPostid];
        if (!props){
            var dom = new DOMParser().parseFromString(`<p>Cannot find "${currentPostid}" page in index.json file</p>`, "text/html").body;
            typer.setContent(dom);
            typer.play();
            return;
        }

        const sitepath = UTILS.getSitePath();
        let forediv = document.querySelector(".blogpage .title_div");
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
            var transition = document.querySelector(".blogpage #page_cont>.animated_transition");
            transition.style.display = "block";
            transition.dataset.speed = 0.5;
            transition.dataset.startTime = time_entered;
            transition.dataset.stopTime = -10;
            updateAnimatedRectDivs();

            // (rect_height * speed) / (32 milliseconds_per_frame)
            const time_to_go = (transition.getBoundingClientRect().height/transition.dataset.speed) * 0.0001 * 24;
            scheduler.addEvent(time_entered + time_to_go, () => {
                foreground.backgroundColor = BackgroundColor;
                transition.style.display = "none";
            });

            // use json props
            document.getElementById("title_text").innerText = props.title;
            document.getElementById("subtitle_text").innerText = props.subtitle.length ? props.subtitle : "---";

            // parse page text
            let dom = new DOMParser().parseFromString(mdConverter.makeHtml(text), "text/html").body;
            PostprocessPage(currentPostid, dom);

            // play
            typer.setContent(dom);
            scheduler.addEvent(time_entered+3, () => {
                typer.play();
            });
        });
    }

    function leaveBlogPage(postid, scheduler, time_entered, ispop=false){
        if (!indexjson)return;

        let time_to_go = 0;
        scheduler.clear();

        // remove old page
        if (currentPostid){
            foreground.backgroundColor = DarkerBackgroundColor;
            let transition = document.querySelector(".blogpage #page_cont>.animated_transition");
            transition.style.display = "block";
            transition.dataset.speed = 0.75;
            transition.dataset.startTime = -10;
            transition.dataset.stopTime = time_entered;
            updateAnimatedRectDivs();
            if (typer){ typer.stop(); }
            // (rect_height * speed) / (32 milliseconds_per_frame)
            time_to_go = (transition.getBoundingClientRect().height/transition.dataset.speed) * 0.0001 * 24;
        }

        currentPostid = postid;
        var promise = LoadPageFile(currentPostid);

        scheduler.addEvent(time_entered + time_to_go, (time) => {
            resetBlogPage();
            enterBlogPage(promise, scheduler, time);

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
        document.querySelectorAll(".blogpage .content_background").forEach((el) => {
            el.style.backgroundColor = `rgb(
                ${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255}
            )`;
            el.style.position = "relative";

            const border_width = "24";
            var div = document.createElement("div");
            div.classList.add("animated_transition");
            div.style.position = "absolute";
            div.style.height = `calc(100% + ${border_width}px * 2)`;
            div.style.width = `calc(100% + ${border_width}px * 2)`;
            div.style.left = `-${border_width}px`;
            div.style.top = `-${border_width}px`;
            div.style.pointerEvents = "none";
            div.dataset.grid = 1.0;
            div.dataset.type = 7;
            div.dataset.paddingTop = -1;
            div.dataset.paddingLeft = -10;
            div.dataset.paddingBottom = -10;
            div.dataset.paddingRight = -1;
            el.appendChild(div);
        }); {
            let transition = document.querySelector(".blogpage #index_cont>.animated_transition");
            transition.dataset.speed = 0.4;
            transition.dataset.startTime = 0;
            transition.dataset.stopTime = -10;

            // (rect_height / speed) / (32 milliseconds_per_frame)
            scheduler.addEvent((transition.getBoundingClientRect().height/transition.dataset.speed) * 0.0001 * 24, () => {
                foreground.backgroundColor = BackgroundColor;
                document.querySelector(".blogpage #index_cont>.animated_transition").style.display = "none";
            });
        }
        RefreshAnimatedRectDivs();

        scheduler.addEvent(1, () => {
            document.getElementById("main_page_container").style.backgroundColor = `rgb(
                ${DarkerBackgroundColor.x*255}, ${DarkerBackgroundColor.y*255}, ${DarkerBackgroundColor.z*255}
            )`;
        });
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
        pagediv = document.querySelector("#post_page");
        typer = new TypeWriterEffectHTML(pagediv, {
            typeDelay: 45,
            autowaits: {
                ',': 500, '.': 850, ':': 500,
                "H1": 500, "H2": 500,
                "IMG": 2000,
            }
        });

        currentPostid = "welcome";
        const postParams = new URLSearchParams(window.location.search);
        currentPostid = postParams.has("post") ? postParams.get("post") : "welcome";

        BuildIndex("blog/index.json", (json) => {
            indexjson = json;
            enterBlogPage(LoadPageFile(currentPostid), scheduler, GetCurrentTime());

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
                    link.onclick = (e) => {
                        e.preventDefault();
                        if (item.id == currentPostid)return;
                        leaveBlogPage(item.id, scheduler, GetCurrentTime());
                    };
                    div.appendChild(link);
                    link.appendChild(txt);
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

    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.onexit = () => {
        foreground.backgroundColor = BackgroundColor;
    }

    this.getProps = () => {
        return { name: "blog", html: "frontpage/blog.html", css: "blogpage", title: "Blog" };
    }
}
