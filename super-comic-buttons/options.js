"use strict";
// DOM
var periodNumber;
var periodButton;
var syncStoreRadio;
var localStoreRadio;
var noErrorRadio;
var yesErrorRadio;
var forceLoadButton;
var forceSyncButton;
var forceInfoText;
// initialisation
$(document).ready(init);
function init() {
    bg.outOfSync = false;
    periodNumber = $("#periodNumber");
    periodButton = $("#periodButton");
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
function restoreOptions() {
    syncPending = false;
    periodNumber.unbind("change");
    periodButton.unbind("click");
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
        periodNumber.change(changePeriod);
        periodNumber.val(bg.period);
        periodButton.click(updatePeriod);
        if (bg.useSync) {
            syncStoreRadio.click();
            localStoreRadio.change(switchSyncOption);
            syncStoreRadio.change(switchSyncOption);
            forceSaveButton.prop("disabled", false);
            forceSaveButton.click(forceLoad);
            forceLoadButton.prop("disabled", false);
            forceLoadButton.click(forceSave);
        }
        else {
            localStoreRadio.click();
            localStoreRadio.change(switchSyncOption);
            syncStoreRadio.change(switchSyncOption);
            forceSaveButton.prop("disabled", true);
            forceLoadButton.prop("disabled", true);
        }
        if (bg.notifyMe) {
            yesErrorRadio.click();
            yesErrorRadio.change(switchErrorOption);
            noErrorRadio.change(switchErrorOption);
        }
        else {
            noErrorRadio.click();
            noErrorRadio.change(switchErrorOption);
            yesErrorRadio.change(switchErrorOption);
        }
        if (bg.outOfSync) {
            forceInfoText.text("Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this");
            forceInfoText.addClass("warning");
        }
    });
}
function switchSyncOption() {
    if (bg.useSync || syncPending) {
        bg.useSync = false;
        bg.outOfSync = false;
        var promise = saveOptions(false);
        promise.then(_ => {
            restoreOptions();
        });
    }
    else {
        syncPending = true;
        forceSaveButton.prop("disabled", false);
        forceLoadButton.click(saveLocalThenForceLoad);
        forceLoadButton.prop("disabled", false);
        forceSaveButton.click(forceSave);
        forceInfoText.text("To start using Firefox Sync, please choose whether to load any existing sync data, or save existing local data");
        forceInfoText.addClass("warning");
    }
}
function switchErrorOption() {
    bg.notifyMe = !bg.notifyMe;
    var promise = saveOptions(false);
    promise.then(_ => {
        restoreOptions();
    });
}
function changePeriod() {
    if (periodNumber.val() > 0) {
        periodButton.prop("disabled", false);
    }
    else {
        periodButton.prop("disabled", true);
    }
}
function updatePeriod() {
    if (periodNumber.val() > 0) {
        bg.period = periodNumber.val() * 1;
        var promise = saveOptions(false);
        promise.then(_ => {
            if (bg.active) {
                bg.deactivate();
                bg.activate(true);
            }
        });
    }
}
function saveLocalThenForceLoad() {
    browser.storage.local.set({
        useSync: true,
    }).then(_ => {
        forceLoad();
    });
}
function forceLoad() {
    bg.useSync = true;
    var promise = loadOptions(true);
    promise.then(_ => {
        restoreOptions();
    });
}
function forceSave() {
    bg.useSync = true;
    var promise = saveOptions(true);
    promise.then(_ => {
        restoreOptions();
    });
}
//# sourceMappingURL=options.js.map