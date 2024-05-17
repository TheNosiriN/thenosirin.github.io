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



class TimeScheduler {
    constructor(){
        this.events = [];
        this.time = 0;
        this.iter = 0;
    }

    nextEvent(){
        while (this.iter < this.events.length && this.events[this.iter].time <= this.time){
            this.events[this.iter].callback(this.time);
            this.iter++;
        }
        this.time++;
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



function AddDebugBorders(element, level=0){
    const colors = ["red", "blue", "lime"];
    element.style.border = "5px solid";
    element.style.borderColor = colors[level % colors.length];
    for (const child of element.children) {
        // if (child.tagName != "DIV")continue;
        AddDebugBorders(child, level+1);
    }
}



var scheduler = new TimeScheduler();
var rect_array_list;
var rect_div_list;



function leavePage(url, scheduler, time_entered){
    var div = document.getElementById("page_transition");
    div.style.display = "block";
    div.dataset.type = 4;
    div.dataset.startTime = 0;
    div.dataset.stopTime = time_entered;
    div.dataset.speed = 0.75;
    div.style.opacity = 0;
    scheduler.addEventNoSort(time_entered+1, (time) => {
        window.location.href = url;
    });
}
function enterPage(scheduler, time_entered){
    let div = document.getElementById("page_transition");
    div.style.display = "block";
    div.dataset.type = 5;
    div.dataset.startTime = time_entered;
    div.dataset.stopTime = -10;
    div.dataset.speed = 0.75;
    scheduler.addEventNoSort(time_entered+2, (time) => {
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
            // console.log("updated: "+rect_div_list[i].id+" at: "+time, rect_array_list[i].start+" -- "+rect_array_list[i].stop);
        }
    }
}
