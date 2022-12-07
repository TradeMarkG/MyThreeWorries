//	My Three Worries -- An Internet Artwork made for the Fall 2022 OSU Art & Technology art show.
//  Forked from Endless GIF Zoom Mirrored.
//  If you fork this, please register with Giphy to get your own API key.  Thanks!
//																						- TradeMark G. / 2022.12.07

const tag = ["forget", "money", "concentrate"]
const randomTag = true;			// To start with a specific tag, set to false, then set currentTag
let currentTag = 0;			
let mirrorStyleChange = 120;	// auto-change mirroring style after this many frames (zero to disable)
let sequentialDL = false;		// If false, all 50 GIFs load in advance.  If true, they load in the background.
	// Background loading is a good idea in theory, but in practice it slows things down until everything loads.
// But when you change tags, background loading may be better than stopping to wait for 50 new GIFs to download.
const frameSkip = 0;
let bigEnough = 3.0;					// When GIFs grow this big, show a new GIF
const maxImageScale = 15.0;		// GIFs can't grow bigger than this

// // //		   Customize variables above 					// // //
// // // 	Change the ones below at your own risk:	// // //

let mainFrame;					let tempImg;
let timer = 0;					let mirrorStyle = 1;		
let images = [];				let loadedImages = [];
let imgNum = 0;					let imgLimit = 50;
let loadedGIFs = [];		let displayGIFs = [];
let GIFnum = 0;					let GIFsLoaded = 0;
let offset;							let GIF;
let erasing = false;		let erasedLoadMsg = false;
let msgFade, msgDiv;		let inputTag, tagTyping = false;
let msg2Fade, msg2Div;
let loadAnother = true, loadDelay = 0;
let debug = false;

function preload() {
	if (randomTag) currentTag = int(random(tag.length));
	giphySearch(tag[currentTag]);
}

function setup() {
	mainFrame = createCanvas(windowWidth, windowHeight);
	// createCanvas(windowWidth, windowHeight, WEBGL);
	// showMsg("loading " + tag[currentTag] + " GIFs 0%");
	for (let i = 0; i < 50; i++) {
		loadedGIFs.push(new giphyGIF());
		if (!sequentialDL) { loadedGIFs[i].getSearched(i); }
	}
	if (debug) print("lGIFs.len: " + loadedGIFs.length);
	// loadedGIFs[2].getRandomURL(tag[currentTag]);
  inputTag = createInput('');
  inputTag.position(width / 2, height / 2);
  inputTag.size(width / 4);
	inputTag.style('font-family', 'sans-serif');
	inputTag.style('font-size', (height / 10) + 'px');
	inputTag.style('font-weight', 'bold');
	inputTag.style('text-align', 'center');
	inputTag.style('z-index', '10');
	// inputTag.style('background-color', 'blue');
	inputTag.style('opacity', 0.7);
	inputTag.center();
	inputTag.hide();
	maskGIF = createGraphics(200, 200);
	maskGIF.rect(0, 100, 200, 200);
	timer = millis() + 10000;
}

