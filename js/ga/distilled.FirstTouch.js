// 2010-02-16 v2
// Will Critchlow, Distilled, http://www.distilled.co.uk

// 2010-02-09 v1
// 2010-02-16 v2 - added function distilledTruncate() and distilledFirstTouch()
// 2010-08-11 v3 - added async code from Ashley (aschroder.com)

// With thanks to http://www.quirksmode.org/js/cookies.html
function distilledCheckAnalyticsCookie() {
	var cookiename = "__utma";
	var cookiecheck = 0;
	var cookies = document.cookie.split(';');
	for (var i=0;i<cookies.length;i++){
		while (cookies[i].charAt(0)==' ') cookies[i] = cookies[i].substring(1,cookies[i].length);
		if (cookies[i].indexOf(cookiename+'=') == 0){
			cookiecheck = 1;
		} //if
	} //for
	return cookiecheck;
}//distilledCheckAnalyticsCookie

//truncate to 63 characters after URL encoding. Decode before returning - to avoid encoding twice
function distilledTruncate(input) {
	var byteLength = 63;
	//we can't decode if we happen to truncate part-way through an encoded entity so if the encoded string has a % near 63 characters, we truncate before the % before decoding
	if (encodeURIComponent(input).substr(byteLength-2,1) == "%"){
		truncatedInput = decodeURIComponent(encodeURIComponent(input).substr(0,byteLength-2));
	} else if (encodeURIComponent(input).substr(byteLength-1,1) == "%"){
		truncatedInput = decodeURIComponent(encodeURIComponent(input).substr(0,byteLength-1));
	} else {
		truncatedInput = decodeURIComponent(encodeURIComponent(input).substr(0,byteLength));
	}
	return truncatedInput;
}//distilledTruncate

function distilledFirstTouch(pageTracker){
	//make sure that any error with our code will not cause general GA tracking to fail
	try {
		if (distilledCheckAnalyticsCookie() === 0){
		
			//note that setCustomVar has a max of 64 bytes for combination of variable name and value hence cryptic variable names
			//all variables are truncated to 63 characters after URL encoding to ensure we get as much information as possible in GA
			
			//l = original landing page (no query string)
			//s = original landing page query string
			//r = original referrer
			//q = if keyword information is found, this contains that part of the referrer (based on Google's list of query delimiters: http://code.google.com/apis/analytics/docs/tracking/gaTrackingTraffic.html#searchEngine)
			
			pageTracker._setCustomVar(1, "l", distilledTruncate(window.location.pathname), 1);
			pageTracker._setCustomVar(2, "s", distilledTruncate(window.location.search), 1);
			
			//for the referrer, substring out the http:// from the beginning (the first 7 characters)
			pageTracker._setCustomVar(3, "r", distilledTruncate(document.referrer.substr(7,document.referrer.length)), 1);
			pageTracker._setCustomVar(4, "q", distilledTruncate(document.referrer.match(/(?:([#]|[?]|[&]))(?:(encquery|k|p|q|qs|qt|query|rdata|search_word|szukaj|terms|text|wd|words))=[^&]*/i)[0]), 1);
			
		} //if
	} catch (err) {} // try
}//distilledFirstTouch

// Updated to work with the Google analytics Async code by Ashley (aschroder.com)
// refer to distilledFirstTouch() for comments.
function asyncDistilledFirstTouch(asyncStack){
	try {
		if (distilledCheckAnalyticsCookie() === 0){
			asyncStack.push(['_setCustomVar', 1, "l", distilledTruncate(window.location.pathname), 1]);
			asyncStack.push(['_setCustomVar', 2, "s", distilledTruncate(window.location.search), 1]);
			asyncStack.push(['_setCustomVar', 3, "r", distilledTruncate(document.referrer.substr(7,document.referrer.length)), 1]);
			asyncStack.push(['_setCustomVar', 4, "q", distilledTruncate(document.referrer.match(/(?:([#]|[?]|[&]))(?:(encquery|k|p|q|qs|qt|query|rdata|search_word|szukaj|terms|text|wd|words))=[^&]*/i)[0]), 1]);
		} 
	} catch (err) {}
}