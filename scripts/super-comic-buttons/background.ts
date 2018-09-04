$(initBackground);

function initBackground(){
    var ourUrl = browser.runtime.getURL("");
    var notifications = new Notifications();
    var background : IBackground = new Background(ourUrl, notifications);

    addEventListener('reloaded', background.onReload);
    background.load();
    browser.alarms.onAlarm.addListener(function(alarmInfo){
        if(alarmInfo.name === background.readAlarm){
            background.readAll(false);
        }
    });
}

class Background implements IBackground {
    private readonly storage : IStorage;
    private readonly reader : IReader;
    private readonly feedHandler : IFeedHandler;

    readonly notifications : INotifications;
    readonly version = 2.0;
    readonly ourUrl : string;
    
    readonly unreadNoChange = new Event("unreadNoChange");
    readonly reloaded = new Event("reloaded");

    readAlarm = "readAlarm"
    active: boolean;
    unreadNo: number;
    notifyMe: boolean;
    
    lastSaved: Date;
    outOfSync: boolean;
    periodMinutes: number;
    useSync: boolean;
    storedData: FeedDto[];

    constructor(
        ourUrl : string,
        notifications : INotifications
    ){
        this.ourUrl = ourUrl;
        this.notifications = notifications;
        this.storage = new WebStorage(window, this, this.notifications);
        this.reader = new Reader(this, this.notifications);
        this.feedHandler = new FeedHandler();
    }

    load() : void {
        this.storage.loadOptions();
    }

    save() : void {
        var promise = this.storage.saveOptions();
        promise.then(_ => this.onReload());
    }

    onReload() : void {
        if(this.storedData === undefined){
            this.storedData = [];
        }
        if(this.periodMinutes === undefined || this.periodMinutes <= 0){
            this.periodMinutes = 30;
        }
        this.unreadNo = this.storedData.filter(f => f.unread > 0).length;
        this.refreshBadge();
        dispatchEvent(this.unreadNoChange);
    }

    activate(silent : boolean = false) : void {
        browser.alarms.create(this.readAlarm, {
            periodInMinutes: this.periodMinutes,
            delayInMinutes: this.periodMinutes
        });
        this.active = true;
        this.refreshBadge();
        if(!silent){
            this.readAll(false);
        }
    }

    deactivate() : void {
        browser.alarms.clear(this.readAlarm);
        this.active = false;
        this.refreshBadge();
    }

    openOne() : void {
        var storedData = new MyArray(...this.storedData);
        var possibles = storedData.where(f => f.unread > 0).shuffle();
        if(possibles.length > 0){
            this.openThis(possibles[0], false);
        }
    }

    openAll() : void {
        this.storedData.forEach(feed => this.feedHandler.open(feed));
        this.save();
    }

    openThis(feed : FeedDto, force = false) : void {
        this.feedHandler.open(feed, force);
        this.save();
    }

    createNewFeed(feed : FeedDto){
        this.storedData.push(feed);
        this.save();
    }

    readAll(force : boolean = false){
        this.notifications.message("automatically checking for updates")
        var out : Promise<any>[] = [];
        for (let i in this.storedData){
            var promise = this.readSingle(this.storedData[i], force);
            out.push(promise);
        }
        Promise.all(out).then(_ => this.save());
    }

    private readSingle(feed : FeedDto, force = false) : Promise<any>{
        if(force || this.feedHandler.shouldRead(feed)){
            return this.reader.read(feed)
                .then(fs => this.feedHandler.consume(feed, fs));
        } else {
            return Promise.resolve();
        }
    }

    readThis(feed : FeedDto) : void {
        var promise = this.readSingle(feed, true);
        promise.then(_ => this.save());
    }

    toggleActiveness(feed : FeedDto){
        feed.enabled = !feed.enabled;
        this.save();
    }

    deleteThis(feed : FeedDto){
        var i = this.storedData.indexOf(feed);
        this.storedData.splice(i,1);
        this.save();
    }

    private refreshBadge(){
        if(this.active){
            browser.browserAction.setBadgeText({text: this.unreadNo.toString()});
            browser.browserAction.setBadgeBackgroundColor({color: "#ff000022"})
        } else {
            browser.browserAction.setBadgeText({text: ""});
        }
    }

}