// made by Chinomso Nosiri




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// The Game Starts here
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", function()
{
	game.app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: 0x2c3e50,
		view: canvas
	});

	game.delta = 0;
	game.update = game.app.ticker;
	game.loader = game.app.loader;
	game.renderer = game.app.renderer;

	resize();
	create();
});



// Resizing doesn't work properly because of PixiJS and how every sprite is view dependent
window.addEventListener('resize', function(){
	resize();
});



// Resolve keyboard inputs
function setupKey(value) {
	const key = {};
	key.value = value;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = (event) => {
		if (event.key === key.value) {
			if (key.isUp && key.press) {
				key.press();
			}
			key.isDown = true;
			key.isUp = false;
			event.preventDefault();
		}
	};

	//The `upHandler`
	key.upHandler = (event) => {
		if (event.key === key.value) {
			if (key.isDown && key.release) {
				key.release();
			}
			key.isDown = false;
			key.isUp = true;
			event.preventDefault();
		}
	};

	//Attach event listeners
	const downListener = key.downHandler.bind(key);
	const upListener = key.upHandler.bind(key);

	window.addEventListener("keydown", downListener, false);
	window.addEventListener("keyup", upListener, false);

	// Detach event listeners
	key.unsubscribe = () => {
		window.removeEventListener("keydown", downListener);
		window.removeEventListener("keyup", upListener);
	};

	return key;
}











///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// Important Game init functions
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function create()
{
	keys.vk_T = setupKey(84);

	var errfunc = function(err){
		console.error(err);
	};

	loadFonts()
	.then(loadShaders(), errfunc)
	.then(function(){
		mainMenuScreen();
		loadQuestionBar();
		loadHowToPage();
		loadCheatSheets();
		loadBackgroundShader();
		game.update.add(update);
	}, errfunc);
}




function createGame()
{
	QuestionLOD.questions = shuffleArray(QuestionLOD.questions);
	console.log(QuestionLOD.questions.length+" Question" +(QuestionLOD.questions.length > 1 ? "s":"")+ "!");

	makePauseButton();
	makeCarts();

	gameStarted = true;
	gotlastRight = true;
	initSpeed = startSpeed;
	trackSettings.speed = initSpeed;
	howToPageIndex = 0;
	currentAbsPoint = 0;
	currentScore = 0;
	target = new PIXI.Point(0, 0);

	track = new Track(new PIXI.Point(0, game.renderer.height/2));

	countdownCont = new PIXI.Container();
	countdownText = new PIXI.Text("", {fontFamily : SECONDARY_FONT, fontSize: 50, fill : "0x000000", align : 'center'});
	countdownRect = new Rectangle(
		new PIXI.Point(0, 0), new PIXI.Point(1,1), {
			color: "0xFFFFFF",
			alpha: 0.25,
		}
	);

	countdownCont.addChild(countdownRect);
	countdownCont.addChild(countdownText);

	makeScoreText();

	getNextStop();
}





