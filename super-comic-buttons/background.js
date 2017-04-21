"use strict";

// the url of this extension
var ourUrl;

// debug variables
var id;
var root;

// some rss feeds
var feeds = [
"http://www.mspaintadventures.com/rss/rss.xml",
"https://www.penny-arcade.com/feed",
"https://xkcd.com/rss.xml",
"http://awkwardzombie.com/awkward.php",
];

// onload
$(function(){
    ourUrl = browser.runtime.getURL("");
});

function foos(){
	var out = [];
	for (let i in feeds){
		var feed = foo(feeds[i]);
		feed.then(function(res){
			out.push(res);
		});
		console.log(`done for ${feeds[i]}`);
	}
	console.log("done");
	return out;
}

function foo(url){
    var resp = sendGetRequest(url);
    var xml = resp.then(handleResponse);
    return xml.then(function(data){
		var feed = new Feed();
        feed.list = data;
        console.log("done");
		return feed;
    });
}
