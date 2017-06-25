"use strict";
var bg;
var syncPending;

$(document).ready(function(){
  bg = browser.extension.getBackgroundPage();
  syncPending = false;
});

// load these bits of data, with the following defaults if null
function loadLocalMetadata(){
  return browser.storage.local.get({
    version : bg.version,
    lastSaved : bg.epoch
  });
}

function loadSyncMetadata(){
  return browser.storage.sync.get({
    version : bg.version,
    lastSaved : bg.epoch
  });
}

// save variables to storage
function saveOptions(force = false){
  var now = new Date();
  var metadata = loadLocalMetadata();
  var promise = metadata.then(item => {   
    if(bg.useSync){
      saveToSync(force, now, item.lastSaved);
    }
    // always save to local
    saveToLocal(now);
    bg.lastSaved = now;
  });
  return promise;
}

function saveToLocal(now){
  browser.storage.local.set({
    useSync : bg.useSync,
    notifyMe : bg.notifyMe,
    lastSaved : now,
    version : bg.version,
    storage : bg.storage
  });
}

function saveToSync(force, now, lastSavedLocal){
  if(bg.outOfSync && !force){
    notifyError("Sync save error", "The local and sync data are out of sync, please visit the options page to resolve");
    return;
  }
  // get sync version and date
  var gettingItems = loadSyncMetadata();
  gettingItems.then(item => {
    if(item.version > bg.version){
      notifyError("Sync save error", "The stored data is for a later version of this program, please update this addon.");
      return;
    }
    if((item.lastSaved > lastSavedLocal) && !force){
      bg.outOfSync = true;
      notifyError("Sync save error", "Sync data is newer then load data, please visit the options page to resolve");
      return;
    }
    browser.storage.sync.set({
      version : bg.version,
      lastSaved : now,
      storage : bg.storage
    });
  }, error => {
    notifyError("Sync save error", error.message);
  });
}

// load variables from storage
function loadOptions(force = false){
  var local = loadFromLocal();
  var promise = local.then(_ => {
    if(bg.useSync){
      loadFromSync(force);
    }
  });
  return promise;
}

function loadFromLocal(){
  var loaded = browser.storage.local.get({
    useSync : false,
    notifyMe : false,
    lastSaved : bg.epoch,
    version : bg.version,
    storage : null
  });
  var promise = loaded.then(item => {
    bg.lastSaved = item.lastSaved;
    bg.useSync = item.useSync;
    bg.notifyMe = item.notifyMe;
    bg.storage = item.storage;
  });
  return promise;
}

function loadFromSync(force){
  if(bg.outOfSync && !force){
    notifyError("Sync load error", "The local and sync data are out of sync, please visit the options page to resolve");
    return;
  }
  // get local version and date
  var metadata = loadLocalMetadata();
  metadata.then(item => {
    if(item.version > bg.version){
      notifyError("Sync load error", "The stored data is for a later version of this program, please update this addon");
      return;
    }
    if(bg.lastSaved > item.lastSaved && !force){
      notifyError("Sync load error", "Local data is newer then sync data, please visit options page to resolve");
      bg.outOfSync = true;
      return;
    }
    var loaded = browser.storage.sync.get({
      version : bg.version,
      lastSaved : bg.epoch,
      storage : null
    });
    loaded.then(item => {
      bg.lastSaved = item.lastSaved,
      bg.storage = item.storage;
    });
  }, error => {
    notifyError("Sync load error", error.message);
  });
}
