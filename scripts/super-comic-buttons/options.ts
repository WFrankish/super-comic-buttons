$(initOptions);

function initOptions() : void {
    var backgroundPage : any = browser.extension.getBackgroundPage();
    var background : IBackground = backgroundPage.background;
    var storage : IStorage = new WebStorage();
    var periodNumber : JQuery<HTMLInputElement> = $("#period-number");
    var periodButton : JQuery<HTMLButtonElement> = $("#period-button");
    var syncStoreRadio : JQuery<HTMLInputElement> = $("#sync-store-radio");
    var localStoreRadio : JQuery<HTMLInputElement> = $("#local-store-radio");
    var noErrorRadio : JQuery<HTMLInputElement> = $("#no-error-radio");
    var yesErrorRadio : JQuery<HTMLInputElement> = $("#yes-error-radio");
    var forceLoadButton : JQuery<HTMLButtonElement> = $("#force-load-button");
    var forceSaveButton : JQuery<HTMLButtonElement> = $("#force-save-button");
    var forceInfoText : JQuery<HTMLParagraphElement> = $("#force-info-text");

    var options : IOptions = new Options(
        background,
        storage,
        periodNumber,
        periodButton,
        syncStoreRadio,
        localStoreRadio,
        noErrorRadio,
        yesErrorRadio,
        forceLoadButton,
        forceSaveButton,
        forceInfoText
    );
    options.restoreOptions();
}

class Options implements IOptions {
    private readonly background : IBackground;
    private readonly storage : IStorage;
    private readonly periodNumber : JQuery<HTMLInputElement>;
    private readonly periodButton : JQuery<HTMLButtonElement>;
    private readonly syncStoreRadio : JQuery<HTMLInputElement>;
    private readonly localStoreRadio : JQuery<HTMLInputElement>;
    private readonly noErrorRadio : JQuery<HTMLInputElement>;
    private readonly yesErrorRadio : JQuery<HTMLInputElement>;
    private readonly forceLoadButton : JQuery<HTMLButtonElement>;
    private readonly forceSaveButton : JQuery<HTMLButtonElement>;
    private readonly forceInfoText : JQuery<HTMLParagraphElement>;

    private syncPending : boolean;

    constructor(
        background : IBackground,
        storage : IStorage,
        periodNumber : JQuery<HTMLInputElement>,
        periodButton : JQuery<HTMLButtonElement>,
        syncStoreRadio : JQuery<HTMLInputElement>,
        localStoreRadio : JQuery<HTMLInputElement>,
        noErrorRadio : JQuery<HTMLInputElement>,
        yesErrorRadio : JQuery<HTMLInputElement>,
        forceLoadButton : JQuery<HTMLButtonElement>,
        forceSaveButton : JQuery<HTMLButtonElement>,
        forceInfoText : JQuery<HTMLParagraphElement>
    ){
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

    private get period() : number {
        return this.periodNumber.val() as number  * 1
    }
    private set period(value: number) {
        this.periodNumber.unbind("change");
        this.periodNumber.val(value)
        this.periodNumber.change(this.onPeriodChange);
    }

    restoreOptions(){
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
        var data = loadOptions(false);
        data.then(_ => {
            this.period = this.background.period;
            this.periodButton.click(this.updatePeriod);
            if(this.background.useSync){
                this.syncStoreRadio.click();
                this.localStoreRadio.change(this.switchSyncOption);
                this.syncStoreRadio.change(this.switchSyncOption);
                this.forceSaveButton.prop("disabled", false);
                this.forceSaveButton.click(this.forceLoad);
                this.forceLoadButton.prop("disabled", false);
                this.forceLoadButton.click(this.forceSave);
            } else {
                this.localStoreRadio.click();
                this.localStoreRadio.change(this.switchSyncOption);
                this.syncStoreRadio.change(this.switchSyncOption);
                this.forceSaveButton.prop("disabled", true);
                this.forceLoadButton.prop("disabled", true);
            }
            if(this.background.notifyMe){
                this.yesErrorRadio.click();
                this.yesErrorRadio.change(this.switchErrorOption);
                this.noErrorRadio.change(this.switchErrorOption);
            } else {
                this.noErrorRadio.click();
                this.noErrorRadio.change(this.switchErrorOption);
                this.yesErrorRadio.change(this.switchErrorOption);
            }
            if(this.background.outOfSync){
                this.forceInfoText.text("Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this");
                this.forceInfoText.addClass("warning");
            }
        });
    }

    private switchSyncOption(){
        if(this.background.useSync || this.syncPending){
            this.background.useSync = false;
            this.background.outOfSync = false;
            var promise = this.storage.saveOptions(false);
            promise.then(_ => {
                this.restoreOptions();
            });
        } else {
            this.syncPending = true;
            this.forceSaveButton.prop("disabled", false);
            this.forceLoadButton.click(this.saveLocalThenForceLoad);
            this.forceLoadButton.prop("disabled", false);
            this.forceSaveButton.click(this.forceSave);
            this.forceInfoText.text("To start using Firefox Sync, please choose whether to load any existing sync data, or save existing local data");
            this.forceInfoText.addClass("warning");
        }
    }

    private switchErrorOption(){
        this.background.notifyMe = !this.background.notifyMe;
        var promise = this.storage.saveOptions(false);
        promise.then(_ => {
            this.restoreOptions();
        });
    }

    private onPeriodChange(){
        if(this.period > 0){
            this.periodButton.prop("disabled", false);
        } else {
            this.periodButton.prop("disabled", true);
        }
    }

    private updatePeriod(){
        if(this.period > 0){
            this.background.period = this.period
            var promise = this.storage.saveOptions(false);
            promise.then(_ => {
                if(this.background.active){
                    this.background.deactivate();
                    this.background.activate(true);
                }
            });
        }
    }

    private saveLocalThenForceLoad(){
        browser.storage.local.set({
            useSync : true,
        }).then(_ => {
            this.forceLoad();
        });
    }

    private forceLoad(){
        this.background.useSync = true;
        var promise = this.storage.loadOptions(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }

    private forceSave(){
        this.background.useSync = true;
        var promise = this.storage.saveOptions(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }
}