function ContainedPage_Work(scheduler){
    const resume_url = UTILS.getSitePath()+"work/resume.pdf";

    function StartPdfViewer(args, writer){
        var pdf = document.createElement("iframe");
        pdf.id = "pdf_content";
        pdf.src = `${resume_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
        pdf.style.width = "100%";
        pdf.style.height = "100vh";
        pdf.style.maxHeight = "675px";
        writer.element.appendChild(pdf);
    }

    const Content = [
        TypeWriterEffect.wait(2000),
        TypeWriterEffect.setdelay(45),

        "Its better if I just show you my resume... ",
        TypeWriterEffect.setlink(resume_url, true), "download",

        TypeWriterEffect.wait(1000), "\n\n",
        TypeWriterEffect.callback(StartPdfViewer),
    ];

    var typer = null;
    function StartPageContent(){
        typer = new TypeWriterEffect(document.getElementById("main_content"), {
            content: Content,
            typeDelay: 33
        });
        typer.play();
    }


    this.setup = () => {
        StartPageContent();
    }

    this.update = () => {
        scheduler.nextEvent();
    }

    this.getProps = () => {
        return { name: "workex", html: "frontpage/work.html", css: "workpage", title: "Work Experience" };
    }
}
