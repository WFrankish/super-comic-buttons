class WebStorage implements IStorage {
    private readonly backgroundWindow : Window;
    private readonly background : IBackgroundForStorage;
    private readonly notifications : INotifications;

    private syncPending : boolean;

    constructor(
        backgroundWindow : Window,
        background : IBackgroundForStorage,
        notifications : INotifications
    ){
        this.backgroundWindow = backgroundWindow;
        this.background = background;
        this.syncPending = false;
        this.notifications = notifications;
    }

    saveOptions(force : boolean = false) : Promise<void> {
        var now = new Date();
        var metadata = this.loadLocalMetadata();
        var promise = metadata.then(item => {   
            if(this.background.useSync){
                var lastSaved = new Date(item.lastSaved)
                this.saveToSync(force, now, lastSaved);
            }
            // always save to local
            this.saveToLocal(now);
            this.background.lastSaved = now;
        });
        return promise;
    }
    loadOptions(force : boolean = false) : Promise<void> {
        var local = this.loadFromLocal();
        var promise = local.then(_ => {
            if(this.background.useSync){
                return this.loadFromSync(force);
            }
            return Promise.resolve();
        });
        var promise2 = promise.then(_ => {
            this.backgroundWindow.dispatchEvent(this.background.reloaded);
        });
        return promise2;
    }

    // load these bits of data, with the following defaults if null
    private loadLocalMetadata() : Promise<Metadata> {
        return browser.storage.local.get<Metadata>({
            version : this.background.version,
            lastSaved : new Date(0).toDateString()
        });
    }

    private loadSyncMetadata() : Promise<Metadata> {
        return browser.storage.sync.get<Metadata>({
            version : this.background.version,
            lastSaved : new Date(0).toDateString()
        });
    }

    private saveToLocal(now : Date) : void {
        browser.storage.local.set({
            useSync : this.background.useSync,
            notifyMe : this.background.notifyMe,
            lastSaved : now.toDateString(),
            version : this.background.version,
            period: this.background.period,
            storage : this.background.storedData as FeedDto[]
        });
    }

    private saveToSync(force : boolean, now : Date, lastSavedLocal : Date) : void {
        if(this.background.outOfSync && !force){
            this.notifications.error("Sync save error - The local and sync data are out of sync, please visit the options page to resolve");
            return;
        }
        // get sync version and date
        var gettingItems = this.loadSyncMetadata();
        gettingItems.then(item => {
            var lastSaved = new Date(item.lastSaved);
            if(item.version > this.background.version){
                this.notifications.error("Sync save error - The stored data is for a later version of this program, please update this addon.");
                return;
            }
            if((lastSaved > lastSavedLocal) && !force){
                this.background.outOfSync = true;
                this.notifications.error("Sync save error - Sync data is newer then load data, please visit the options page to resolve");
                return;
            }
            browser.storage.sync.set({
                version : this.background.version,
                lastSaved : now.toDateString(),
                storage : this.background.storedData
            });
        }, error => {
            error("Sync save error", error.message);
        });
    }

    private loadFromLocal() : Promise<void> {
        var loaded = browser.storage.local.get<LocalStorage>({
            useSync : false,
            notifyMe : false,
            lastSaved : new Date(0).toString(),
            version : this.background.version,
            period : 30,
            storage : []
        });
        var promise = loaded.then(item => {
            this.background.period = item.period;
            var lastSaved = new Date(item.lastSaved);
            this.background.lastSaved = lastSaved;
            this.background.useSync = item.useSync;
            this.background.notifyMe = item.notifyMe;
            this.background.storedData = item.storage;
        });
        return promise;
    }

    private loadFromSync(force : boolean) : Promise<void> {
        if(this.background.outOfSync && !force){
            this.notifications.error("Sync load error - The local and sync data are out of sync, please visit the options page to resolve");
            return Promise.resolve();
        }
        // get local version and date
        var metadata = this.loadLocalMetadata();
        return metadata.then(item => {
            var lastSaved = new Date(item.lastSaved);
            if(item.version > this.background.version){
                this.notifications.error("Sync load error - The stored data is for a later version of this program, please update this addon");
                return Promise.resolve();
            }
            if(this.background.lastSaved > lastSaved && !force){
                this.notifications.error("Sync load error - Local data is newer then sync data, please visit options page to resolve");
                this.background.outOfSync = true;
                return Promise.resolve();
            }
            var loaded = browser.storage.sync.get({
                version : this.background.version,
                lastSaved : new Date(0).toDateString(),
                storage : []
            });
            var promise = loaded.then(item => {
                this.background.lastSaved = lastSaved;
                this.background.storedData = item.storage;
            });
            return promise;
        }, error => {
            this.notifications.error("Sync load error - " + error.message);
        });
    }
}
