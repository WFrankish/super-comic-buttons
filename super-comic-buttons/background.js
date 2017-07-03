"use strict";

// the url of this extension
var ourUrl;

// stored variables
var lastSaved;
var useSync;
var notifyMe;
var storage;
var period;
const version = 1.0;

// other variables
var outOfSync;
const epoch = new Date(0);
var active = false;
var unreadNo = 0;

// events
var unreadNoChange = new Event('unreadNoChange');
var reloaded = new Event('reloaded');

// alarms
const readAlarm = "readAlarm";

// some rss feeds

// Maybe I'll put some recommendations for webcomics in the wiki
var demoFeeds = [
  new Feed({name: "mspa", url: "http://www.mspaintadventures.com/rss/rss.xml", type: "rss"}), // example with lots of items
  new Feed({name: "oots", url: "http://www.giantitp.com/comics/oots.rss", type: "rss"}), // example with no dates
  new Feed({name: "megatokyo", url: "http://www.megatokyo.com/rss/", type: "rss"}), // example that currently has bad xml
  new Feed({name: "zero punctuation", url: "http://www.escapistmagazine.com/rss/videos/list/1.xml", type: "rss"}), // example sometimes with items in the future
  new Feed({name: "monster pulse", url: "http://www.monster-pulse.com/", id: "cc-comic", overrideLink: "http://www.monster-pulse.com/", type: "html"}), // html example, no root
  new Feed({name: "nuzlocke", url: "http://nuzlocke.com/pokemonhardmode.php", id: "cg_img", root: "http://nuzlocke.com/", overrideLink: "http://nuzlocke.com/pokemonhardmode.php", type: "html"}) // html example with root
]

function demo(){
  storage = [];
  demoFeeds.forEach(feed => storage.push(feed));
  moreDemoFeeds.forEach(url => storage.push(new Feed({name: url, url: url, type: "rss"})));
  save();
}

var moreDemoFeeds = [
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
"http://www.beyondthecanopy.com/feed/",
"http://nedroid.com/feed/",
"http://feeds.feedburner.com/rsspect/fJur?format=xml",
"http://www.harkavagrant.com/rssfeed.php",
"http://sssscomic.com/ssss-feed.xml",
"http://www.kiwiblitz.com/rss.php",
"http://badmachinery.com/index.xml",
"http://www.sleeplessdomain.com/rss.php",
];

// onload
$(function(){
  ourUrl = browser.runtime.getURL("");
  addEventListener('reloaded', onReload);
  load();
  browser.alarms.onAlarm.addListener(function(alarmInfo){
    if(alarmInfo.name === readAlarm){
      readAll(false);
    }
  });
});

function load(){
  return loadOptions();
}

function save(){
  var promise = saveOptions();
  promise.then(_ => onReload());
}

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
  if(!period || !period > 0){
    period = 30;
  }
  unreadNo = storage.count(f => f.unread > 0);
  refreshBadge();
  dispatchEvent(unreadNoChange);
}

function activate(silent = false){
  browser.alarms.create(readAlarm, {
    periodInMinutes: period,
    delayInMinutes: period
  });
  active = true;
  refreshBadge();
  if(!silent){
    readAll(false);
  }
}

function deactivate(){
  browser.alarms.clear(readAlarm);
  active = false;
  refreshBadge();
}

function openOne(){
  var possibles = storage.where(f => f.unread > 0).shuffled();
  if(possibles.length > 0){
    openThis(possibles[0], false);
  }
}

function openAll(){
  storage.forEach(feed => feed.open(false));
  save();
}

function openThis(feed, force = false){
  feed.open(force);
  save();
}

function createNewFeed(feed){
  storage.push(feed);
  save();
}

function readAll(force = false){
  notify("", "automatically checking for updates")
  var out = [];
  for (let i in storage){
    var promise = readSingle(storage[i], force);
    out.push(promise);
  }
  Promise.all(out).then(_ => save());
}

function readSingle(feed, force = false){
  if(force || feed.shouldRead){
    var promise = read(feed);
    return promise;
  }
}

function readThis(feed){
  var promise = readSingle(feed, true);
  promise.then(_ => save());
}

function toggleActiveness(feed){
  feed.enabled = !feed.enabled;
  save();
}

function deleteThis(feed){
  storage.remove(feed);
  save();
}

function refreshBadge(){
  if(active){
    browser.browserAction.setBadgeText({text: unreadNo.toString()});
    browser.browserAction.setBadgeBackgroundColor({color: "#ff000022"})
  } else {
    browser.browserAction.setBadgeText({text: ""});
  }
}
