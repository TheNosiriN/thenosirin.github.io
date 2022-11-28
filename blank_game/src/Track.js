///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// Track realted stuff
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getNoise(x)
{
	let up = trackSettings.tendencyToGoUp;
	up = (1.0-up)/2 + 0.5;
	let y = noise.noise2D(x * trackSettings.frequency, 0) * up + (1.0-up);
	return y * trackSettings.amplitude;
}






function makeCarts()
{
	cart.length = 0;
	cart.push(PIXI.Sprite.from('assets/cartP1.png'));
	cart.push(PIXI.Sprite.from('assets/cartP2.png'));

	for (var i=0; i<2; i++){
		game.stage.addChild(cart[i]);
		cart[i].scale.x = cart[i].scale.y = 0.5;
		cart[i].anchor.x = cart[i].anchor.x = 0.5;
		cart[i].anchor.y = cart[i].anchor.y = 1;
	}
}






class Track
{
	constructor(p, questions)
	{
		this.realP = p || new PIXI.Point(0, game.renderer.height/2);
		this.questions = questions || true;
		this.pointer = this.realP.clone();
		this.points = [];
		this.blocks = [];
		this.lastPointsLength = 0;
		this.totalLength = 0;
	}

	updateTrack()
	{
		if (this.pointer.x < (camPos.x + camDim.x + trackSettings.blockLength)){
			this.movePointer();
		}

		if (this.blocks.length > 0){
			if (this.blocks[this.blocks.length-1].points[0].x < camPos.x - trackSettings.blockLength){
				this.removeFirstBlock();
			}
		}

		this.totalLength = this.points.length + this.lastPointsLength;
	}

	getPoint(index)
	{
		// var newIndex = 0;
		// if (index - this.lastPointsLength >= MAX_POINTS_LENGTH)
		// {
		// 	this.lastPointsLength = this.points.length;
		// 	this.points = this.points.slice(index, this.points.length);
		//
		// 	newIndex = this.lastPointsLength - index;
		//
		// 	console.log(this.points.length+" "+this.lastPointsLength+" "+index+" "+newIndex);
		//
		// 	return this.points[0];
		// }else{
		// 	newIndex = index;
		// }

		index = clamp(index, 0, this.points.length - 1);
		var p = this.points[index];
		return p;
	}

	movePointer()
	{
		updateTimer();
	}

	removeFirstBlock()
	{
		this.blocks[this.blocks.length-1].hide();
		delete this.blocks[this.blocks.length-1];
		this.blocks.length--;
	}
}





class Block
{
	constructor(t, q, c)
	{
		this.track = t;
		this.questionState = q || false;
		this.color = c || "0x000000";
		this.points = [];
		this.lines = [];
		this.stands = [];

		this.hidden = false;
	}

	create()
	{
		let increment = trackSettings.blockLength/trackSettings.resolution;

		for (var i=0; i<trackSettings.resolution; i++)
		{
			this.points.push(this.track.pointer.clone());
			this.track.points.push(this.track.pointer.clone());

			this.track.pointer.x += increment;

			if (this.questionState == true){
				this.track.pointer.y = (initQY-firstY) + getFunction(initQX/trackSettings.resolution);
				initQX += trackSettings.blockLength/trackSettings.resolution;
			}else{
				this.track.pointer.y -= getNoise(this.track.pointer.x/trackSettings.resolution);
			}

			if (this.points.length > 1)
			{
				var l = new Line( [
					this.points[this.points.length - 1], this.points[this.points.length - 2]
				], 15, this.color );
				this.lines.push(l);


				if (this.track.pointer.x % (increment*10) == 0)
				{
					var s = new PIXI.Container();
					var pnt1 = this.points[this.points.length - 1];
					var pnt2 = this.points[this.points.length - 2];

					// var tmp = new PIXI.Sprite(netTexture);
					// tmp.x = pnt1.y <= pnt2.y ? 0 : -(increment*10)*2;
					// tmp.y = 0;
					// s.addChild(tmp);

					s.addChild(new Line( [
						new PIXI.Point(0, 0),
						new PIXI.Point(pnt1.y <= pnt2.y ? increment*10 : -increment*10, 0)
					] ));

					s.addChild(new Line( [
						new PIXI.Point(0, 0),
						new PIXI.Point(0, game.renderer.height*10)
					] ));

					s.x = pnt1.x;
					s.y = pnt1.y;

					game.stage.addChild(s);
					this.stands.push(s);
				}


				game.stage.addChild(l);
			}
		}
	}

	unhide()
	{
		for (var i=0; i<this.stands.length; i++){
			game.stage.addChild(this.stands[i]);
		}
		for (var i=0; i<this.lines.length; i++){
			game.stage.addChild(this.lines[i]);
		}
		this.hidden = false;
	}

	hide()
	{
		for (var i=0; i<this.stands.length; i++){
			game.stage.removeChild(this.stands[i]);
		}
		for (var i=0; i<this.lines.length; i++){
			game.stage.removeChild(this.lines[i]);
		}
		this.hidden = true;
	}
}