function draw(){
	let tempGIF, tempGIFnum;
	translate(width / 2, height / 2);				// adjust origin for P2D vs WebGL

	if (millis() > timer) {
		timer = millis() + 30000;
		changeWorry();
	}

	if (GIFsLoaded < 48) {				// display loading percentage
		if (frameCount % 4 == 0) {		// recount loaded GIFs
			GIFsLoaded = 0;
			if (debug) print("counting loaded GIFs (fr " + frameCount + ")     " + loadedGIFs[20].url);
			for (let i = 0; i < loadedGIFs.length; i++) {
				// if (debug) print(loadedGIFs[i].img.width);
				// if (loadedGIFs[i].img.width > 1) { GIFsLoaded++; }
				if (loadedGIFs[i].tag == currentTag && !loadedGIFs[i].loading) { GIFsLoaded++; }
			}
			if (debug) print("GIFsLoaded: " + GIFsLoaded);
		}
		// showMsg("loading " + tag[currentTag] + " GIFs " + GIFsLoaded * 2 + "%");
	}
	// if (GIFsLoaded > (sequentialDL ? 0 : 30)) {			// if enough images are loaded,
		if (!erasedLoadMsg) {
			background('gray');												// get the first GIF:
			// if (loadedGIFs[GIFnum].img.width == 1) { loadedGIFs[GIFnum].getSearched(GIFsLoaded); }
			tempGIF = new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum].img);
			displayGIFs.push(tempGIF);
			// displayGIFs.push.apply(new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum]));
			erasedLoadMsg = true;
			// keyTyped();								// show valid keypresses
			// showMsg(' ');							// show valid keypresses
		}
		
		if (displayGIFs.length > 0) {					// if GIFs are playing,
			if (displayGIFs[displayGIFs.length-1].scale > bigEnough &&
					displayGIFs[displayGIFs.length-1].scale < bigEnough + 0.2) {		// when the most recent GIF is big enough,
				GIFnum = ++GIFnum % loadedGIFs.length;
				if (loadedGIFs[GIFnum].tag != currentTag) {					// does this GIF need reloading?
					loadedGIFs[GIFnum].getSearched(GIFnum);
				}
				tempGIF = new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum].img);
				displayGIFs.push(tempGIF);												// add another GIF to the display
				// displayGIFs.push.apply(new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum]));
			}
		} else {																		// if no GIFs are playing,
			GIFnum = ++GIFnum % loadedGIFs.length;
			// tempGIFnum = (GIFnum + 20) % loadedGIFs.length;
			if (loadedGIFs[GIFnum].tag != currentTag) {
				loadedGIFs[GIFnum].getSearched(GIFnum);
			}
			tempGIF = new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum].img);
			displayGIFs.push(tempGIF);												// add another GIF to the display
			// displayGIFs.push.apply(new GIFzoomer(width / 2, height / 2, loadedGIFs[GIFnum]));
		}
		if (frameSkip < 2 || frameCount % frameSkip == 0) {
			if (displayGIFs.length > 0) {
				// showMsg("\n\n" + displayGIFs.length + "\t" + GIFnum);
				for (let i = 0; i < displayGIFs.length; i++) {
					if (displayGIFs[i].fade <= 0) {			// GIF big enough?   (fading not implented)
						displayGIFs.shift();								// delete the oldest GIF displaying
					} else {
						displayGIFs[i].update();
						displayGIFs[i].draw();
					}
				}
			}
		// }
	}
	if (mirrorStyleChange > 0) { mirrorStyle = floor(frameCount / mirrorStyleChange) % 5; }
	switch (mirrorStyle) {
		case -1:			// no mirroring
			break;
		case 1:			// two-fold, bottom-to-top symmetry:
			tempImg = get(0, 0.5 * height, width, 0.5 * height);
			scale(1, -1);
			image(tempImg, 0, 0.25 * height);
			scale(1, -1);
			break;
		case 2:			// two-fold, top-to-bottom symmetry:
			tempImg = get(0, 0, width, 0.5 * height);
			scale(1, -1);
			image(tempImg, 0, -0.25 * height);
			scale(1, -1);
			break;
		case 3:			// two-fold, right-to-left symmetry:
			tempImg = get(0.5 * width, 0, 0.5 * width, height);
			scale(-1, 1);
			image(tempImg, 0.25 * width, 0);
			scale(-1, 1);
			break;
		case 4:			// two-fold, left-to-right symmetry:
			tempImg = get(0, 0, width / 2, height);
			scale(-1, 1);
			image(tempImg, -0.25 * width, 0);
			scale(-1, 1);
			break;
		case 0:			// four-fold symmetry:   (a little too abstract...)
			// }
			tempImg = get(width / 2, height / 2, width, height);
			scale(-1, 1);
			image(tempImg, width / 2, height / 2);
			scale(1, -1);
			image(tempImg, width / 2, height / 2);
			scale(-1, 1);
			image(tempImg, width / 2, height / 2);
			scale(1, -1);
			break;
	}

	showMsg();
	showMsg2();
}

function keyTyped() {
	let tempMsg = "";
	if (!tagTyping) {					// normal keypress handling:
		inputTag.hide();
		switch (key) {
			case '-':      	// Minus pressed = less images
				bigEnough += 0.5;
				if (bigEnough > maxImageScale) bigEnough = maxImageScale;
				tempMsg = "less images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
				break;
			case '+':		 		// Plus pressed = more images
			case '=':
				bigEnough -= 0.5;
				if (bigEnough < 0.5) bigEnough = 0.5;
				tempMsg = "more images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
				break;
			case 'Enter':			// Enter = user types new search tag
				// print("t.l: " + tag.length + "  " + tag[tag.length-1]);
				inputTag.value('');
				inputTag.show();
				inputTag.elt.focus();
				tagTyping = true;
				// textMsg("Type in a new tag to search:");
				tempMsg = "<h1><b> >> Type in a new tag to search:<< </b></h1>";
				break;
			case 'm':				 // M key (lower case) = mirroring style change
				mirrorStyle++;
				if (mirrorStyle > 4) { mirrorStyle = 0 }
				break;
			case 'M':				 // M key (upper case) = mirroring style reset
				mirrorStyle = -1;
				mirrorStyleChange = 0;
				tempMsg = "Mirror style auto-change deactivated; press m to manually change";
				break;
			case 'p':				 // P key = pause
				if (isLooping()) {			// if running normally,
					noLoop();							// pause
				} else {								// if paused,
					loop();								// unpause
					// background(0);				// and clear canvas
				}
				break;
			case '*':				 // Star key; status report
				// print(giphy50);
				tempMsg = "millis: " + millis() + "   fps: " + frameRate().toFixed(2) + "  --  " + displayGIFs.length +
								" of " + loadedGIFs.length + " GIFs showing  /  " + GIFsLoaded + " GIFs loaded, mirrorStyle: " + mirrorStyle;
				if (debug) print(tempMsg);
				let tempGIF = loadedGIFs[0].img;
				image(tempGIF, 0, 0);
				break;
			case "`":				// upper-left quote key = debug mode
				debug = !debug;
				tempMsg = debug ? "debug mode on" : "debug mode off";
				break;
			default:				// any other key = change search tag
				++currentTag;
				if (currentTag >= tag.length) currentTag = 0;
				tempMsg = "<br>new tag: " + tag[currentTag];
				// sequentialDL = true;
				if (sequentialDL) {
					giphySearch(tag[currentTag]);					// get 50 new search results from giphy
				} else {
					giphySearchReload(tag[currentTag]);		// get 50 new search results and download all of them now
				}
		}
		showMsg(tempMsg);
	} else {			// new search tag is currently being typed in
		inputTag.show();
		// if (debug) print(key);
		switch (key) {
			case 'Enter':			// Enter = finished typing new search tag
				// print("entered: " + inputTag.value());
				tag.push(inputTag.value());
				// print("t.l: " + tag.length + "  " + tag[tag.length-1]);
				currentTag = tag.length - 1;
				showMsg("searching new tag: " + tag[currentTag]);
				tagTyping = false;
				inputTag.hide();
				mainFrame.elt.focus();
				sequentialDL = true;
				// giphySearch(tag[currentTag]);				// get 50 new search results from giphy
				giphySearchReload(tag[currentTag]);				// get 50 new search results from giphy
				break;
			case 'Esc':				// Esc = abort typing in a search tag
				tagTyping = false;
				inputTag.hide();
				mainFrame.elt.focus();
				break;
		}
	}
}

