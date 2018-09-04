"use strict";
$(initOptions);
function initOptions() {
    var backgroundPage = browser.extension.getBackgroundPage();
    var background = backgroundPage.background;
    var storage = new WebStorage(backgroundPage, background, background.notifications);
    var periodNumber = $("#period-number");
    var periodButton = $("#period-button");
    var syncStoreRadio = $("#sync-store-radio");
    var localStoreRadio = $("#local-store-radio");
    var noErrorRadio = $("#no-error-radio");
    var yesErrorRadio = $("#yes-error-radio");
    var forceLoadButton = $("#force-load-button");
    var forceSaveButton = $("#force-save-button");
    var forceInfoText = $("#force-info-text");
    var options = new Options(background, storage, periodNumber, periodButton, syncStoreRadio, localStoreRadio, noErrorRadio, yesErrorRadio, forceLoadButton, forceSaveButton, forceInfoText);
    options.restoreOptions();
}
class Options {
    constructor(background, storage, periodNumber, periodButton, syncStoreRadio, localStoreRadio, noErrorRadio, yesErrorRadio, forceLoadButton, forceSaveButton, forceInfoText) {
        this.background = background;
        this.storage = storage;
        this.periodNumber = periodNumber;
        this.periodButton = periodButton;
        this.syncStoreRadio = syncStoreRadio;
        this.localStoreRadio = localStoreRadio;
        this.noErrorRadio = noErrorRadio;
        this.yesErrorRadio = yesErrorRadio;
        this.forceLoadButton = forceLoadButton;
        this.forceSaveButton = forceSaveButton;
        this.forceInfoText = forceInfoText;
        this.background.outOfSync = false;
    }
    get period() {
        return this.periodNumber.val() * 1;
    }
    set period(value) {
        this.periodNumber.unbind("change");
        this.periodNumber.val(value);
        this.periodNumber.change(this.onPeriodChange);
    }
    restoreOptions() {
        this.syncPending = false;
        this.periodButton.unbind("click");
        this.syncStoreRadio.unbind("change");
        this.localStoreRadio.unbind("change");
        this.noErrorRadio.unbind("change");
        this.yesErrorRadio.unbind("change");
        this.forceSaveButton.unbind("click");
        this.forceLoadButton.unbind("click");
        this.forceInfoText.text("Manually Save/Load");
        this.forceInfoText.removeClass("warning");
        var data = this.storage.loadOptions(false);
        data.then(_ => {
            this.period = this.background.period;
            this.periodButton.click(this.updatePeriod);
            if (this.background.useSync) {
                this.syncStoreRadio.click();
                this.localStoreRadio.change(this.switchSyncOption);
                this.syncStoreRadio.change(this.switchSyncOption);
                this.forceSaveButton.prop("disabled", false);
                this.forceSaveButton.click(this.forceLoad);
                this.forceLoadButton.prop("disabled", false);
                this.forceLoadButton.click(this.forceSave);
            }
            else {
                this.localStoreRadio.click();
                this.localStoreRadio.change(this.switchSyncOption);
                this.syncStoreRadio.change(this.switchSyncOption);
                this.forceSaveButton.prop("disabled", true);
                this.forceLoadButton.prop("disabled", true);
            }
            if (this.background.notifyMe) {
                this.yesErrorRadio.click();
                this.yesErrorRadio.change(this.switchErrorOption);
                this.noErrorRadio.change(this.switchErrorOption);
            }
            else {
                this.noErrorRadio.click();
                this.noErrorRadio.change(this.switchErrorOption);
                this.yesErrorRadio.change(this.switchErrorOption);
            }
            if (this.background.outOfSync) {
                this.forceInfoText.text("Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this");
                this.forceInfoText.addClass("warning");
            }
        });
    }
    switchSyncOption() {
        if (this.background.useSync || this.syncPending) {
            this.background.useSync = false;
            this.background.outOfSync = false;
            var promise = this.storage.saveOptions(false);
            promise.then(_ => {
                this.restoreOptions();
            });
        }
        else {
            this.syncPending = true;
            this.forceSaveButton.prop("disabled", false);
            this.forceLoadButton.click(this.saveLocalThenForceLoad);
            this.forceLoadButton.prop("disabled", false);
            this.forceSaveButton.click(this.forceSave);
            this.forceInfoText.text("To start using Firefox Sync, please choose whether to load any existing sync data, or save existing local data");
            this.forceInfoText.addClass("warning");
        }
    }
    switchErrorOption() {
        this.background.notifyMe = !this.background.notifyMe;
        var promise = this.storage.saveOptions(false);
        promise.then(_ => {
            this.restoreOptions();
        });
    }
    onPeriodChange() {
        if (this.period > 0) {
            this.periodButton.prop("disabled", false);
        }
        else {
            this.periodButton.prop("disabled", true);
        }
    }
    updatePeriod() {
        if (this.period > 0) {
            this.background.period = this.period;
            var promise = this.storage.saveOptions(false);
            promise.then(_ => {
                if (this.background.active) {
                    this.background.deactivate();
                    this.background.activate(true);
                }
            });
        }
    }
    saveLocalThenForceLoad() {
        browser.storage.local.set({
            useSync: true,
        }).then(_ => {
            this.forceLoad();
        });
    }
    forceLoad() {
        this.background.useSync = true;
        var promise = this.storage.loadOptions(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }
    forceSave() {
        this.background.useSync = true;
        var promise = this.storage.saveOptions(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }
}
//# sourceMappingURL=options.js.map