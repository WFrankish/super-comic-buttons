"use strict";
class WebStorage {
    constructor(backgroundWindow, background, notifications) {
        this.version = 2.0;
        this.lastSaved = new Date(0);
        this.notifyMe = false;
        this.outOfSync = false;
        this.periodMinutes = 30;
        this.useSync = false;
        this.storedData = [];
        this.backgroundWindow = backgroundWindow;
        this.background = background;
        this.notifications = notifications;
    }
    save(force = false) {
        var now = new Date();
        var metadata = this.loadLocalMetadata();
        var promise = metadata.then(item => {
            if (this.useSync) {
                var lastSaved = new Date(item.lastSaved);
                this.saveToSync(force, now, lastSaved);
            }
            // always save to local
            this.saveToLocal(now);
            this.lastSaved = now;
        }).then(_ => {
            this.backgroundWindow.dispatchEvent(this.background.reloaded);
        });
        return promise;
    }
    load(force = false) {
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
        });
        return promise;
    }
    // load these bits of data, with the following defaults if null
    loadLocalMetadata() {
        return browser.storage.local.get({
            version: this.version,
            lastSaved: new Date(0).toDateString()
        });
    }
    loadSyncMetadata() {
        return browser.storage.sync.get({
            version: this.version,
            lastSaved: new Date(0).toDateString()
        });
    }
    saveToLocal(now) {
        browser.storage.local.set({
            useSync: this.useSync,
            notifyMe: this.notifyMe,
            lastSaved: now.toDateString(),
            version: this.version,
            period: this.periodMinutes,
            storage: this.storedData
        });
    }
    saveToSync(force, now, lastSavedLocal) {
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
    loadFromLocal() {
        return browser.storage.local.get({
            useSync: false,
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
            return this.coerceLocalVersion(s);
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
    async coerceLocalVersion(storage) {
        if (storage.version === 2) {
            return storage;
        }
        else if (storage.version === undefined || storage.version === 1) {
            return this.convertLocalVersionInner();
        }
        else {
            var err = "stored data is an unrecognised version";
            this.notifications.error(err);
            throw err;
        }
    }
    loadFromSync(force) {
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
            return browser.storage.sync.get({
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
    async coerceSyncVersion(storage) {
        if (storage.version === 2) {
            return storage;
        }
        else if (storage.version === undefined || storage.version === 1) {
            return await this.convertSyncVersionInner();
        }
        else {
            var err = "stored data is an unrecognised version";
            this.notifications.error(err);
            throw err;
        }
    }
    convertLocalVersionInner() {
        return browser.storage.local.get({
            useSync: false,
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
            var converted = {
                useSync: s.useSync,
                notifyMe: s.notifyMe,
                lastSaved: this.convertDate(s.lastSaved),
                version: this.version,
                period: s.period,
                storage: s.storage.map(f => this.convertStorage(f))
            };
            return browser.storage.local.set(converted)
                .then(() => { return converted; });
        });
    }
    convertSyncVersionInner() {
        return browser.storage.sync.get({
            notifyMe: false,
            lastSaved: new Date(0).toString(),
            version: this.version,
            period: 30,
            storage: []
        })
            .then(s => {
            var converted = {
                notifyMe: s.notifyMe,
                lastSaved: this.convertDate(s.lastSaved),
                version: this.version,
                period: s.period,
                storage: s.storage.map(f => this.convertStorage(f))
            };
            return browser.storage.sync.set(converted)
                .then(() => { return converted; });
        });
    }
    convertDate(lastSaved) {
        var asDate = new Date(lastSaved);
        if (Number.isNaN(asDate.valueOf())) {
            return new Date(0).toString();
        }
        else {
            return asDate.toString();
        }
    }
    convertStorage(storage) {
        var result = {
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
        };
        return result;
    }
    convertRecent(recent) {
        var result = {
            title: recent.title,
            date: this.convertDate(recent.date),
            link: recent.link
        };
        return result;
    }
    convertMap(hours, days) {
        var result = [];
        for (var ii = 0; ii < 7; ii++) {
            var day = [];
            for (var jj = 0; jj < 24; jj++) {
                day.push(hours[jj] * days[ii]);
            }
            result.push(day);
        }
        return result;
    }
}
