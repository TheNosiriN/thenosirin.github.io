///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// How To Play page
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadHowToPage()
{
	howToWords = [
		"Look through the functions on the cheat sheet and try to remember how they look\nWhen you are done press play game",
		"You are controlling a rollercoaster",
		"But the tracks are broken!\nQuick! Select the correct function that would fix the tracks",
		"If you get it right, congratulations! You have saved everyone!\nBut beware, there are more broken tracks to come!",
		"And if you get it wrong... Well try again"
	];

	for (var i=0; i<5; i++)
	{
		howToPages[i] = new PIXI.Container();

		var pic = PIXI.Sprite.from("assets/how to pages/page"+(i+1)+".png");
		pic.anchor.set(0.5, 0.6);
		pic.scale.x = pic.scale.y = 0.7;
		pic.x = game.renderer.width/2;
		pic.y = game.renderer.height/2;

		var txt = new PIXI.Text(howToWords[i], {fontFamily : SECONDARY_FONT, fontSize: 24, fill : "0xFFFFFF", align : 'center'});
		txt.anchor.set(0.5, 1);
		txt.x = pic.x;
		txt.y = game.renderer.height - txt.height;

		howToPages[i].addChild(pic);
		howToPages[i].addChild(txt);
	}

	howToPages[5] = new PIXI.Container();

	var txt = new PIXI.Text(
		"Beat your high score and find new functions!\nYou can access the function sheet at any\npoint of the game by clicking CS",
		{fontFamily : SECONDARY_FONT, fontSize: 40, fill : "0xFFFFFF", align : 'center'}
	);
	txt.anchor.set(0.5, 0.6);
	txt.x = game.renderer.width/2;
	txt.y = game.renderer.height/2;

	howToPages[5].addChild(txt);


	//play game
	let playGameText = new PIXI.Text("Play Now!", {fontFamily : SECONDARY_FONT, fontSize: 50, fill : "0x000000", align : 'center'});
	playGameText.width;

	let playGame = new PIXI.Container();

	playGame.x = game.renderer.width/2 - playGameText.width/2;
	playGame.y = game.renderer.height/2 + txt.height;

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

	howToPages[5].addChild(playGame);
}












///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// cheat sheet pages
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadCheatSheets()
{
	let maxWidth = 5;
	let extra = 1.125;
	let w = (game.renderer.width/1.5) / maxWidth/extra;
	let h = (w / (790/798)) * extra;

	for (var i=0; i<2; i++)
	{
		cheatSheets[i] = new PIXI.Container();

		for (var j=0; j<15; j++)
		{
			var x = (j % maxWidth) * w * extra;
			var y = Math.floor(j/maxWidth) * h * extra;

			x = (x + (maxWidth * w * extra)) - game.renderer.width/2;
			y = y + (game.renderer.height/(h/extra));

			var spr = PIXI.Sprite.from("assets/cheat sheet/"+ (i+1) +""+ (j+1) +".png");

			var rect = new Rectangle( new PIXI.Point(x/2, y/2), new PIXI.Point(w, h), {
				color: "0xFFFFFF",
				alpha: 0.8
			});

			var txt = new PIXI.Text(
				QuestionLOD.sheet[i][QuestionLOD.sheet[i].length-j-1],
				{fontFamily : TERTIARY_FONT, fontSize: 17, fill : "0x000000", align : 'center'}
			);

			spr.x = x; spr.y = y;
			spr.width = w; spr.height = h / 1.25;

			txt.anchor.set(0.5, 0.5);
			txt.x = x + w/2;
			txt.y = (y + h) - (h-spr.height)/2;

			cheatSheets[i].addChild(rect);
			cheatSheets[i].addChild(spr);
			cheatSheets[i].addChild(txt);
		}


		var titleCont = new PIXI.Container();
		var title = new PIXI.Text("CHEAT SHEET", {fontFamily : SECONDARY_FONT, fontSize: 75, fill : "0x000000", align : 'center'});
		var titleRect = new Rectangle( new PIXI.Point(0, 0), new PIXI.Point(title.height, title.width*1.25), {
			color: "0xFFFFFF",
			alpha: 0.8
		});
		titleRect.y = title.width/2 - (title.width*1.25)/2;
		titleCont.addChild(titleRect);
		titleCont.addChild(title);
		title.anchor.set(0.5, 0.5);
		title.rotation = Math.PI/2;
		title.x = title.height/2;
		title.y = title.width/2;

		titleCont.x = game.renderer.width - title.height*1.25;
		titleCont.y = game.renderer.height/2 - title.width/2;

		cheatSheets[i].addChild(titleCont);
	}
}
