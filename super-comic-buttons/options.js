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

// DOM
var syncStoreRadio;
var localStoreRadio;
var noErrorRadio;
var yesErrorRadio;
var forceLoadButton;
var forceSyncButton;
var forceInfoText;

// initialisation
$(document).ready(init);

function init(){
  outOfSync = false;
  syncStoreRadio = $("#syncStoreRadio");
  localStoreRadio = $("#loadStoreRadio");
  noErrorRadio = $("#noErrorRadio");
  yesErrorRadio = $("#yesErrorRadio");
  forceLoadButton = $("#forceLoadButton");
  forceSaveButton = $("#forceSaveButton");
  forceInfoText = $("#forceInfoText");
  restoreOptions();
}

// load options and restore the page
function restoreOptions(){
  syncStoreRadio.unbind("change");
  localStoreRadio.unbind("change");
  noErrorRadio.unbind("change");
  yesErrorRadio.unbind("change");
  forceSaveButton.unbind("click");
  forceSaveButton.removeClass("glow");
  forceLoadButton.unbind("click");
  forceSaveButton.removeClass("glow");
  forceInfoText.text("Manually Save/Load");
  forceInfoText.removeClass("warning");
  var data = loadOptions(false);
  data.then(_ => {
    if(useSync){
      syncStoreRadio.click();
      localStoreRadio.change(switchSyncOption);
      forceSaveButton.prop("disabled", false);
      forceSaveButton.click(forceLoad);
      forceLoadButton.prop("disabled", false);
      forceLoadButton.click(forceSave);
    } else {
      localStoreRadio.click();
      syncStoreRadio.change(switchSyncOption);
      forceSaveButton.prop("disabled", true);
      forceLoadButton.prop("disabled", true);
    }
    if(notifyMe){
      yesErrorRadio.click();
      noErrorRadio.change(switchErrorOption);
    } else {
      noErrorRadio.click();
      yesErrorRadio.change(switchErrorOption);
    }
    if(outOfSync){
      forceInfoText.text("Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this");
      forceInfoText.addClass("warning");
    }
  });
}

function switchSyncOption(){
  if(useSync){
    useSync = false;
    outOfSync = false;
    var promise = saveOptions(false);
    promise.then(_ => {
      restoreOptions();
    });
  } else {
      forceSaveButton.prop("disabled", false);
      forceLoadButton.click(forceLoad);
      forceSaveButton.addClass("glow");
      forceLoadButton.prop("disabled", false);
      forceSaveButton.click(forceSave);
      forceLoadButton.addClass("glow");
      forceInfoText.text("To start using Firefox Sync, please choose whether to load any existing sync data, or save existing local data");
      forceInfoText.addClass("warning");
  }
}

function switchErrorOption(){
  notifyMe = !notifyMe;
  var promise = saveOptions(false);
  promise.then(_ => {
    restoreOptions();
  });
}

function forceLoad(){
  useSync = true;
  var promise = loadOptions(true);
  promise.then(_ => {
    restoreOptions();
  });
}

function forceSave(){
  useSync = true;
  var promise = saveOptions(true);
  promise.then(_ => {
    restoreOptions();
  });
}


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
