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
        this.iter = 0;
        this.firstDrawTime = 0;
    }

    nextEvent(){
        while (this.iter < this.events.length && this.events[this.iter].time <= this.time){
            this.events[this.iter].callback(this.time);
            this.iter++;
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
        this.events.sort((a, b) => a.time - b.time);
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
}



class TypeWriterEffect {
    constructor(element, options){
        this.content = options.content || [""];
        this.typeDelay = options.typeDelay || 50;
        this.onFinished = options.onFinished;
        this.onInserted = options.onInserted;

        this.index = 0;
        this.pos = 0;
        this.isPlaying = false;
        this.insertTemp = false;
        this.tempElement = null;

        this.element = element;
        this.element.innerHTML = "";
    }

    play(){
        this.isPlaying = true;

        const write = () => {
            if (!this.isPlaying) return;

            if (this.index >= this.content.length) {
                this.stop();
                if (this.onFinished) { this.onFinished(this); }
                return;
            }

            const txt = this.content[this.index];

            if (typeof txt === "string") {
                if (this.pos < txt.length) {
                    const char = txt.charAt(this.pos);
                    const span = document.createElement('span');
                    span.innerHTML = (char == '\n') ? "<br>" : char;
                    if (this.insertTemp){
                        this.tempElement.appendChild(span);
                    }else{
                        this.element.appendChild(span);
                    }
                    this.pos++;
                    if (this.onInserted) { this.onInserted(char, this); }
                } else {
                    this.index++;
                    this.pos = 0;
                    this.insertTemp = false;
                }
            } else {
                switch (txt.type) {
                    case 1: // Wait
                    this.stop();
                    setTimeoutH(() => {
                        this.index++;
                        this.play();
                    }, txt.time);
                    return;
                    case 2: // Set delay
                    this.typeDelay = txt.time;
                    this.index++;
                    break;
                    case 3: // Callback
                    txt.func(txt.args, this);
                    this.index++;
                    break;
                    case 4: // Links
                    this.insertTemp = true;
                    this.tempElement = txt.element || document.createElement("a");
                    this.tempElement.href = txt.url;
                    this.tempElement.target = txt.newtab ? "_blank" : "_self";
                    this.element.appendChild(this.tempElement);
                    this.index++;
                    break;
                }
            }
        };

        this.interval = setIntervalH(write, this.typeDelay);
    }

    stop(){
        this.isPlaying = false;
        clearInterval(this.interval);
    }

    getIndex(){
        return this.index;
    }

    static wait(t){
        return {type: 1, time:t};
    }
    static setdelay(t){
        return {type: 2, time:t};
    }
    static callback(f, a){
        return {type: 3, func:f, args:a};
    }
    static setlink(url, newtab, element){
        return {type: 4, url:url, newtab:newtab, element:element};
    }
}





function AddDebugBorders(element, level=0){
    const colors = ["red", "blue", "lime"];
    element.style.border = "2.5px solid";
    element.style.borderColor = colors[level % colors.length];
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



var scheduler;
var rect_array_list;
var rect_div_list;
var currentPage;
var pageClasses;
var pageClassesMap;
var pageClassesNamedMap;


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
    timeoutHandler.clear();

    var mainpage = document.getElementById("main_page_container");
    mainpage.innerHTML = "";
    if (currentPage){
        mainpage.classList.remove(currentPage.getProps().css);
    }
}

function PixelPageHeader(){
    SetupForegroundRenderer();
    ResetPageResources();
}

function LoadContainedPage(PageClass, foreground_available){
    scheduler = new TimeScheduler();

    const bg = `rgb(${BackgroundColor.x*255}, ${BackgroundColor.y*255}, ${BackgroundColor.z*255})`;
    var mainpage = document.getElementById("main_page_container");
    mainpage.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    mainpage.style.opacity = 0;
    scheduler.addEvent(1, () => {
        mainpage.style.opacity = 1;
    });

    currentPage = new PageClass();
    const props = currentPage.getProps();
    mainpage.innerHTML = pageClassesMap[props.name];
    mainpage.classList.add(props.css);
    document.title = props.title + " - Portfolio site ver. 2";

    currentPage.setup();
    RefreshAnimatedRectDivs();
    setIntervalH(updateAnimatedRectDivs, 8);
    if (props.name != "frontpage"){
        enterPage(scheduler, foreground.toy.getTime());
    }

    if (foreground_available){
        foreground.toy.setOnDraw(() => {
            if (foreground.toy){
                scheduler.setTime(foreground.toy.getTime());
            }
            currentPage.update();
        });
    }else{
        const updateWithFrame = () => {
            currentPage.update();
            requestAnimationFrame(updateWithFrame);
        };
    }

    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(mainpage);
    }
}

function leavePage(PageClass, scheduler, time_entered){
    var div = document.getElementById("page_transition");
    div.style.display = "block";
    div.dataset.type = 4;
    div.dataset.startTime = 0;
    div.dataset.stopTime = time_entered;
    div.dataset.speed = 0.75;
    div.style.opacity = 0;

    scheduler.addEvent(time_entered+1, (time) => {
        if (typeof PageClass === "string"){
            if (PageClass.length > 0){
                window.location.href = PageClass;
            }
            ResetPageResources();
            return;
        }
        ResetPageResources();
        LoadContainedPage(PageClass, true);

        const props = currentPage.getProps();
        var newurl = UTILS.getSitePath();
        if (props.name != "frontpage"){
            newurl += "index" + (IS_LOCAL_HOST ? ".html" : "") + `?page=${props.name}`;
        }

        history.pushState(props, "", newurl);
    });
}

function enterPage(scheduler, time_entered){
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
    rect_array_list = [];
    for (var i=0; i<rect_div_list.length; rect_array_list.push(new ForegroundRectData()), ++i);

    const gl = foreground.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, rects_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, RectBufferStride * RectVertexCount * rect_div_list.length, gl.DYNAMIC_DRAW);
    foreground.toy.setDrawCount(rect_div_list.length * RectVertexCount);

    for (var i=0; i<rect_div_list.length; ++i){
        const div_rect = rect_div_list[i].getBoundingClientRect();
        updateRectData(rect_div_list[i], div_rect, rect_array_list[i], i);
    }
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
            div.dataset.grid || 1
        )
    );
}

function checkRectData(div, div_rect, stored_rect){
    return (
        div_rect.x != stored_rect.x ||
        div_rect.y != stored_rect.y ||
        div_rect.width != stored_rect.w ||
        div_rect.height != stored_rect.h ||
        div.dataset.startTime != stored_rect.start ||
        div.dataset.stopTime != stored_rect.stop
    );
}

function updateAnimatedRectDivs(){
    const time = foreground.toy.getTime();
    for (var i=0; i<rect_div_list.length; ++i){
        const div_rect = rect_div_list[i].getBoundingClientRect();
        if (checkRectData(rect_div_list[i], div_rect, rect_array_list[i])){
            updateRectData(rect_div_list[i], div_rect, rect_array_list[i], i);
        }
    }
}
