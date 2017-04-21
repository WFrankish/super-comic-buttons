"use strict";

// the url of this extension
var ourUrl;

// debug variables
var id;
var root;

// some rss feeds
var feeds = [
"http://www.mspaintadventures.com/rss/rss.xml",
"http://paradoxspace.com/rss.atom",
"http://www.gunnerkrigg.com/rss.xml",
"http://xkcd.com/rss.xml",
"http://what-if.xkcd.com/feed.atom",
"http://drmcninja.com/feed/",
"http://awkwardzombie.com/awkward.php",
"http://cucumber.gigidigi.com/feed/",
"http://penny-arcade.com/feed",
"http://www.girlgeniusonline.com/ggmain.rss",
"http://feeds.feedburner.com/AvasDemon?format=xml",
"http://blindsprings.com/feed",
"http://mokepon.smackjeeves.com/rss/",
"http://www.paranatural.net/rss.php",
"http://www.vibecomic.com/rss.php",
"http://thepunchlineismachismo.com/feed",
"http://trenchescomic.com/feed",
"http://campcomic.com/rss",
"http://www.giantitp.com/comics/oots.rss",
"http://www.beyondthecanopy.com/feed/",
"http://nedroid.com/feed/",
"http://feeds.feedburner.com/rsspect/fJur?format=xml",
"http://www.megatokyo.com/rss/",
"http://www.harkavagrant.com/rssfeed.php",
"http://www.escapistmagazine.com/rss/videos/list/1.xml",
"http://sssscomic.com/ssss-feed.xml",
"http://www.kiwiblitz.com/rss.php"
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
	return out;
}

function foo(url){
    var resp = sendGetRequest(url);
    var xml = resp.then(handleResponse);
    return xml.then(function(data){
		var feed = new Feed();
        feed.consume(data.splice(5));
		feed.updateUnread();
        feed.consume(data);
		return feed;
    });
}
