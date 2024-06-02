class ForegroundRectData {
    constructor(x, y, w, h, start, stop){
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 0;
        this.h = h || 0;
        this.start = start || -1;
        this.stop = stop || -1;
    }
}



class TimeoutHandler {
    constructor(){
        this.timeouts = [];
        this.intervals = [];
    }

    addTimeout(func, time){
        const lastIndex = this.timeouts.length;
        const id = setTimeout(() => {
            func();
            this.timeouts.splice(lastIndex, 1);
        }, time);
        this.timeouts.push(id);
        return id;
    }

    addInterval(func, time){
        const id = setInterval(func, time);
        this.intervals.push(id);
        return id;
    }

    clear(func, time){
        for (var i=0; i<this.timeouts.length; ++i){
            clearTimeout(this.timeouts.length);
        }
        for (var i=0; i<this.intervals.length; ++i){
            clearTimeout(this.intervals.length);
        }
    }
}

var timeoutHandler = new TimeoutHandler();
function setTimeoutH(func, time){
    return timeoutHandler.addTimeout(func, time);
}
function setIntervalH(func, time){
    return timeoutHandler.addInterval(func, time);
}



class TimeScheduler {
    constructor(){
        this.events = [];
        this.time = 0;
        this.firstDrawTime = 0;
    }

    nextEvent(){
        while (this.events.length > 0 && this.events[this.events.length-1].time <= this.time){
            this.events[this.events.length-1].callback(this.time);
            this.events.pop();
        }

        var now = Date.now();
        if (this.firstDrawTime == 0) {
            this.firstDrawTime = now;
        }

        var elapsed = now - this.firstDrawTime;
        this.time = elapsed * 0.001;
    }

    addEvent(time, callback){
        this.events.push({time: time, callback: callback});
        this.events.sort((a, b) => b.time - a.time);
    }

    addEventNoSort(time, callback){
        this.events.push({time: time, callback: callback});
    }

    addEvents(array){
        this.events = this.events.concat(array);
        this.events.sort((a, b) => a.time - b.time);
    }

    setTime(t){
        this.time = t;
    }

    clear(){
        this.events = [];
    }

    reset(){
        this.clear();
        this.time = 0;
        this.firstDrawTime = 0;
    }
}





function AddDebugBorders(element, level=0){
    const colors = ["red", "blue", "lime"];
    element.style.border = `2px ${colors[level % colors.length]} solid`;
    for (const child of element.children) {
        // if (child.tagName != "DIV")continue;
        AddDebugBorders(child, level+1);
    }
}


function animateText(id, animation_class, delay){
    let el = document.getElementById(id);
    el.innerHTML = el.innerHTML.split("").map(letter => {
        return "<span>" + letter + "</span>";
    }).join("");
    Array.from(el.children).forEach((span, index) => {
        span.classList.add(animation_class);
        span.style.animationDelay = `${index*delay+1}s`;
    });
}


function ResolveHtmlAppends(element) {
    const path = element.getAttribute("append-html");
    if (path){
        fetch(UTILS.getSitePath()+path).then(response => response.text()).then((html) => {
            element.innerHTML += html;
            Array.from(element.children).forEach(c => ResolveHtmlAppends(c));
        });
    }else{
        Array.from(element.children).forEach(c => ResolveHtmlAppends(c));
    }

}



var main_scheduler;
var page_scheduler;
var rect_array_list;
var rect_div_list;
var rect_buffer_extra = 0;
var currentPage;
var pageClasses;
var pageClassesMap;
var pageClassesNamedMap;
var timeoutObj;
var rendertimeout = 8;


function GetCurrentTime(){
    return page_scheduler ? page_scheduler.time : 0;
}

function GetCurrentRenderTime(){
    return foreground.toy.getTime();
}

function GetCurrentMainTime(){
    return main_scheduler ? main_scheduler.time : 0;
}

function LoadPageClasses(array, callback){
    pageClassesMap = {};
    var promises = [];
    var names = [];

    for (PageClass of array){
        const props = new PageClass().getProps();
        promises.push(fetch(props.html).then(response => response.text()));
        names.push(props.name);
    }

    Promise.all(promises).then((data) => {
        for (let i=0; i<data.length; ++i){
            pageClassesMap[names[i]] = data[i];
        }
        callback();
    });
}

