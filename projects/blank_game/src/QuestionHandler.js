///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// questions functions
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function openQuestion()
{
    gotlastRight = true;
    runCountDown = true;
    questionOpen = true;
    questionOpening = false;

    var cur = QuestionLOD.questions[questionIndex];

    // console.log("New Question");
    // for (var i=0; i<cur.options.length; i++){
    // 	console.log((i+1)+": "+cur.options[i]+"  ");
    // }

    createButtons(cur);
    game.stage.addChild(countdownCont);

    countdown = Math.max(4, cur.countdown - Math.floor(0.5 * currentScore/speedInterval));
}

function closeQuestion()
{
    questionOpen = false;
    questionOpening = false;
    questionBlocks.length = 0;

    destroyButtons();

    questionIndex++;
    if (questionIndex >= QuestionLOD.questions.length-1){
        questionIndex = 0;
        QuestionLOD.questions = shuffleArray(QuestionLOD.questions);
    }
    //questionIndex %= QuestionLOD.questions.length;

    countdown = 0;
}

function updateCounter()
{
    trackSettings.speed = lerp(trackSettings.speed, reducedSpeed / initSpeed, 0.01 * initSpeed);
    timeIncrementSpeed = lerp(timeIncrementSpeed, reducedSpeed, 0.01);

    countdown -= ONE_SECOND * game.delta;
    countdownText.text = "Time left - "+Math.floor(countdown+1)+"s";

    if (countdown <= 0 && runCountDown == true){
        countdown = 0;
        gotWrong();
    }else if (countdown <= countAtAnswer-1){
        DecideFailOrContinue();
    }
}

function makeQuestionBlocks(num)
{
    initQX = -trackSettings.blockLength * (num/2);
    initQY = track.pointer.y;//track.points[track.points.length - 1].y;

    firstY = getFunction(initQX/trackSettings.resolution);
    for (var i=0; i<num; i++){
        var b = new Block(track, true, "0xffff00");
        b.create();
        if (i % 2 == 0){
            b.hide();
        }

        track.blocks.unshift(b);
        questionBlocks.push(b);
    }
}

function getFunction(x)
{
    x = x / trackSettings.resolution;

    var y = QuestionLOD.questions[questionIndex].question(x);
    return y;
}

var flyOffPoint = new PIXI.Point(0,0);
function createFlyOff()
{
    var pos = getNearestBlock();
    var block = track.blocks[pos];

    var dir = pointDirection(
        block.points[block.points.length-1].x, block.points[block.points.length-1].y,
        block.points[block.points.length-3].x, block.points[block.points.length-3].y
    );
    flyOffPoint.x = block.points[block.points.length-1].x + lengthdir_x(game.renderer.height*3, dir+180);
    flyOffPoint.y = block.points[block.points.length-1].y + lengthdir_y(game.renderer.height*3, dir+180);

}

function DecideFailOrContinue()
{
    countdown = 0;
    countAtAnswer = 0;
    resume();
    if (gotlastRight == false){
        gameOverScreen();
    }
}



function gotWrong()
{
    gotlastRight = false;
    countAtAnswer = countdown;
    game.stage.removeChild(countdownCont);

    runCountDown = false;

    for (var i=0; i<buttons.length; i++){
        displayAnswer(buttons[i]);
    }

    // createFlyOff();
}

function gotRight()
{
    gotlastRight = true;
    countAtAnswer = countdown;
    incrementScore();
    increaseSpeed();
    game.stage.removeChild(countdownCont);

    for (var i=0; i<questionBlocks.length; i++){
        if (questionBlocks[i].hidden == true){
            questionBlocks[i].unhide();
        }
    }
    runCountDown = false;

    displayAnswer(buttons[QuestionLOD.questions[questionIndex].answer]);
}

function increaseSpeed()
{
    if (currentScore % speedInterval == 0){
        initSpeed += 1 / (currentScore/speedInterval + 1);
    }
}









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// Question Bar functions
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadQuestionBar()
{
    questionBar = PIXI.Sprite.from('assets/Question bar.png');
    buttonTextureIdle = PIXI.Texture.from('assets/button.png');
    buttonTextureRight = PIXI.Texture.from('assets/buttonRight.png');
    buttonTextureWrong = PIXI.Texture.from('assets/buttonWrong.png');

    questionBar.texture.on('update', function()
    {
        var ratio = questionBar.width / questionBar.height;
        questionBar.width = game.renderer.width * 1.05;
        questionBar.height = questionBar.width / ratio;

        updateQuestionBar();
    });

    game.questionBar.addChild(questionBar);
}

function updateQuestionBar()
{
    questionBar.x = (camDim.x/2) - (questionBar.width/2);
    questionBar.y = (camDim.y) - questionBar.height/1.3;
}

function createButtons()
{
    var cur = QuestionLOD.questions[questionIndex];

    for (var i=0; i<cur.options.length; i++)
    {
        var b = new QuestionButton(buttonTextureIdle, i, {
            onButtonUp: function(){
                if (gotlastRight == true){
                    if (this.index == QuestionLOD.questions[questionIndex].answer){
                        gotRight();
                    }else{
                        gotWrong();
                    }
                }

                this.alpha = 1;
            },
        });

        var txt = new PIXI.Text(cur.options[i], {fontFamily : TERTIARY_FONT, fontSize: 40, fill : "0x000000", align : 'center'});
        b.addChild(txt);

        b.anchor.set(0.5, 0.5);
        b.scale.x = b.scale.y = (0.7 * game.renderer.width) / 1920;

        let w = b.width * 1.5;
        b.x = (camDim.x/2) + (w * (i - cur.options.length/2)) + w/2;
        b.y = (questionBar.y + questionBar.height/2);

        txt.anchor.set(0.5, 0.5);

        buttons.push(b);
        game.ui.addChild(b);
    }
}


function displayAnswer(button)
{
    if (button.index == QuestionLOD.questions[questionIndex].answer){
        button.texture = buttonTextureRight;
    }else{
        button.texture = buttonTextureWrong;
    }
}


function destroyButtons()
{
    for (var i=0; i<buttons.length; i++){
        buttons[i].parent.removeChild(buttons[i]);
        buttons[i].destroy({children:true, baseTexture:true});
    }
    buttons.length = 0;
}
