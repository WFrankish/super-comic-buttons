"use strict";

// the url of this extension
var ourUrl;

// stored variables
var lastSaved;
var useSync;
var notifyMe;
var storage;
const version = 1.0;

// other variables
var outOfSync;
const epoch = new Date(0);
var active = false;
var unreadNo = 0;

// events
var unreadNoChange = new Event('unreadNoChange');
var reloaded = new Event('reloaded');

// some rss feeds

// I've been committing my taste in webcomics to github haven't I
var feeds = [
  new Feed({name: "mspa", url: "http://www.mspaintadventures.com/rss/rss.xml"}), // example with lots of items
  new Feed({name: "oots", url: "http://www.giantitp.com/comics/oots.rss"}), // example with no dates
  new Feed({name: "megatokyo", url: "http://www.megatokyo.com/rss/"}), // example that currently has bad xml
  new Feed({name: "zero punctuation", url: "http://www.escapistmagazine.com/rss/videos/list/1.xml"}), // example sometimes with items in the future
  new Feed({name: "monster pulse", url: "http://www.monster-pulse.com/", id: "cc-comic", overideLink: "http://www.monster-pulse.com/"}), // html example, no root
  new Feed({name: "nuzlocke", url: "http://nuzlocke.com/pokemonhardmode.php", id: "cg_img", root: "http://nuzlocke.com/", overideLink: "http://nuzlocke.com/pokemonhardmode.php"}) // html example with root
]

/*var feeds = [
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
"http://www.kiwiblitz.com/rss.php",
"http://badmachinery.com/index.xml",
"http://www.sleeplessdomain.com/rss.php",
];*/

// onload
$(function(){
  ourUrl = browser.runtime.getURL("");
  addEventListener('reloaded', onReload);
  loadOptions();
});

function onReload(){
  if(!storage){
    storage = new MyArray();
  } else {
    var temp = [];
    for (let i in storage){
      var feed = new Feed(storage[i]);
      temp.push(feed);
    }
    storage = new MyArray(...temp);
  }
}

function activate(){
  // TODO
  active = true;
}

function deactivate(){
  // TODO
  active = false;
}

function readOne(){
  unreadNo--;
  dispatchEvent(unreadNoChange);
  // TODO
}

function readAll(){
  unreadNo = 0;
  dispatchEvent(unreadNoChange);
  // TODO
}

function createNewFeed(feed){
  storage.push(feed);
}

function foos(){
  var out = [];
  for (let i in storage){
    var feed = foo(storage[i]);
    feed.then(function(res){
      out.push(res);
    });
  }
  console.log("done");
  return out;
}

function foo(feed){
  var success = read(feed);
  return success.then(data => {
    if(data){
      console.log(`done for ${feed.name}`);
    }
    return feed;
  })
}