function ResetPageResources(){
    rect_buffer_extra = 0;
    timeoutHandler.clear();
    if (foreground.toy){ foreground.toy.reset(); }
    if (main_scheduler){ main_scheduler.reset(); }
    if (page_scheduler){ page_scheduler.reset(); }

    var mainpage = document.getElementById("main_page_container");
    mainpage.innerHTML = "";
    if (currentPage){
        mainpage.classList.remove(currentPage.getProps().css);
    }
}

function PixelPageHeader(){
    SetupForegroundRenderer();
    ResetPageResources();
    foreground.backgroundColor = BackgroundColor;
}

function LoadContainedPage(PageClass, foreground_available){
    page_scheduler = new TimeScheduler();

    const bg = `rgb(${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255})`;
    var mainpage = document.getElementById("main_page_container");
    mainpage.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    mainpage.style.opacity = 0;
    page_scheduler.addEvent(1, () => {
        mainpage.style.opacity = 1;
    });

    currentPage = new PageClass(page_scheduler);
    const props = currentPage.getProps();
    mainpage.innerHTML = pageClassesMap[props.name];
    mainpage.classList.add(props.css);
    ResolveHtmlAppends(mainpage);
    document.title = props.title + " - Portfolio site ver. 2";

    currentPage.setup();
    RefreshAnimatedRectDivs();
    if (props.name != "frontpage"){
        enterPage(page_scheduler, GetCurrentTime());
    }

    const updateWithFrame = () => {
        currentPage.update();
        main_scheduler.nextEvent();
        updateAnimatedRectDivs();
        requestAnimationFrame(updateWithFrame);
    };
    updateWithFrame();
}

function historyStateCallback(e, ispop){
    const pageParams = new URLSearchParams(window.location.search);
    let name = "";
    if (!e.state || !e.state.name){
        name = pageParams.has("page") ? pageParams.get("page") : "";
    }else{
        name = e.state.name;
    }
    if (!pageClassesNamedMap[name])return;

    if (pageParams.has("post") && currentPage && currentPage.getProps().name=="blog" && name=="blog"){
        currentPage.leaveBlogPage(pageParams.get("post"), page_scheduler, GetCurrentTime(), ispop);
    }else{
        leavePage(pageClassesNamedMap[name], main_scheduler, GetCurrentMainTime(), "", ispop);
    }
}

function leavePage(PageClass, scheduler, time_entered, searchqueries="", ispop=false){
    foreground.backgroundColor = BackgroundColor;
    document.getElementById("main_page_container").style.pointerEvents = "none";

    var div = document.getElementById("page_transition");
    div.style.display = "block";
    div.dataset.type = 4;
    div.dataset.startTime = 0;
    div.dataset.stopTime = GetCurrentRenderTime();
    div.dataset.speed = 0.75;
    div.style.opacity = 0;
    if (currentPage.onexit){ currentPage.onexit(); }
    if (currentPage){ page_scheduler.clear(); }

    scheduler.addEvent(time_entered+1, (time) => {
        if (typeof PageClass === "string"){
            if (PageClass.length > 0){
                window.location.href = PageClass;
            }
            ResetPageResources();
            return;
        }
        ResetPageResources();

        if (!ispop){
            const props = new PageClass().getProps();
            var newurl = UTILS.getSitePath();
            if (props.name != "frontpage"){
                newurl += `index${IS_LOCAL_HOST ? ".html" : ""}?page=${props.name}`;
                newurl += searchqueries.length ? ("&"+searchqueries) : "";
            }
            history.pushState(props, "", newurl);
        }

        LoadContainedPage(PageClass, true);
    });
}

function enterPage(scheduler, time_entered){
    document.getElementById("main_page_container").style.pointerEvents = "auto";
    let div = document.getElementById("page_transition");
    div.style.display = "block";
    div.style.opacity = 1;
    div.style.backgroundColor = `rgb(${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255})`;
    div.dataset.type = 5;
    div.dataset.startTime = time_entered;
    div.dataset.stopTime = -10;
    div.dataset.speed = 0.75;
    scheduler.addEventNoSort(time_entered+0.75, () => {
        div.style.opacity = 0;
    });
    scheduler.addEvent(time_entered+2, (time) => {
        div.style.display = "none";
    });
}



