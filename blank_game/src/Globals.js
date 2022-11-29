///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
//// Game globals and settings
////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// this is what one second is in the game, it's used like delta_time * ONE_SECOND
const ONE_SECOND = 1/60;


// font family names
const PRIMARY_FONT = "Code-Bold";
const SECONDARY_FONT = "Krungthep";
const TERTIARY_FONT = "Open Sans";


// Increase startSpeed to increase speed of the rollercoaster, non-integers may cause jittering,
// should not be less than 0.5
var startSpeed = 2;

// don't change this!! Its the speed the cart reduces to when facing a question
var reducedSpeed = 0.02;

// number of points you get after completing a question
var scoreIncrement = 100;

// number of points it takes to increase your speed
var speedInterval = scoreIncrement * 2;

// scale to zoom out to when a question appears
var zoomScale = 0.7;

// speed of the zoom out effect
var zoomSpeed = 0.015;


// track settings
var trackSettings = {
	// frequency of a block, lower value = smoother track, higher value = rough track
	frequency: 0.1,

	// amplitude of the tracks, i.e. The highest amount a block add to the height of the track at a time
	amplitude: 10,

	// number of points used to represent a block, more points = more precision = less performance
	resolution: 50,

	// track speed, this variable will be modified during the game
	speed: initSpeed,

	// actual block length in view space pixels
	blockLength: 200,

	// range of blocks it takes to spawn a new question after the length of the visible blocks on the screen
	questionIntervalInBlocks: [10, 30],

	//  number of track blocks used to represent a question, ideally should be 5 or 6
	numberOfQuestionBlocks: 5,

	// 0 means ride normally, 1 means always ride up, never go down
	tendencyToGoUp: 0.2,
}


// canvas
const canvas = document.getElementById("canvas");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;


// game general globals
var game = {};
var noise;
var track;
var initSpeed = 0;
var gameStarted = false;
var gameIsPaused = false;
var currentAbsPoint = 0;
var target = null;
var countDownForStart = 0;
var countDownForStartText;
var countDownForStartRect;
var timeIncrementSpeed = 1;


// camera
var camPos;
var camDim;
var camScale;


// Menu Screen
var tempIter = 0;
var menuScreenOn = false;
var currentMenu = null;


// cheat sheet
var cheatSheetIndex = 0;
var cheatSheets = [];


// how to page
var howToPageIndex = 0;
var howToPages = [];
var howToWords;


// Questions
var questionBlocks = [];
var gotlastRight = true;
var questionOpen = false;
var questionOpening = false;
var runCountDown = false;
var questionIndex = 0;
var countAtAnswer = 0;
var countdown = 0;
var countdownCont;
var countdownRect;
var countdownText;
var firstY = 0;
var initQX = 0;
var initQY = 0;


// question bar
var questionBar;
var buttons = [];
var buttonTextureIdle;
var buttonTextureRight;
var buttonTextureWrong;


// cart global
var cart = [];


// shader globals
var netTexture = null;
var backgroundTexture = null;
var backgroundSprite;
var tempIterShdr = 0;
var BACKGROUND_SHADER = "";
var NET_SHADER = "";


// timer globals
var stop = 0;
var timer = 0;
var nextStop = 0;
var numOfStops = 0;


// score handler globals
var highScore = 0;
var currentScore = 0;
var currentScoreText = null;
var currentScoreRect;


// developer keys
var keys = {
	vk_T: false
};
