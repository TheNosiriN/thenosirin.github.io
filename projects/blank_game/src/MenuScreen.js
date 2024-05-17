///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// MenuScreen.js
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class MenuScreen extends PIXI.Container
{
	constructor(create, update, destroy)
	{
		super();
		this.createF = create || function(){};
		this.updateF = update || function(){};
		this.destroyF = destroy || function(){};
	}

	show(){
		game.app.stage.removeChild(game.ui);
		game.menu.addChild(this);
		if (currentMenu != null){ currentMenu.destroy(); }
		this.createF();
		menuScreenOn = true;
		currentMenu = this;
	}

	update(){
		this.updateF();
	}

	destroy(){
		this.destroyF();
		game.app.stage.addChildAt(game.ui, 3);
		game.menu.removeChild(this);
		menuScreenOn = false;
		currentMenu = null;
	}
}











function updateTempTrack(tempTrack)
{
	if (tempTrack.pointer.x < (camPos.x + camDim.x + trackSettings.blockLength)){
		var b = new Block(tempTrack);
		b.create();
		tempTrack.blocks.unshift(b);
	}

	if (tempTrack.blocks.length > 0){
		if (tempTrack.blocks[tempTrack.blocks.length-1].points[0].x < camPos.x - trackSettings.blockLength){
			tempTrack.removeFirstBlock();
		}
	}

	tempTrack.totalLength = tempTrack.points.length + tempTrack.lastPointsLength;


	if (tempTrack.blocks.length > 1){
		camPos.x = lerp(camPos.x, tempTrack.getPoint( Math.floor(tempIter) ).x, 1) - camDim.x/2;
		camPos.y = lerp(camPos.y, tempTrack.getPoint( Math.floor(tempIter) ).y, 1) - camDim.y/2;
		game.stage.pivot.x = camPos.x;
		game.stage.pivot.y = camPos.y;

		tempIter += 1;//trackSettings.speed;
		tempIter = clamp(tempIter, 0, tempTrack.totalLength-1);
	}
}










function mainMenuScreen()
{
	destroyGameConstants();
	initGameConstants();

	gameStarted = false;
	gameIsPaused = false;
	var tempTrack;

	var mainMenu = new MenuScreen(
		function(){
			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.5
				}
			));



			//credits
			let credits = new PIXI.Text(
				"Final Project Group 2",
				{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'}
			);
			credits.anchor.set(0.5, 0.5);
			credits.x = game.renderer.width/2;
			credits.y = game.renderer.height - credits.height;
			this.addChild(credits);



			//big game text
			let mainMenu = new PIXI.Container();

			let mainMenuText = new PIXI.Text("Geo Coaster", {fontFamily : PRIMARY_FONT, fontSize: 200, fill : "0x000000", align : 'center'});

			var ratio = mainMenuText.width / mainMenuText.height;
			mainMenuText.width = game.renderer.width/1.75;
			mainMenuText.height = mainMenuText.width / ratio;

			mainMenu.x = game.renderer.width/2 - mainMenuText.width/2;
			mainMenu.y = game.renderer.height/3 - mainMenuText.height/2;

			let mainMenuRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(mainMenuText.width*1.25, mainMenuText.height),
				{
					color: "0xFFFFFF",
					alpha: 1.0,
				}
			);
			mainMenuRect.x = mainMenuText.width/2 - (mainMenuText.width*1.25)/2;

			mainMenu.addChild(mainMenuRect);
			mainMenu.addChild(mainMenuText);
			this.addChild(mainMenu);



			let playGameText = new PIXI.Text("Play", {fontFamily : SECONDARY_FONT, fontSize: 50, fill : "0x000000", align : 'center'});
			let howToText = new PIXI.Text("How to Play", {fontFamily : SECONDARY_FONT, fontSize: 50, fill : "0x000000", align : 'center'});



			//play game
			let playGame = new PIXI.Container();

			playGame.x = game.renderer.width/2 - ((playGameText.width+howToText.width)*1.5)/2;
			playGame.y = mainMenu.y + mainMenuText.height*1.5;

			let playGameButton = new Button(playGameText.texture, {
				onButtonUp: function(){
					cheatSheetMenu();
				}
			});

			let playGameRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(playGameButton.width*1.5, playGameButton.height*1.25),{
					color: "0xFFFFFF",
					alpha: 0.9,
				}
			);
			playGameRect.x = playGameText.width/2 - playGameRect.width/2;
			playGameRect.y = playGameText.height/2 - playGameRect.height/2;

			playGame.addChild(playGameRect);
			playGame.addChild(playGameButton);
			this.addChild(playGame);



			//how to play!
			let howTo = new PIXI.Container();

			howTo.x = game.renderer.width/2 - ((playGameText.width+howToText.width)*1.5)/2 + howToText.width;
			howTo.y = mainMenu.y + mainMenuText.height*1.5;

			let howToButton = new Button(howToText.texture, {
				onButtonUp: function(){
					howToPlayScreen();
				}
			});

			let howToRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(howToButton.width*1.5, howToButton.height*1.25),{
					color: "0xFFFFFF",
					alpha: 0.9,
				}
			);
			howToRect.x = howToText.width/2 - howToRect.width/2;
			howToRect.y = howToText.height/2 - howToRect.height/2;

			howTo.addChild(howToRect);
			howTo.addChild(howToButton);
			this.addChild(howTo);





			//temporary track
			tempTrack = new Track(new PIXI.Point(0, game.renderer.height/2));
			tempIter = 0;
		},


		function(){
			updateTempTrack(tempTrack);
		}
	);

	mainMenu.show();
}










