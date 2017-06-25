"use strict";

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
  syncPending = false;
  syncStoreRadio = $("#syncStoreRadio");
  localStoreRadio = $("#localStoreRadio");
  noErrorRadio = $("#noErrorRadio");
  yesErrorRadio = $("#yesErrorRadio");
  forceLoadButton = $("#forceLoadButton");
  forceSaveButton = $("#forceSaveButton");
  forceInfoText = $("#forceInfoText");
  restoreOptions();
}

// load options and restore the page
function restoreOptions(){
  syncPending = false;
  syncStoreRadio.unbind("change");
  localStoreRadio.unbind("change");
  noErrorRadio.unbind("change");
  yesErrorRadio.unbind("change");
  forceSaveButton.unbind("click");
  forceLoadButton.unbind("click");
  forceInfoText.text("Manually Save/Load");
  forceInfoText.removeClass("warning");
  var data = loadOptions(false);
  data.then(_ => {
    if(useSync){
      syncStoreRadio.click();
      localStoreRadio.change(switchSyncOption);
      syncStoreRadio.change(switchSyncOption);
      forceSaveButton.prop("disabled", false);
      forceSaveButton.click(forceLoad);
      forceLoadButton.prop("disabled", false);
      forceLoadButton.click(forceSave);
    } else {
      localStoreRadio.click();
      localStoreRadio.change(switchSyncOption);
      syncStoreRadio.change(switchSyncOption);
      forceSaveButton.prop("disabled", true);
      forceLoadButton.prop("disabled", true);
    }
    if(notifyMe){
      yesErrorRadio.click();
      yesErrorRadio.change(switchErrorOption);
      noErrorRadio.change(switchErrorOption);
    } else {
      noErrorRadio.click();
      noErrorRadio.change(switchErrorOption);
      yesErrorRadio.change(switchErrorOption);
    }
    if(outOfSync){
      forceInfoText.text("Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this");
      forceInfoText.addClass("warning");
    }
  });
}

function switchSyncOption(){
  if(useSync || syncPending){
    useSync = false;
    outOfSync = false;
    var promise = saveOptions(false);
    promise.then(_ => {
      restoreOptions();
    });
  } else {
      syncPending = true;
      forceSaveButton.prop("disabled", false);
      forceLoadButton.click(forceLoad);
      forceLoadButton.prop("disabled", false);
      forceSaveButton.click(forceSave);
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