function RefreshAnimatedRectDivs(){
    rect_div_list = document.getElementsByClassName("animated_transition");
    const total_length = rect_div_list.length + rect_buffer_extra;
    rect_array_list = [];
    for (var i=0; i<total_length; rect_array_list.push(new ForegroundRectData()), ++i);

    const gl = foreground.gl;
    gl.finish();
    gl.bindBuffer(gl.ARRAY_BUFFER, rects_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, RectBufferStride * RectVertexCount * total_length, gl.DYNAMIC_DRAW);
    foreground.toy.setDrawCount(rect_div_list.length * RectVertexCount);

    if (timeoutObj){ clearTimeout(timeoutObj); }
    for (var i=0; i<rect_div_list.length; ++i){
        const div_rect = rect_div_list[i].getBoundingClientRect();
        updateRectData(rect_div_list[i], div_rect, rect_array_list[i], i);
    }
}

function SetExtraRects(amount){
    rect_buffer_extra = amount;
}

function SetRenderTimout(t){
    rendertimeout = t;
}

function updateRectData(div, div_rect, stored_rect, offset_index){
    const gl = foreground.gl;
    stored_rect.x = div_rect.x;
    stored_rect.y = div_rect.y;
    stored_rect.w = div_rect.width;
    stored_rect.h = div_rect.height;
    stored_rect.start = div.dataset.startTime;
    stored_rect.stop = div.dataset.stopTime;
    gl.bindBuffer(gl.ARRAY_BUFFER, rects_buffer);
    gl.bufferSubData(
        gl.ARRAY_BUFFER, RectBufferStride * RectVertexCount * offset_index,
        makeRectVerts(
            stored_rect,
            div.dataset.startTime || -1,
            div.dataset.stopTime || -1,
            div.dataset.speed || 1,
            div.dataset.type || 0,
            div.dataset.grid || 1,
            parseFloat(div.dataset.paddingTop || div.dataset.padding || -1),
            parseFloat(div.dataset.paddingLeft || div.dataset.padding || -1),
            parseFloat(div.dataset.paddingBottom || div.dataset.padding || -1),
            parseFloat(div.dataset.paddingRight || div.dataset.padding || -1),
        )
    );
}

function checkRectData(div, div_rect, stored_rect){
    const dimupdate = (
        div_rect.x != stored_rect.x ||
        div_rect.y != stored_rect.y ||
        div_rect.width != stored_rect.w ||
        div_rect.height != stored_rect.h
    );
    const movupdate = (
        div.dataset.startTime != stored_rect.start ||
        div.dataset.stopTime != stored_rect.stop
    );
    return [dimupdate || movupdate, movupdate];
}

function updateAnimatedRectDivs(){
    const time = foreground.toy.getTime();
    var ctimeout = time;
    var update_from_moving = false;

    for (var i=0; i<rect_div_list.length; ++i){
        const div_rect = rect_div_list[i].getBoundingClientRect();
        const [total, ismove] = checkRectData(rect_div_list[i], div_rect, rect_array_list[i]);
        if (!total)continue;
        updateRectData(rect_div_list[i], div_rect, rect_array_list[i], i, ismove);
        update_from_moving = update_from_moving || ismove;
        if (update_from_moving){
            ctimeout = Math.max(Math.max(ctimeout, rect_div_list[i].dataset.startTime), rect_div_list[i].dataset.stopTime);
        }
    }

    if (update_from_moving){
        if (timeoutObj){ clearTimeout(timeoutObj); }
        ctimeout -= time;
        timeoutObj = setTimeoutH(() => {
            foreground.toy.pause();
            console.log("paused rendering");
            foreground.gl.clear(foreground.gl.COLOR_BUFFER_BIT);
        }, (ctimeout + rendertimeout) * 1000);
        if (!foreground.toy.getIsPlaying()){ foreground.toy.play(); }
    }
}
