$(initBackground);



function initBackground() {
    var ourUrl = browser.runtime.getURL("");
    var notifications = new Notifications();
    var background: IBackground = new Background(ourUrl, notifications);

    addEventListener(background.reloaded.type, background.onReload);
    browser.alarms.onAlarm.addListener(function (alarmInfo) {
        if (alarmInfo.name === background.readAlarm) {
            background.readAll(false);
        }
    });
}

class Background implements IBackground {
    private readonly reader: IReader;
    
    readonly feedHandler: IFeedHandler;
    readonly storage: IStorage;
    readonly notifications: INotifications;
    readonly ourUrl: string;

    readonly unreadNoChange = new Event("unreadNoChange");
    readonly reloaded = new Event("reloaded");

    readAlarm = "readAlarm"
    active = false;
    unreadNo = 0;

    constructor(
        ourUrl: string,
        notifications: INotifications
    ) {
        this.ourUrl = ourUrl;
        this.notifications = notifications;
        this.storage = new WebStorage(window, this, this.notifications);
        this.storage.load();
        this.reader = new Reader(this, this.notifications);
        this.feedHandler = new FeedHandler();
    }

    onReload(): void {
        this.unreadNo = this.storage.storedData.filter(f => f.unread > 0).length;
        this.refreshBadge();
        dispatchEvent(this.unreadNoChange);
    }

    activate(silent: boolean = false): void {
        browser.alarms.create(this.readAlarm, {
            periodInMinutes: this.storage.periodMinutes,
            delayInMinutes: this.storage.periodMinutes
        });
        this.active = true;
        this.refreshBadge();
        if (!silent) {
            this.readAll(false);
        }
    }

    deactivate(): void {
        browser.alarms.clear(this.readAlarm);
        this.active = false;
        this.refreshBadge();
    }

    openOne(): void {
        var storedData = new MyArray(...this.storage.storedData);
        var possibles = storedData.where(f => f.unread > 0).shuffle();
        if (possibles.length > 0) {
            this.openThis(possibles[0], false);
        }
    }

    openAll(): void {
        this.storage.storedData.forEach(feed => this.feedHandler.open(feed));
        this.storage.save();
    }

    openThis(feed: FeedDto, force = false): void {
        this.feedHandler.open(feed, force);
        this.storage.save();
    }

    createNewFeed(feed: FeedDto) {
        this.storage.storedData.push(feed);
        this.storage.save();
    }

    readAll(force: boolean = false) {
        this.notifications.message("automatically checking for updates")
        var out: Promise<any>[] = [];
        for (let i in this.storage.storedData) {
            var promise = this.readSingle(this.storage.storedData[i], force);
            out.push(promise);
        }
        Promise.all(out).then(_ => this.storage.save());
    }

    private readSingle(feed: FeedDto, force = false): Promise<any> {
        if (force || this.feedHandler.shouldRead(feed)) {
            return this.reader.read(feed)
                .then(fs => this.feedHandler.consume(feed, fs));
        } else {
            return Promise.resolve();
        }
    }

    readThis(feed: FeedDto): void {
        var promise = this.readSingle(feed, true);
        promise.then(_ => this.storage.save());
    }

    toggleActiveness(feed: FeedDto) {
        feed.enabled = !feed.enabled;
        this.storage.save();
    }

    deleteThis(feed: FeedDto) {
        var i = this.storage.storedData.indexOf(feed);
        this.storage.storedData.splice(i, 1);
        this.storage.save();
    }

    private refreshBadge() {
        if (this.active) {
            browser.browserAction.setBadgeText({ text: this.unreadNo.toString() });
            browser.browserAction.setBadgeBackgroundColor({ color: "#ff000022" })
        } else {
            browser.browserAction.setBadgeText({ text: "" });
        }
    }

}