function gameUpdate()
{
	camDim = new PIXI.Point(game.renderer.width, game.renderer.height);

	if (track != null){
		if (track.totalLength > 20)
		{
			var spc = [currentAbsPoint, currentAbsPoint-10];
			for (var i=0; i<2; i++){
				cart[i].x = lerp(cart[i].x, track.getPoint( Math.floor(Math.max( 0, spc[i] )) ).x, Math.min(1,trackSettings.speed));
				cart[i].y = lerp(cart[i].y, track.getPoint( Math.floor(Math.max( 0, spc[i] )) ).y, Math.min(1,trackSettings.speed));

				cart[i].rotation = degrees_to_radians(pointDirection(
					track.getPoint( Math.floor(Math.max( 0, spc[i] )) ).x, track.getPoint( Math.floor(Math.max( 0, spc[i] )) ).y,
					track.getPoint( Math.floor(Math.max( 0, spc[i]-1 )) ).x, track.getPoint( Math.floor(Math.max( 0, spc[i]-1 )) ).y
				) - 180);
			}

			currentAbsPoint += trackSettings.speed;
		}
	}

	var offset = new PIXI.Point(cart[0].x + camDim.x/6, cart[0].y);
	target = offset.clone();


	countdownCont.x = cart[0].x - countdownText.width;
	countdownCont.y = cart[0].y - (camDim.y/5);

	countdownRect.x = (countdownText.width/2 - (countdownText.width*1.25)/2);
	countdownRect.width = countdownText.width*1.25;
	countdownRect.height = countdownText.height*1.25;


	track.updateTrack();
	updateScoreText();

	if (questionOpening == true)
	{
		updateQuestionChecker();
	}
	else if (questionOpen == true)
	{
		var b = questionBlocks[questionBlocks.length-1];
		var offset = new PIXI.Point(
			lerp(b.points[0].x, cart[0].x, 0.5),
			lerp(b.points[0].y, cart[0].y, 0.5)
		);
		target = offset;

		let zsc = ((10-trackSettings.numberOfQuestionBlocks+2)/10 * game.renderer.width) / 1920;
		let zsp = (zoomSpeed * game.renderer.width) / 1920;
		camScale.x = lerp(camScale.x, zsc, zsp);
		camScale.y = lerp(camScale.y, zsc, zsp);

		updateCounter();
	}else{
		camScale.x = lerp(camScale.x, 1, 0.1);
		camScale.y = lerp(camScale.y, 1, 0.1);
	}


	camPos.x = lerp(camPos.x, target.x - (camDim.x/camScale.x)/2, 0.025 * initSpeed);
	camPos.y = lerp(camPos.y, target.y - (camDim.y/camScale.y)/2, 0.025 * initSpeed);
	game.stage.pivot.x = camPos.x;
	game.stage.pivot.y = camPos.y;
	game.stage.scale.x = camScale.x;
	game.stage.scale.y = camScale.y;


	// update developer shortcuts
	// if (questionOpen == true && keys.vk_T == true){
	// 	gotRight();
	// }
}





function countDownToStart()
{
	createGame();

	var countMenu = new MenuScreen(
		function(){
			countDownForStart = 3;
			countDownForStartText = new PIXI.Text("",{fontFamily : PRIMARY_FONT, fontSize: 100, fill : "0x000000", align : 'center'});

			this.addChild(new Rectangle(
				new PIXI.Point(0, 0), new PIXI.Point(game.renderer.width, game.renderer.height), {
					color: "0x000000",
					alpha: 0.3
				}
			));

			let w = 200;
			countDownForStartRect = new Rectangle(
				new PIXI.Point(0,0), new PIXI.Point(w, w), {
					color: "0xFFFFFF",
					alpha: 0.3,
				}
			);

			this.addChild(countDownForStartRect);
			this.addChild(countDownForStartText);

			for (var i=0; i<21; i++){
				gameUpdate();
			}
		},

		function(){
			countDownForStart -= ONE_SECOND * game.delta;
			countDownForStartText.text = Math.floor(countDownForStart+1)+"";

			countDownForStartText.x = game.renderer.width/2 - countDownForStartText.width/2;
			countDownForStartText.y = game.renderer.height/2 - countDownForStartText.height/2;

			countDownForStartRect.x = game.renderer.width/2 - countDownForStartRect.dimension.x/2;
			countDownForStartRect.y = game.renderer.height/2 - countDownForStartRect.dimension.y/2;

			if (countDownForStart <= 0){
				this.destroy();
			}
		}
	);

	countMenu.show();
}






