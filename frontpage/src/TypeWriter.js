class TypeWriterEffect {
    constructor(element, options){
        this.content = options.content || [""];
        this.typeDelay = options.typeDelay || 50;
        this.onFinished = options.onFinished;
        this.onInserted = options.onInserted;

        this.reset();
        this.element = element;
    }

    reset(){
        this.index = 0;
        this.pos = 0;
        this.isPlaying = false;
        this.insertTemp = false;
        this.tempElement = null;
        this.currentSpan = null;
        this.stop();
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
                    this.pos++;

                    if (char == '\n'){
                        this.element.appendChild(document.createElement("br"));
                        if (this.onInserted) { this.onInserted(char, this); }
                        return;
                    }

                    if (!this.currentSpan){
                        this.currentSpan = document.createElement("span");
                        if (this.insertTemp){
                            this.tempElement.appendChild(this.currentSpan);
                        }else{
                            this.element.appendChild(this.currentSpan);
                        }
                    }
                    this.currentSpan.innerHTML += char;
                    if (this.onInserted) { this.onInserted(char, this); }
                } else {
                    this.index++;
                    this.pos = 0;
                    this.insertTemp = false;
                    this.currentSpan = null;
                }
                return;
            }

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
                this.element.appendChild(this.tempElement);
                this.tempElement.href = txt.url;
                this.tempElement.target = txt.newtab ? "_blank" : "_self";
                this.index++;
                break;
                case 5: // Append element
                this.insertTemp = true;
                this.tempElement = txt.element;
                this.element.appendChild(this.tempElement);
                this.index++;
                break;
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

    setContent(c){
        this.content = c;
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
    static setelement(element){
        return {type: 5, element:element};
    }
}



class TypeWriterEffectHTML {
    constructor(element, options){
        this.setContent(options.content);
        this.typeDelay = options.typeDelay || 50;
        this.onFinished = options.onFinished;
        this.onInserted = options.onInserted;

        this.reset();
        this.element = element;
    }

    reset(){
        this.pos = 0;
        this.stack = [];
        this.map = [];
        this.isPlaying = false;
        this.firsttime = true;
        this.stop();
    }

    play(){
        if (this.map.length==0){
            this.isPlaying = false;
            return;
        }
        this.isPlaying = true;

        if (this.firsttime){
            this.stack.push({ wordindex: 0, mapindex: 0 });
            this.element.appendChild(this.map[0].node);
            this.firsttime = false;
        }

        const write = () => {
            if (!this.isPlaying) return;

            if (this.stack.length == 0){
                if (this.onFinished) { this.onFinished(this); }
                this.stop();
                return;
            }

            var stackelement = this.stack[this.stack.length-1];
            const el = this.map[stackelement.mapindex];

            if (stackelement.wordindex >= el.words.length){
                this.stack.pop();
                return;
            }

            const txt = el.words[stackelement.wordindex];

            if (typeof txt === "string"){
                if (this.pos < txt.length) {
                    const char = txt.charAt(this.pos);
                    this.pos++;
                    el.node.innerHTML += char;
                    if (this.onInserted) { this.onInserted(char, this); }
                } else {
                    this.pos = 0;
                    stackelement.wordindex++;
                }
            }else{
                this.stack.push({ wordindex: 0, mapindex: txt });
                const mapentry = this.map[this.stack[this.stack.length-1].mapindex];
                el.node.appendChild(mapentry.node);
                if (mapentry.node.typeWriterCallback){
                    mapentry.node.typeWriterCallback(mapentry.node);
                }
                stackelement.wordindex++;
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

    setContent(c){
        if (!c)return;
        this.content = c;

        const cloneNode = (node) => {
            var newnode = node.cloneNode(false);
            newnode.typeWriterCallback = node.typeWriterCallback;
            return newnode;
        }

        const addChildren = (el, entry) => {
            // if there were no children then just push the html
            if (!el.children.length){
                entry.words.push(el.innerHTML);
                return;
            }

            var html = el.innerHTML;
            var words = [];
            var localstack = [];
            var normaltext = "";

            for (
                let i=0, name="", childIndex=0,
                reachedEnd=false, curStartPos=-1, isOpenElement=false;
                i<html.length; ++i
            ){
                const char = html.charAt(i);

                if (localstack.length > 0){
                    let lasttag = localstack[localstack.length-1];
                    let endpos = i + lasttag.name.length + 3;
                    let closingtag = `</${lasttag.name}>`;

                    if (lasttag.isopen){
                        endpos = i+1;
                        closingtag = ">";
                    }

                    if (html.substring(i, endpos) == closingtag){
                        localstack.pop();
                        i = endpos-1;
                        curStartPos = -1;
                        normaltext = "";
                        name = "";
                        if (localstack.length > 0){ continue; }
                    }

                    if (localstack.length == 0){
                        this.map.push({ node: cloneNode(el.children[childIndex]), words: [] });
                        if (normaltext.length > 0){
                            entry.words.push(normaltext);
                        }
                        entry.words.push(html.slice(0, lasttag.startpos), this.map.length-1);

                        addChildren(el.children[childIndex], this.map[this.map.length-1]);
                        html = html.slice(endpos);
                        childIndex++;

                        i = -1;
                        curStartPos = -1;
                        normaltext = "";
                        name = "";
                        continue;
                    }
                }

                if (curStartPos >= 0){
                    if (char == '>' || char == ' '){
                        let isopen = false;
                        if (name == "img"){
                            isopen = true;
                        }
                        localstack.push({ name: `${name}`, startpos: curStartPos, isopen: isopen });
                        curStartPos = -1;
                        name = "";
                    }else{
                        name += char;
                    }
                    continue;
                }

                if (char == '<'){
                    curStartPos = i;
                    continue;
                }

                normaltext += char;
            }

            // if there was still remaining html text but no more children
            // then just append the rest to the element
            if (normaltext.length > 0){
                entry.words.push(normaltext);
            }
        };

        var div = document.createElement("div");
        div.id = "TypeWriterEffectHTML";
        while (c.children.length){
            div.appendChild(c.children[0]);
        }

        this.map.push({ node: div.cloneNode(false), words: [] });
        addChildren(div, this.map[this.map.length-1]);
    }
}
