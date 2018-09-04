interface IBackground extends IBackgroundForPopup, IBackgroundForMenu, IBackgroundForReader, IBackgroundForStorage, IBackgroundForOptions {
    readonly readAlarm: string;
    

    openOne() : void;
    openAll() : void;

    load() : void;
    onReload() : void;
    readAll(force? : boolean) : void;
}

// split up background to make mocks for testing more bearable

interface IBackgroundForPopup {
    readonly active : boolean;
    readonly unreadNo : number;
    
    activate(silent? : boolean) : void;
    deactivate() : void;
}

interface IBackgroundForMenu {
    
}

interface IBackgroundForReader {
    readonly ourUrl: string;
    notifyMe : boolean;
}

interface IBackgroundForStorage {
    readonly notifications : INotifications
    readonly version : number;
    readonly reloaded : Event;

    lastSaved : Date;
    notifyMe : boolean;
    outOfSync : boolean;
    period: number;
    useSync: boolean;
    storedData: FeedDto[];
}

interface IBackgroundForOptions extends IBackgroundForStorage, IBackgroundForPopup {

}