"use strict";
$(initBackground);
function initBackground() {
    var ourUrl = browser.runtime.getURL("");
    var notifications = new Notifications();
    var background = new Background(ourUrl, notifications);
    addEventListener('reloaded', background.onReload);
    background.load();
    browser.alarms.onAlarm.addListener(function (alarmInfo) {
        if (alarmInfo.name === background.readAlarm) {
            background.readAll(false);
        }
    });
}
class Background {
    constructor(ourUrl, notifications) {
        this.version = 2.0;
        this.unreadNoChange = new Event("unreadNoChange");
        this.reloaded = new Event("reloaded");
        this.readAlarm = "readAlarm";
        this.ourUrl = ourUrl;
        this.notifications = notifications;
        this.storage = new WebStorage(window, this, this.notifications);
        this.reader = new Reader(this, this.notifications);
        this.feedHandler = new FeedHandler();
    }
    load() {
        this.storage.loadOptions();
    }
    save() {
        var promise = this.storage.saveOptions();
        promise.then(_ => this.onReload());
    }
    onReload() {
        if (this.storedData === undefined) {
            this.storedData = [];
        }
        if (this.periodMinutes === undefined || this.periodMinutes <= 0) {
            this.periodMinutes = 30;
        }
        this.unreadNo = this.storedData.filter(f => f.unread > 0).length;
        this.refreshBadge();
        dispatchEvent(this.unreadNoChange);
    }
    activate(silent = false) {
        browser.alarms.create(this.readAlarm, {
            periodInMinutes: this.periodMinutes,
            delayInMinutes: this.periodMinutes
        });
        this.active = true;
        this.refreshBadge();
        if (!silent) {
            this.readAll(false);
        }
    }
    deactivate() {
        browser.alarms.clear(this.readAlarm);
        this.active = false;
        this.refreshBadge();
    }
    openOne() {
        var storedData = new MyArray(...this.storedData);
        var possibles = storedData.where(f => f.unread > 0).shuffle();
        if (possibles.length > 0) {
            this.openThis(possibles[0], false);
        }
    }
    openAll() {
        this.storedData.forEach(feed => this.feedHandler.open(feed));
        this.save();
    }
    openThis(feed, force = false) {
        this.feedHandler.open(feed, force);
        this.save();
    }
    createNewFeed(feed) {
        this.storedData.push(feed);
        this.save();
    }
    readAll(force = false) {
        this.notifications.message("automatically checking for updates");
        var out = [];
        for (let i in this.storedData) {
            var promise = this.readSingle(this.storedData[i], force);
            out.push(promise);
        }
        Promise.all(out).then(_ => this.save());
    }
    readSingle(feed, force = false) {
        if (force || this.feedHandler.shouldRead(feed)) {
            return this.reader.read(feed)
                .then(fs => this.feedHandler.consume(feed, fs));
        }
        else {
            return Promise.resolve();
        }
    }
    readThis(feed) {
        var promise = this.readSingle(feed, true);
        promise.then(_ => this.save());
    }
    toggleActiveness(feed) {
        feed.enabled = !feed.enabled;
        this.save();
    }
    deleteThis(feed) {
        var i = this.storedData.indexOf(feed);
        this.storedData.splice(i, 1);
        this.save();
    }
    refreshBadge() {
        if (this.active) {
            browser.browserAction.setBadgeText({ text: this.unreadNo.toString() });
            browser.browserAction.setBadgeBackgroundColor({ color: "#ff000022" });
        }
        else {
            browser.browserAction.setBadgeText({ text: "" });
        }
    }
}
//# sourceMappingURL=background.js.map