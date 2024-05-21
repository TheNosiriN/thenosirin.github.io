PixelPageHeader();


window.addEventListener("DOMContentLoaded", () => {
    if (SHOW_DEBUG_BORDERS){
        AddDebugBorders(document.getElementById("main_page_container"));
    }

    StartForegroundRenderer(() => {
        RefreshAnimatedRectDivs();
        setInterval(updateAnimatedRectDivs, 8);
        enterPage(scheduler, 0);
        if (!foreground.toy){
            updateWithFrame();
        }else{
            foreground.toy.setOnDraw(update);
        }
    });

    scheduler.addEvent(3, StartPageContent);
});



function update(){
    if (foreground.toy){
        scheduler.setTime(foreground.toy.getTime());
    }
    scheduler.nextEvent();
}

let then = 0;
function updateWithFrame(){
    update();
    requestAnimationFrame(update);
}



var typer = null;
function StartPageContent(){
    typer = new TypeWriterEffect(document.getElementById("main_content"), {
        content: Content,
        typeDelay: 33,
        onFinished: () => {
            console.log("done");
        },
        onInserted: (writer) => {
            writer.element.parentElement.parentElement.scrollTop = writer.element.parentElement.parentElement.scrollHeight;
        }
    });
    typer.play();
}



function InsertResumeLink(args, writer){
    const url = UTILS.getSitePath()+"frontpage/work/resume.pdf";
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.innerHTML = "download";
    link.style.textDecorationLine = "none";
    writer.element.appendChild(link);
}


function StartPdfViewer(args, writer){
    const url = UTILS.getSitePath()+"frontpage/work/resume.pdf";
    var pdf = document.createElement("iframe");
    pdf.id = "pdf_content";
    pdf.src = `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    pdf.style.width = "100%";
    pdf.style.height = "100vh";
    pdf.style.maxHeight = "675px";
    writer.element.appendChild(pdf);
}



const Content = [
    TypeWriterEffect.setdelay(45),
    "Its better if I just show you my resume... ",

    TypeWriterEffect.wait(1000),
    TypeWriterEffect.callback(InsertResumeLink),
    "\n\n",
    TypeWriterEffect.callback(StartPdfViewer),
];
