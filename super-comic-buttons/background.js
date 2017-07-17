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
