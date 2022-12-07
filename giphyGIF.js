var giphy50 = null;			// stores 50 search results from giphy
const apiKey = ["Ln1OMDKTMpwmS1AX3OnlmVBfPsuSEkje", "A6MgOoK9jJ0wFHnuM3rI9GzXLkrmAChZ", 
								"cSsLBM6hA6jGEF5CySVunnXgEviMsWwF", "fpK8CwaWa9vraD6NFgEAjHMfnOTgvhZr"];
let currentKey = 0;

class giphyGIF {
	constructor(bandwidth) {
		this.img = createImage(1, 1);
		this.url;
		this.bandwidth = 0;			// bandwidth vs. quality choice for downloads:
						// 0 = low bandwidth & quality 		(fixed_width GIFs)
						// 1 = medium bandwidth & quality (downsized GIFs)
						// 2 = high bandwidth & quality 	(original GIFs)
				// higher quality means more pixels, and more CPU demand (might slow your sketch down)
		if (bandwidth != null) { this.bandwidth = bandwidth; }
		this.tag;
		this.loading = false;
		// this.getRandom();			// auto-download a random sticker upon creation
	}

	getSearched(urlNum) {		// download a GIF from the giphy search results
		if (debug) {
			print("getSearched: " + urlNum);
			// print(giphy50);
		}
		if (giphy50 != null) {
			if (giphy50.data != undefined) {			// does giphy50 have search results?
				if (giphy50.data.length - 1 >= urlNum) {		// like, -enough- search results?
					if (!sequentialDL || (sequentialDL && loadAnother)) {
					// if (!sequentialDL || (sequentialDL)) {
						// this.tag = currentTag;
						if (debug) { print("getting for bw " + this.bandwidth); }
						this.loading = true;
						loadAnother = false;
						let doneLoading = img => { this.loading =  false; loadAnother = true };
						switch (this.bandwidth) {
							case 0:
								this.img = loadImage(giphy50.data[urlNum].images.fixed_width.url, doneLoading, doneLoading);
								break;
							case 1:
								this.img = loadImage(giphy50.data[urlNum].images.downsized.url, doneLoading, doneLoading);
								break;
							case 2:
								this.img = loadImage(giphy50.data[urlNum].images.original.url, doneLoading, doneLoading);
								break;
						}
						this.tag = currentTag;
					}
				}
			}
		}
	}
	
	getRandom(searchTag) { 		// download a new random sticker
		const api = "https://api.giphy.com/v1/stickers/random?&api_key=";
		let url2 = api + apiKey[currentKey] + "&tag=" + searchTag; 	//concatenate api call
		switch (this.bandwidth) {
			case 0:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.fixed_width.url;
													this.img = loadImage(this.url);}, 
								 loadError);
				break;
			case 1:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.downsized.url;
													this.img = loadImage(this.url);}, 
								 loadError);
				break;
			case 2:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.original.url;
													this.img = loadImage(this.url);}, 
								 loadError);
				break;
		}
		this.tag = currentTag;
		// loadJSON(url2, 
		// 				 // gURL => {this.url = gURL.data.images.fixed_width.url;
		// 				 // gURL => {this.url = gURL.data.images.downsized.url;
		// 				 gURL => {this.url = gURL.data.images.original.url;
		// 									this.img = loadImage(this.url);}, 
		// 									// this.img = createImg(this.url, "GIF");			// createImg isn't working as expected...
		// 									// print(this.img);
		// 				 				// },
		// 								  // this.img.hide();}, 
		// 				 loadError);
	}

	getRandomURL(searchTag) { 		// download a new random sticker, but just the URL
		const api = "https://api.giphy.com/v1/stickers/random?&api_key=";
		let url2 = api + apiKey[currentKey] + "&tag=" + searchTag; 	//concatenate api call
		switch (this.bandwidth) {
			case 0:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.fixed_width.url;}, 
								 loadError);
				break;
			case 1:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.downsized.url;}, 
								 loadError);
				break;
			case 2:
				loadJSON(url2, 
								 gURL => {this.url = gURL.data.images.original.url;}, 
								 loadError);
				break;
		}
		this.tag = currentTag;
		// loadJSON(url2, 
		// 				 gURL => {this.url = gURL.data.images.fixed_width.url;
		// 				 // gURL => {this.url = gURL.data.images.downsized.url;
		// 				 // gURL => {this.url = gURL.data.images.original.url;
		// 									// this.img = loadImage(this.url);}, 
		// 									// this.img = createImg(this.url, "GIF");			// createImg isn't working as expected...
		// 									// print(this.img);
		// 				 				},
		// 								  // this.img.hide();}, 
		// 				 loadError);
	}

		// fetch(url2)		//// never have gotten this to work quite right: ////
		// 	.then(function(response){return response.json()})
		// 	.then(function(data){
		// 		// console.log(data.data.image_original_url)
		// 		print("d.d...: " + data.data.images.fixed_width.url)
		// 		// createImg(data.data.images.original.url, tag, function(){this.position(x,y)});
		// 		// this.img = loadImage(data.data.images.fixed_width.url);
		// 		return data.data.images.fixed_width.url
		// 	  })
		// 	.then(function(data){
		// 		this.url = data;
		// 		print("this.url: " + this.url);
		// 		return giphyImg
		// 	})
		// 	.catch(function(error){
		// 		return console.log(error)
		// 	})
		// print("got: " + this.url);
}	// end class giphyGIF 

function giphySearch(searchTag) {			// giphy search API, returns 50 results with URLs
	offset = int(random(100));
	let url = "https://api.giphy.com/v1/stickers/search?&api_key=" + apiKey[currentKey] + 
						"&offset=" + offset + "&q=" + searchTag; 	//concatenate api call
	if (debug) print("giphySearch: " + searchTag);
	GIFsLoaded = 0;
	giphy50 = null;
	giphy50 = loadJSON(url, sRes => {giphy50 = sRes}, loadError);
	// print(giphy50);
}

function giphySearchReload(searchTag) {			// giphy search API, returns 50 results with URLs
	offset = int(random(100));
	let url = "https://api.giphy.com/v1/stickers/search?&api_key=" + apiKey[currentKey] + 
						"&offset=" + offset + "&q=" + searchTag; 	//concatenate api call
	if (debug) print("giphySearch: " + searchTag);
	GIFsLoaded = 0;
	giphy50 = null;
	giphy50 = loadJSON(url, sRes => {giphy50 = sRes;
																	 // loadedGIFs = [];
																		for (let i = 0; i < 50; i++) {
																			// loadedGIFs.push(new giphyGIF());
																			loadedGIFs[i].getSearched(i);
																		}
																	}, loadError);
	// print(giphy50);
}

function loadError(errMsg) {
	print("load error: " + errMsg);
	++currentKey;
	if (currentKey >= apiKey.length) currentKey = 0;
	print("...API daily limit reached?  Let's try another API key:  " + apiKey[currentKey]);
}