function initGameConstants()
{
	game.delta = 0;
	game.ui = new PIXI.Container();
	game.menu = new PIXI.Container();
	game.stage = new PIXI.Container();
	if (game.background == null){ game.background = new PIXI.Container(); }
	if (game.questionBar == null){ game.questionBar = new PIXI.Container(); }

	game.app.stage.addChild(game.background);
	game.app.stage.addChild(game.stage);
	game.app.stage.addChild(game.questionBar);
	game.app.stage.addChild(game.ui);
	game.app.stage.addChild(game.menu);

	camPos = new PIXI.Point(0, 0);
	camDim = new PIXI.Point(game.renderer.width, game.renderer.height);
	camScale = new PIXI.Point(1, 1);

	noise = new SimplexNoise();
}

function destroyGameConstants()
{
	if (game.menu != null){
		game.menu.destroy({children:true, texture: true, baseTexture:true});
		game.ui.destroy({children:true, texture: true, baseTexture:true});
		game.stage.destroy({children:true, texture: true, baseTexture:true});

		game.app.stage.removeChild(game.background);
		game.app.stage.removeChild(game.stage);
		game.app.stage.removeChild(game.questionBar);
		game.app.stage.removeChild(game.ui);
		game.app.stage.removeChild(game.menu);
	}
}




function restartGame()
{
	if (currentMenu != null){ currentMenu.destroy(); }
	gameIsPaused = false;

	destroyGameConstants();
	initGameConstants();
	countDownToStart();
}




function update(delta)
{
	game.delta = delta;

	if (questionBar != null){
		updateQuestionBar();
	}

	if (menuScreenOn == false && gameIsPaused == false){
		gameUpdate();
	}else{
		if (currentMenu != null){ currentMenu.update(); }
	}

	if (backgroundSprite.filters != null && gameIsPaused == false){
		backgroundSprite.filters[0].uniforms.iTime += (ONE_SECOND * game.delta) * timeIncrementSpeed;
		if (camPos != null){
			backgroundSprite.filters[0].uniforms.camPos = camPos.clone();
			backgroundSprite.filters[0].uniforms.iResolution = new PIXI.Point(game.renderer.width, game.renderer.height);
			backgroundSprite.width = game.renderer.width;
			backgroundSprite.height = game.renderer.height;
		}
	}
}




function resize() {
	game.app.resizeTo = window;
}













///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// Fonts
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadFonts(){
	var fontData = [
		{ src: 'url(assets/Code_Bold.ttf)', name: PRIMARY_FONT },
		{ src: 'url(assets/Krungthep.ttf)', name: SECONDARY_FONT },
		{ src: 'url(assets/OpenSans-Regular.ttf)', name: TERTIARY_FONT }
		// Etc.
	];

	var observers = []
	var fonts = []

	// Make one Observer along with each font
	fontData.forEach(function(family) {
		// var data = fontData[family.name];
		var obs = new FontFaceObserver(family.name, family.src);
		var font = new FontFace(family.name, family.src);

		observers.push(obs.load(null, 5000));
		fonts.push(
			font
			.load()
			.then(function(f){
				document.fonts.add(f);

			}, function(err){
				throw {type: "font_loading_err", fontName: family.name, DOMException: err}
			})
		);
	});

	return Promise.all(fonts);
}











///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// shader stuff
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadShaders(){
	return Promise.all([
		loadFile("shd/background.glsl"),
		loadFile("shd/net.glsl")
	]).then(function(data){
		BACKGROUND_SHADER = data[0];
		NET_SHADER = data[1];

	}, function(err){
		console.error(err);
	});
}




function loadNet()
{
	netTexture = PIXI.RenderTexture.create({
		width: (trackSettings.blockLength/trackSettings.resolution)*20,
		height: game.renderer.height * 2
	});

	var simpleShader = new PIXI.Filter('', NET_SHADER);
	var tmp = new PIXI.Sprite(netTexture);
	tmp.filters = [simpleShader];
	game.renderer.render(tmp, netTexture);
}




