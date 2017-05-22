"use strict";

// stored variables
var lastSaved;
var useSync;
var notifyMe;
var storage;
var version;

// initialisation
$(document).ready(restoreOptions);

// load options and restore the page
function restoreOptions(){
  /*
  $("#addAlwaysButton").unbind("click");
  $("#addAlwaysButton").click(addToAlways);
  $("#addConditionalButton").unbind("click");
  $("#addConditionalButton").click(addToConditional);
  */
}

// save variables to storage
function saveOptions(){
  browser.storage.local.set({
    useSync,
    notifyMe,
    lastSaved : new Date(),
    version : 1.0,
    storage
  });
  if(useSync){
    // get sync version and date
    let gettingItems = browser.storage.sync.get({
      version : 1.0,
      lastSaved : new Date(0);
    });
    gettingItems.then(item => {
      if(item.version > version){
        notifyError("Sync error", "The stored data is for a later version of this program");
      }
      if(item.lastSaved > lastSaved){
        // TODO ask
        return;
      }
      browser.storage.sync.set({
        version : 1.0,
        lastSaved : new Date(),
        storage
      });
    }, error => {
      if(notifyMe){
        notifyError("Sync error", error);
      }
    });
    var syncVersion;
    var syncDate;
  }
}

// load variables from storage
function loadOptions(){
  /*chrome.storage.local.get("always", (res) => {
    if(res != null && Array.isArray(res.always)){
      always = res.always;
    } else {
      always = [];
    }
  });
  chrome.storage.local.get("block", (res) => {
    if(res != null && Array.isArray(res.block)){
      block = res.block;
    } else {
      block = [];
    }
  });
  chrome.storage.local.get("allow", (res) => {
    if(res != null && Array.isArray(res.allow)){
      allow = res.allow;
    } else {
      console.log(res);
      allow = [];
    }
  });
  chrome.storage.local.get("inBlockOnlyMode", (res) => {
    switchMode(res == null || res.inBlockOnlyMode);
  });
  chrome.runtime.getBackgroundPage((page) => {
    alwaysTemp = page.alwaysTemp;
    blockTemp = page.blockTemp;
    allowTemp = page.allowTemp;
    populateAlways();
    populateConditional(inBlockOnlyMode);
    if(!page.running){
      $("#startStopButton").val("Start Work Mode");
    } else {
      $("#startStopButton").val("Stop Work Mode");
    }
    $("#startStopButton").unbind("click");
    $("#startStopButton").click(startStop);
  });*/
}

function syncSaveOptions(){
  
}

function syncLoadOptions(){
  
}