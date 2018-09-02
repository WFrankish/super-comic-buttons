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
    private readonly ourUrl : string;
    private readonly notifications : INotifications;
    private readonly storage : IStorage;
    private readonly reader : IReader;

    // stored variables
    lastSaved : Date;
    useSync : boolean;
    notifyMe : boolean;
    storedData : MyArray<IFeed>;
    period : number;
    readonly version = 2.0;

    // other variables
    outOfSync : boolean;
    readonly epoch = new Date(0);
    active = false;
    unreadNo = 0;

    // events
    unreadNoChange = new Event('unreadNoChange');
    reloaded = new Event('reloaded');

    // alarms
    readonly readAlarm = "readAlarm";

    constructor(
        ourUrl : string,
        notifications : INotifications
    ){
        this.ourUrl = ourUrl;
        this.notifications = notifications;
        this.storage = new WebStorage(window, this);
        this.reader = new Reader(this, this.notifications);
    }

    load() : Promise<void>{
        return this.storage.loadOptions();
    }

    save() : void {
        var promise = this.storage.saveOptions();
        promise.then(_ => this.onReload());
    }

    onReload() : void {
        if(!this.storedData){
            this.storedData = new MyArray();
        } else {
            var temp = [];
            for (let i in this.storedData){
                var feed = new Feed(this.storedData[i]);
                temp.push(feed);
            }
            this.storedData = new MyArray(...temp);
        }
        if(!this.period || !(this.period > 0)){
            this.period = 30;
        }
        this.unreadNo = this.storedData.count(f => f.unread > 0);
        this.refreshBadge();
        dispatchEvent(this.unreadNoChange);
    }

    activate(silent : boolean = false) : void {
        browser.alarms.create(this.readAlarm, {
            periodInMinutes: this.period,
            delayInMinutes: this.period
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
        var possibles = this.storedData.where(f => f.unread > 0).shuffle();
        if(possibles.length > 0){
            this.openThis(possibles[0], false);
        }
    }

    openAll() : void {
        this.storedData.forEach(feed => feed.open(false));
        this.save();
    }

    openThis(feed : IFeed, force = false) : void {
        feed.open(force);
        this.save();
    }

    createNewFeed(feed : IFeed){
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

    readSingle(feed : IFeed, force = false) : Promise<any>{
        if(force || feed.shouldRead){
            var promise = read(feed);
            return promise;
        } else {
            return Promise.resolve();
        }
    }

    readThis(feed : IFeed) : void {
        var promise = this.readSingle(feed, true);
        promise.then(_ => this.save());
    }

    toggleActiveness(feed : IFeed){
        feed.enabled = !feed.enabled;
        this.save();
    }

    deleteThis(feed : Feed){
        this.storedData.remove(feed);
        this.save();
    }

    refreshBadge(){
        if(this.active){
            browser.browserAction.setBadgeText({text: this.unreadNo.toString()});
            browser.browserAction.setBadgeBackgroundColor({color: "#ff000022"})
        } else {
            browser.browserAction.setBadgeText({text: ""});
        }
    }

}