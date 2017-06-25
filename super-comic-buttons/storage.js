"use strict";

// stored variables
var lastSaved;
var useSync;
var notifyMe;
var storage;
const version = 1.0;

// other variables
var outOfSync;
const epoch = new Date(0);
var syncPending;

// load these bits of data, with the following defaults if null
function loadLocalMetadata(){
  return browser.storage.local.get({
    version : version,
    lastSaved : epoch
  });
}

function loadSyncMetadata(){
  return browser.storage.sync.get({
    version : version,
    lastSaved : epoch
  });
}

// save variables to storage
function saveOptions(force = false){
  var now = new Date();
  var metadata = loadLocalMetadata();
  var promise = metadata.then(item => {   
    if(useSync){
      saveToSync(force, now, item.lastSaved);
    }
    // always save to local
    saveToLocal(now);
    lastSaved = now;
  });
  return promise;
}

function saveToLocal(now){
  browser.storage.local.set({
    useSync,
    notifyMe,
    lastSaved : now,
    version,
    storage
  });
}

function saveToSync(force, now, lastSavedLocal){
  if(outOfSync && !force){
    notifyError("Sync save error", "The local and sync data are out of sync, please visit the options page to resolve");
    return;
  }
  // get sync version and date
  var gettingItems = loadSyncMetadata();
  gettingItems.then(item => {
    if(item.version > version){
      notifyError("Sync save error", "The stored data is for a later version of this program, please update this addon.");
      return;
    }
    if((item.lastSaved > lastSavedLocal) && !force){
      outOfSync = true;
      notifyError("Sync save error", "Sync data is newer then load data, please visit the options page to resolve");
      return;
    }
    browser.storage.sync.set({
      version,
      lastSaved : now,
      storage
    });
  }, error => {
    notifyError("Sync save error", error.message);
  });
}

// load variables from storage
function loadOptions(force = false){
  var local = loadFromLocal();
  var promise = local.then(_ => {
    if(useSync){
      loadFromSync(force);
    }
  });
  return promise;
}

function loadFromLocal(){
  var loaded = browser.storage.local.get({
    useSync : false,
    notifyMe : false,
    lastSaved : epoch,
    version : version,
    storage : null
  });
  var promise = loaded.then(item => {
    lastSaved = item.lastSaved;
    useSync = item.useSync;
    notifyMe = item.notifyMe;
    storage = item.storage;
  });
  return promise;
}

function loadFromSync(force){
  if(outOfSync && !force){
    notifyError("Sync load error", "The local and sync data are out of sync, please visit the options page to resolve");
    return;
  }
  // get local version and date
  var metadata = loadLocalMetadata();
  metadata.then(item => {
    if(item.version > version){
      notifyError("Sync load error", "The stored data is for a later version of this program, please update this addon");
      return;
    }
    if(lastSaved > item.lastSaved && !force){
      notifyError("Sync load error", "Local data is newer then sync data, please visit options page to resolve");
      outOfSync = true;
      return;
    }
    var loaded = browser.storage.sync.get({
      version : version,
      lastSaved : epoch,
      storage : null
    });
    loaded.then(item => {
      console.log(item);
      lastSaved = item.lastSaved,
      storage = item.storage;
    });
  }, error => {
    notifyError("Sync load error", error.message);
  });
}
