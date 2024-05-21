function ContainedPage_Contact(){
    const Content = [
        TypeWriterEffect.wait(3000),

        "Github: ",
        TypeWriterEffect.setlink("https://github.com/TheNosiriN", true), "TheNosiriN", "\n\n",

        "LinkedIn Profile: ",
        TypeWriterEffect.setlink("https://www.linkedin.com/in/chinomso-nosiri-433010203/", true), "Chinomso Nosiri", "\n\n",

        "Email: ",
        TypeWriterEffect.setlink("mailto:thenosirin@gmail.com", true), "thenosirin@gmail.com"
    ];

    var typer = null;
    function StartPageContent(){
        typer = new TypeWriterEffect(document.getElementById("typed_content"), {
            content: Content,
            typeDelay: 40
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
        return { name: "contacts", html: "frontpage/contact.html", css: "contactpage", title: "Contacts" };
    }
}