function howToPlayScreen()
{
	destroyGameConstants();
	initGameConstants();

	var tempTrack;

	let currentHowToPage = howToPages[howToPageIndex];

	new MenuScreen(
		function(){
			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.8
				}
			));


			var backText, nextText;
			if (howToPageIndex == howToPages.length-1){
				nextText = new PIXI.Text("", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
			}else{
				nextText = new PIXI.Text("Next >", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
			}
			if (howToPageIndex == 0){
				backText = new PIXI.Text("< Back To Menu", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
			}else{
				backText = new PIXI.Text("< Back", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
			}


			//back to menu
			backText.width;
			let backButton = new Button(backText.texture, {
				onButtonUp: function(){
					if (howToPageIndex == 0){
						howToPageIndex = 0;
						DecideFailOrContinue();
						mainMenuScreen();
					}else{
						howToPageIndex--;
						howToPageIndex = Math.max(howToPageIndex, 0);
						currentMenu.destroy();
						howToPlayScreen();
					}
				}
			});
			backButton.anchor.set(-0, 1.5);
			backButton.y = game.renderer.height;
			backButton.x = 10;

			this.addChild(backButton);


			//Next
			nextText.width;
			let nextButton = new Button(nextText.texture, {
				onButtonUp: function(){
					if (howToPageIndex < howToPages.length-1){
						howToPageIndex++;
						howToPageIndex = Math.min(howToPageIndex, howToPages.length-1);
						currentMenu.destroy();
						howToPlayScreen();
					}
				}
			});
			nextButton.anchor.set(1, 1.5);
			nextButton.y = game.renderer.height;
			nextButton.x = game.renderer.width - 10;

			this.addChild(nextButton);


			this.addChild(currentHowToPage);


			//temporary track
			tempTrack = new Track(new PIXI.Point(0, game.renderer.height/2));
			tempIter = 0;
		},


		function(){
			updateTempTrack(tempTrack);
		}

	).show();
}










function gameOverScreen()
{
	gameIsPaused = true;

	var gameOver = new MenuScreen(
		function(){
			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.5
				}
			));

			//game over text
			let gameOver = new PIXI.Container();

			let gameOverText = new PIXI.Text("Game Over",{fontFamily : PRIMARY_FONT, fontSize: 150, fill : "0x000000", align : 'center'});

			var ratio = gameOverText.width / gameOverText.height;
			gameOverText.width = game.renderer.width/3;
			gameOverText.height = gameOverText.width / ratio;

			gameOver.x = game.renderer.width/2 - gameOverText.width/2;
			gameOver.y = game.renderer.height/4.5 - gameOverText.height/2;

			let gameOverRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(gameOverText.width*1.25, gameOverText.height),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			gameOverRect.x = gameOverText.width/2 - (gameOverText.width*1.25)/2;

			gameOver.addChild(gameOverRect);
			gameOver.addChild(gameOverText);
			this.addChild(gameOver);



			//your score
			let yourScore = new PIXI.Container();
			let yourScoreText = new PIXI.Text("Your Score: "+currentScore+"m",{fontFamily : SECONDARY_FONT, fontSize: 150, fill : "0x000000", align : 'center'});

			var ratio = yourScoreText.width / yourScoreText.height;
			yourScoreText.width = game.renderer.width/6;
			yourScoreText.height = yourScoreText.width / ratio;

			yourScore.x = game.renderer.width/2 - yourScoreText.width/2;
			yourScore.y = game.renderer.height/2.5 - yourScoreText.height/2;

			let yourScoreRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(yourScoreText.width*1.25, yourScoreText.height*1.125),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);

			yourScoreRect.x = yourScoreText.width/2 - (yourScoreText.width*1.25)/2;
			yourScoreRect.y = yourScoreText.height/2 - (yourScoreText.height*1.25)/2;

			yourScore.addChild(yourScoreRect);
			yourScore.addChild(yourScoreText);
			this.addChild(yourScore);



			//high score
			let highScoreC = new PIXI.Container();
			let highScoreCText = new PIXI.Text("High Score: "+highScore+"m",{fontFamily : SECONDARY_FONT, fontSize: 150, fill : "0x000000", align : 'center'});

			var ratio = highScoreCText.width / highScoreCText.height;
			highScoreCText.width = game.renderer.width/6;
			highScoreCText.height = highScoreCText.width / ratio;

			highScoreC.x = game.renderer.width/2 - highScoreCText.width/2;
			highScoreC.y = yourScore.y + (game.renderer.height/8);

			let highScoreCRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(highScoreCText.width*1.25, highScoreCText.height*1.125),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);

			highScoreCRect.x = highScoreCText.width/2 - (highScoreCText.width*1.25)/2;
			highScoreCRect.y = highScoreCText.height/2 - (highScoreCText.height*1.25)/2;

			highScoreC.addChild(highScoreCRect);
			highScoreC.addChild(highScoreCText);
			this.addChild(highScoreC);



			//play again
			let playAgain = new PIXI.Container();

			let playAgainText = new PIXI.Text("Play Again",{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
			playAgain.x = game.renderer.width/2 - playAgainText.width/2;
			playAgain.y = highScoreC.y + (game.renderer.height/7);

			let playAgainButton = new Button(playAgainText.texture, {
				onButtonUp: function(){
					restartGame();
				}
			});

			let playAgainRect = new Rectangle(
				new PIXI.Point(0, 0),
				new PIXI.Point(playAgainButton.width*1.5, playAgainButton.height*1.5),
				{
					color: "0xFFFFFF",
					alpha: 0.9,
				}
			);
			playAgainRect.x = playAgainText.width/2 - (playAgainText.width*1.5)/2;
			playAgainRect.y = playAgainText.height/2 - (playAgainText.height*1.5)/2;

			playAgain.addChild(playAgainRect);
			playAgain.addChild(playAgainButton);
			this.addChild(playAgain);



			//Main Menu
			let mainMenu = new PIXI.Container();

			let mainMenuText = new PIXI.Text("Main Menu",{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
			mainMenu.x = game.renderer.width/2 - mainMenuText.width/2;
			mainMenu.y = playAgain.y + (game.renderer.height/10);

			let mainMenuButton = new Button(mainMenuText.texture, {
				onButtonUp: function(){
					DecideFailOrContinue();
					mainMenuScreen();
				}
			});

			let mainMenuRect = new Rectangle(
				new PIXI.Point(0, 0),
				new PIXI.Point(mainMenuButton.width*1.5, mainMenuButton.height*1.5),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			mainMenuRect.x = mainMenuText.width/2 - (mainMenuText.width*1.5)/2;
			mainMenuRect.y = mainMenuText.height/2 - (mainMenuText.height*1.5)/2;

			mainMenu.addChild(mainMenuRect);
			mainMenu.addChild(mainMenuButton);
			this.addChild(mainMenu);
		},

		function(){

		}
	);

	gameOver.show();
}










function pauseScreen()
{
	let pauseScreen = new MenuScreen(
		function(){
			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.5
				}
			));



			//paused text
			let paused = new PIXI.Container();

			let pausedText = new PIXI.Text("Paused",{fontFamily : PRIMARY_FONT, fontSize: 150, fill : "0x000000", align : 'center'});

			var ratio = pausedText.width / pausedText.height;
			pausedText.width = game.renderer.width/3;
			pausedText.height = pausedText.width / ratio;

			paused.x = game.renderer.width/2 - pausedText.width/2;
			paused.y = game.renderer.height/3 - pausedText.height/2;

			let pausedRect = new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(pausedText.width*1.25, pausedText.height),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			pausedRect.x = pausedText.width/2 - (pausedText.width*1.25)/2;

			paused.addChild(pausedRect);
			paused.addChild(pausedText);
			this.addChild(paused);



			//resume text
			let resume = new PIXI.Container();

			let resumeText = new PIXI.Text("Resume",{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
			resume.x = game.renderer.width/2 - resumeText.width/2;
			resume.y = game.renderer.height/1.75 - resumeText.height/2;

			let resumeButton = new Button(resumeText.texture, {
				onButtonUp: function(){
					currentMenu.destroy();
					gameIsPaused = false;
				}
			});

			let resumeRect = new Rectangle(
				new PIXI.Point(0, 0),
				new PIXI.Point(resumeButton.width*1.5, resumeButton.height*1.5),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			resumeRect.x = resumeText.width/2 - (resumeText.width*1.5)/2;
			resumeRect.y = resumeText.height/2 - (resumeText.height*1.5)/2;

			resume.addChild(resumeRect);
			resume.addChild(resumeButton);
			this.addChild(resume);



			//restart
			let restart = new PIXI.Container();

			let restartText = new PIXI.Text("Restart",{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
			restart.x = game.renderer.width/2 - restartText.width/2;
			restart.y = game.renderer.height/1.75 + (game.renderer.height/10) * 1 - restartText.height/2;

			let restartButton = new Button(restartText.texture, {
				onButtonUp: function(){
					DecideFailOrContinue();
					restartGame();
				}
			});

			let restartRect = new Rectangle(
				new PIXI.Point(0, 0),
				new PIXI.Point(restartButton.width*1.5, restartButton.height*1.5),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			restartRect.x = restartText.width/2 - (restartText.width*1.5)/2;
			restartRect.y = restartText.height/2 - (restartText.height*1.5)/2;

			restart.addChild(restartRect);
			restart.addChild(restartButton);
			this.addChild(restart);



			//Main Menu
			let mainMenu = new PIXI.Container();

			let mainMenuText = new PIXI.Text("Main Menu",{fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
			mainMenu.x = game.renderer.width/2 - mainMenuText.width/2;
			mainMenu.y = game.renderer.height/1.75 + (game.renderer.height/10) * 2 - mainMenuText.height/2;

			let mainMenuButton = new Button(mainMenuText.texture, {
				onButtonUp: function(){
					DecideFailOrContinue();
					mainMenuScreen();
					gameIsPaused = false;
				}
			});

			let mainMenuRect = new Rectangle(
				new PIXI.Point(0, 0),
				new PIXI.Point(mainMenuButton.width*1.5, mainMenuButton.height*1.5),
				{
					color: "0xFFFFFF",
					alpha: 0.5,
				}
			);
			mainMenuRect.x = mainMenuText.width/2 - (mainMenuText.width*1.5)/2;
			mainMenuRect.y = mainMenuText.height/2 - (mainMenuText.height*1.5)/2;

			mainMenu.addChild(mainMenuRect);
			mainMenu.addChild(mainMenuButton);
			this.addChild(mainMenu);
		}
	);

	pauseScreen.show();
}










function cheatSheetMenu()
{
	var backButton, nextButton;

	var currentSheet = cheatSheets[cheatSheetIndex];

	new MenuScreen(
		function(){
			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.8
				}
			));


			var nextText, backText;

			if (gameStarted == false)
			{
				if (cheatSheetIndex == cheatSheets.length-1){
					nextText = new PIXI.Text("Play Game", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}else{
					nextText = new PIXI.Text("Next >", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}
				if (cheatSheetIndex == 0){
					backText = new PIXI.Text("< Back To Menu", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}else{
					backText = new PIXI.Text("< Back", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}
			}else{
				if (cheatSheetIndex == cheatSheets.length-1){
					nextText = new PIXI.Text("Resume Game >", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}else{
					nextText = new PIXI.Text("Next >", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}
				if (cheatSheetIndex == 0){
					backText = new PIXI.Text("< Resume Game", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}else{
					backText = new PIXI.Text("< Back", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0xFFFFFF", align : 'center'});
				}
			}


			//back to menu
			backText.width;	// request for width to update texture
			let backButton = new Button(backText.texture, {
				onButtonUp: function(){
					if (cheatSheetIndex == 0){
						cheatSheetIndex = 0;

						if (gameStarted == false){
							DecideFailOrContinue();
							mainMenuScreen();
						}else{
							currentMenu.destroy();
							gameIsPaused = false;
						}
					}else{
						cheatSheetIndex--;
						cheatSheetIndex = Math.max(cheatSheetIndex, 0);
						currentMenu.destroy();
						cheatSheetMenu();
					}
				}
			});
			backButton.anchor.set(0, 1.5);
			backButton.y = game.renderer.height;
			backButton.x = 20;

			this.addChild(backButton);



			//Next
			nextText.width; // request for width to update texture
			let nextButton = new Button(nextText.texture, {
				onButtonUp: function(){
					if (cheatSheetIndex == cheatSheets.length-1){
						cheatSheetIndex = 0;

						if (gameStarted == false){
							restartGame();
						}else{
							currentMenu.destroy();
							gameIsPaused = false;
						}
					}else{
						cheatSheetIndex++;
						cheatSheetIndex = Math.min(cheatSheetIndex, cheatSheets.length-1);
						currentMenu.destroy();
						cheatSheetMenu();
					}
				}
			});
			nextButton.anchor.set(1, 1.5);
			nextButton.y = game.renderer.height;
			nextButton.x = game.renderer.width - 20;

			this.addChild(nextButton);


			this.addChild(currentSheet);
		},

		function(){

		},

	).show();
}










function makePauseButton()
{
	let pauseButton = new Button(PIXI.Texture.from("assets/pauseButton.png"), {
		onButtonUp: function(){
			pauseScreen();
			gameIsPaused = true;
		}
	});

	let cheatButton = new Button(PIXI.Texture.from("assets/cheatButton.png"), {
		onButtonUp: function(){
			cheatSheetMenu();
			gameIsPaused = true;
		}
	});

	pauseButton.anchor.set(1, 0);
	pauseButton.x = game.renderer.width;
	pauseButton.y = 0;

	cheatButton.anchor.set(2.5, 0);
	cheatButton.x = game.renderer.width;
	cheatButton.y = 0;

	game.ui.addChild(pauseButton);
	game.ui.addChild(cheatButton);
}