function changeWorry() {
	++currentTag;
	if (currentTag >= tag.length) currentTag = 0;
	// tempMsg = "<br>";
	showMsg2(currentTag + 1);
	// sequentialDL = true;
	if (sequentialDL) {
		giphySearch(tag[currentTag]);					// get 50 new search results from giphy
	} else {
		giphySearchReload(tag[currentTag]);		// get 50 new search results and download all of them now
	}
}
function mouseClicked() {
	key = ' ';
	keyTyped();
}

function showMsg(tempMsg) {		// a more WebGL-friendly showMsg
	if (msgDiv == null) {
		msgDiv = createDiv();
		msgDiv.style('font-family', 'sans-serif');
		msgDiv.style('font-size', '18px');
		msgDiv.style('font-weight', 'bold');
		// msgDiv.style('color', 'white');
		msgDiv.style('position', 'fixed');
		msgDiv.style('top', '20px');
		msgDiv.style('left', '20px');
	}
	if (tempMsg != null) {			// new message to show
		tempMsg += "<br><br>press Minus or Plus for more or less images <br>any other key to change the search tag (" + tag[currentTag] + ")";
		msgDiv.html(tempMsg);
		msgFade = 1.0;
	}
	msgFade = msgFade > 0.01 ? msgFade - 0.01 : 0;
	msgDiv.style("opacity", msgFade);
}

function showMsg2(tempMsg) {		// a more WebGL-friendly showMsg
	if (msg2Div == null) {
		msg2Div = createDiv();
		msg2Div.style('font-family', 'sans-serif');
		msg2Div.style('font-size', '60px');
		msg2Div.style('font-weight', 'bold');
		// msg2Div.style('color', 'white');
		msg2Div.style('position', 'fixed');
		msg2Div.style('bottom', '20px');
		msg2Div.style('right', '20px');
	}
	if (tempMsg != null) {			// new message to show
		// tempMsg += "<br><br>press Minus or Plus for more or less images <br>any other key to change the search tag (" + tag[currentTag] + ")";
		msg2Div.html(tempMsg);
		msg2Fade = 1.0;
	}
	msg2Fade = msg2Fade > 0.01 ? msg2Fade - 0.01 : 0;
	msg2Div.style("opacity", msg2Fade);
}

class GIFzoomer {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
		this.scale =  0.1;
		this.scaleInc = 0.1;
    this.fade = 10;
		this.rot = 0;
		if (frameCount % 2 == 0) {
			this.rotInc = 1/50;
		} else {
			this.rotInc = -1/50;
		}
  }

  update() {
		this.scale += this.scaleInc;
		if (this.scale < 0.5) this.fade = map(this.scale, 0, 0.5, 0, 255);
		if (this.scale > maxImageScale - 1) this.fade = map(this.scale, maxImageScale - 1, maxImageScale, 255, 0);
		this.rot += this.rotInc;
	}
	
	draw() {
		imageMode(CENTER);
		// this.img.mask(maskGIF);
		// translate(this.x, this.y);					// uncomment for non-WEBGL canvas
		// push();
		// scale(-this.scale);
		// image(this.img, 0, 0);
		// pop();
		push();
		rotate(this.rot);
		scale(this.scale);
		image(this.img, 0, 0);
		pop();
	}
}