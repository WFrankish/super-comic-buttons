class WebStorage implements IStorage {
    private readonly backgroundWindow: Window;
    private readonly background: IBackgroundForStorage;
    private readonly notifications: INotifications;
    private readonly version = 2.0;

    private lastSaved = new Date(0);

    notifyMe = false;
    outOfSync = false;
    periodMinutes = 30;
    useSync = false;
    storedData: FeedDto[] = [];

    constructor(
        backgroundWindow: Window,
        background: IBackgroundForStorage,
        notifications: INotifications
    ) {
        this.backgroundWindow = backgroundWindow;
        this.background = background;
        this.notifications = notifications;
    }

    save(force: boolean = false): Promise<void> {
        var now = new Date();
        var metadata = this.loadLocalMetadata();
        var promise = metadata.then(item => {
            if (this.useSync) {
                var lastSaved = new Date(item.lastSaved)
                this.saveToSync(force, now, lastSaved);
            }
            // always save to local
            this.saveToLocal(now);
            this.lastSaved = now;
        }).then(_ => {
            this.backgroundWindow.dispatchEvent(this.background.reloaded);
        })
        return promise;
    }
    load(force: boolean = false): Promise<void> {
        // TODO version conversion
        var local = this.loadFromLocal();
        var promise = local.then(_ => {
            if (this.useSync) {
                return this.loadFromSync(force);
            }
            return Promise.resolve();
        }).then(_ => {
            if (this.storedData === undefined) {
                this.storedData = [];
            }
            if (this.periodMinutes === undefined || this.periodMinutes <= 0) {
                this.periodMinutes = 30;
            }
            this.backgroundWindow.dispatchEvent(this.background.reloaded);
        })
        return promise;
    }

    // load these bits of data, with the following defaults if null
    private loadLocalMetadata(): Promise<Metadata> {
        return browser.storage.local.get<Metadata>({
            version: this.version,
            lastSaved: new Date(0).toDateString()
        });
    }

    private loadSyncMetadata(): Promise<Metadata> {
        return browser.storage.sync.get<Metadata>({
            version: this.version,
            lastSaved: new Date(0).toDateString()
        });
    }

    private saveToLocal(now: Date): void {
        browser.storage.local.set({
            useSync: this.useSync,
            notifyMe: this.notifyMe,
            lastSaved: now.toDateString(),
            version: this.version,
            period: this.periodMinutes,
            storage: this.storedData
        });
    }

    private saveToSync(force: boolean, now: Date, lastSavedLocal: Date): void {
        if (this.outOfSync && !force) {
            this.notifications.error("Sync save error - The local and sync data are out of sync, please visit the options page to resolve");
            return;
        }
        // get sync version and date
        var gettingItems = this.loadSyncMetadata();
        gettingItems.then(item => {
            var lastSaved = new Date(item.lastSaved);
            if (item.version > this.version) {
                this.notifications.error("Sync save error - The stored data is for a later version of this program, please update this addon.");
                return;
            }
            if ((lastSaved > lastSavedLocal) && !force) {
                this.outOfSync = true;
                this.notifications.error("Sync save error - Sync data is newer then load data, please visit the options page to resolve");
                return;
            }
            browser.storage.sync.set({
                version: this.version,
                lastSaved: now.toDateString(),
                storage: this.storedData
            });
        }, error => {
            error("Sync save error", error.message);
        });
    }

    private loadFromLocal(): Promise<void> {
        return browser.storage.local.get<VAnyLocalStorage>({
            useSync: false,
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
                return this.coerceLocalVersion(s)
            })
            .then(item => {
                this.periodMinutes = item.period;
                var lastSaved = new Date(item.lastSaved);
                this.lastSaved = lastSaved;
                this.useSync = item.useSync;
                this.notifyMe = item.notifyMe;
                this.storedData = item.storage;
            });
    }

    private async coerceLocalVersion(storage: VAnyLocalStorage): Promise<LocalStorage> {
        if (storage.version === 2) {
            return storage as LocalStorage;
        }
        else if (storage.version === undefined || storage.version === 1) {
            return this.convertLocalVersionInner();
        } else {
            var err = "stored data is an unrecognised version"
            this.notifications.error(err);
            throw err;
        }
    }

    private loadFromSync(force: boolean): Promise<void> {
        if (this.outOfSync && !force) {
            this.notifications.error("Sync load error - The local and sync data are out of sync, please visit the options page to resolve");
            return Promise.resolve();
        }
        // get local version and date
        var metadata = this.loadLocalMetadata();
        return metadata.then(item => {
            var lastSaved = new Date(item.lastSaved);
            if (item.version > this.version) {
                this.notifications.error("Sync load error - The stored data is for a later version of this program, please update this addon");
                return Promise.resolve();
            }
            if (this.lastSaved > lastSaved && !force) {
                this.notifications.error("Sync load error - Local data is newer then sync data, please visit options page to resolve");
                this.outOfSync = true;
                return Promise.resolve();
            }
            return browser.storage.sync.get<VAnySyncStorage>({
                notifyMe: false,
                lastSaved: new Date(0).toString(),
                version: this.version,
                period: 30,
                storage: []
            })
                .then(s => {
                    return this.coerceSyncVersion(s);
                })
                .then(item => {
                    this.lastSaved = lastSaved;
                    this.storedData = item.storage;
                });
        }, error => {
            this.notifications.error("Sync load error - " + error.message);
        });
    }

    private async coerceSyncVersion(storage: VAnySyncStorage): Promise<SyncStorage> {
        if (storage.version === 2) {
            return storage as SyncStorage;
        }
        else if (storage.version === undefined || storage.version === 1) {
            return await this.convertSyncVersionInner();
        } else {
            var err = "stored data is an unrecognised version"
            this.notifications.error(err);
            throw err;
        }
    }

    private convertLocalVersionInner(): Promise<LocalStorage> {
        return browser.storage.local.get<V1LocalStorage>({
            useSync: false,
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
                var converted: LocalStorage = {
                    useSync: s.useSync,
                    notifyMe: s.notifyMe,
                    lastSaved: this.convertDate(s.lastSaved),
                    version: this.version,
                    period: s.period,
                    storage: s.storage.map(f => this.convertStorage(f))
                }

                return browser.storage.local.set(converted)
                    .then(() => { return converted })
            });
    }

    private convertSyncVersionInner(): Promise<SyncStorage> {
        return browser.storage.sync.get<V1SyncStorage>({
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
                var converted: SyncStorage = {
                    notifyMe: s.notifyMe,
                    lastSaved: this.convertDate(s.lastSaved),
                    version: this.version,
                    period: s.period,
                    storage: s.storage.map(f => this.convertStorage(f))
                }

                return browser.storage.sync.set(converted)
                    .then(() => { return converted })
            });
    }

    private convertDate(lastSaved: any): string {
        var asDate = new Date(lastSaved);
        if (Number.isNaN(asDate.valueOf())) {
            return new Date(0).toString();
        } else {
            return asDate.toString();
        }
    }

    private convertStorage(storage: V1FeedDto): FeedDto {
        var result: FeedDto = {
            name: storage.name,
            url: storage.url,
            enabled: storage.enabled === undefined ? true : storage.enabled,
            type: storage.type,
            overrideLink: storage.overrideLink,
            id: storage.id,
            recent: storage.recent.map(r => this.convertRecent(r)),
            unreadLink: storage.unreadLink,
            unread: storage.unread,
            count: storage.count,
            map: this.convertMap(storage.hourMap, storage.dayMap),
            firstRecord: this.convertDate(storage.firstRecord),
            lastRecord: storage.enabled === undefined ? undefined : this.convertDate(storage.lastRecord)
        }
        return result;
    }

    private convertRecent(recent: V1FeedItemDto): FeedItemDto {
        var result: FeedItemDto = {
            title: recent.title,
            date: this.convertDate(recent.date),
            link: recent.link
        }
        return result;
    }

    private convertMap(hours: number[], days: number[]): number[][] {
        var result = [];
        for(var ii = 0; ii < 7; ii++){
            var day = []
            for(var jj = 0; jj < 24; jj++){
                day.push(hours[jj] * days[ii])
            }
            result.push(day);
        }
        return result;
    }
}