function loadBackgroundShader()
{
	backgroundSprite = new PIXI.Sprite();
	backgroundSprite.width = game.renderer.width;
	backgroundSprite.height = game.renderer.height;

	// background from: http://clipart-library.com/clip-art/london-skyline-silhouette-png-22.htm
	var bgTex = PIXI.Texture.from("assets/background.png");
	bgTex.on('update', function(){
		backgroundSprite.filters = [new PIXI.Filter('', BACKGROUND_SHADER, {
			backgroundTex: bgTex,
			backgroundSize: new PIXI.Point(bgTex.width, bgTex.height),
			iResolution: new PIXI.Point(game.renderer.width, game.renderer.height),
			iTime: tempIterShdr,
			camPos: new PIXI.Point(0,0)
		})];
	});

	game.background.addChild(backgroundSprite);
}










///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// timer functions
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateTimer()
{
	if (questionOpening == false && questionOpen == false){
		timer++;
	}

	if (timer > nextStop){
		timer = 0;
		numOfStops++;
		questionOpening = true;
		getNextStop();
		makeQuestionBlocks(trackSettings.numberOfQuestionBlocks);
	}else{
		var b = new Block(track);
		b.create();
		track.blocks.unshift(b);
	}
}

function getNextStop()
{
	// var v = Math.max(trackSettings.questionIntervalInBlocks, track.blocks.length);
	nextStop = randomRange(
		trackSettings.questionIntervalInBlocks[0] + track.blocks.length,
		trackSettings.questionIntervalInBlocks[1] + track.blocks.length
	);
	// console.log("v: "+nextStop + " -- length: "+track.blocks.length);
}

function slowdown()
{
	openQuestion();
}
function resume()
{
	closeQuestion();
	trackSettings.speed = initSpeed;
	timeIncrementSpeed = 1.0;
}

function updateQuestionChecker()
{
	if (track.blocks.length > 3)
	{
		var pos = getNearestBlock();

		if (questionBlocks[0] == track.blocks[clamp(pos - 2, 0, track.blocks.length-1)])
		{
			slowdown();
		}
	}
}

function hideBlock(id)
{
	track.blocks[clamp(id, 0, track.blocks.length-1)].hide();
}
function unhideBlock(id)
{
	track.blocks[clamp(id, 0, track.blocks.length-1)].unhide();
}


function getNearestBlock()
{
	var d = distanceToPoint(
		cart[0].x, cart[0].y,
		game.renderer.width*2, game.renderer.height*2
	);
	var pos = 0;

	for (var i=0; i<track.blocks.length; i++){
		let nd = distanceToPoint(
			cart[0].x, cart[0].y,
			track.blocks[i].points[0].x, track.blocks[i].points[0].y
		);

		if (nd < d){
			d = nd;
			pos = i;
		}
	}

	return pos;
}








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// score stuff functions
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function incrementScore()
{
	currentScore += scoreIncrement
	if (currentScore > highScore){
		highScore = currentScore;
	}
}

function makeScoreText()
{
	let currentScoreCont = new PIXI.Container();

	currentScoreText = new PIXI.Text("", {fontFamily : SECONDARY_FONT, fontSize: 30, fill : "0x000000", align : 'center'});
	currentScoreText.anchor.set(0.5, 0);
	currentScoreCont.x = game.renderer.width/2;

	currentScoreRect = new Rectangle(
		new PIXI.Point(0, 0), new PIXI.Point(1,1), {
			color: "0xFFFFFF",
			alpha: 0.25,
		}
	);
	currentScoreCont.addChild(currentScoreRect);
	currentScoreCont.addChild(currentScoreText);
	game.ui.addChild(currentScoreCont);
}

function updateScoreText()
{
	if (currentScoreText != null){
		currentScoreText.text = "Your Score - "+ currentScore +"m";
		currentScoreRect.x =  - (currentScoreText.width*1.25)/2;
		currentScoreRect.width = currentScoreText.width*1.25;
		currentScoreRect.height = currentScoreText.height*1.25;
	}
}
