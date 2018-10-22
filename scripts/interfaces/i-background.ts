interface IBackground extends IBackgroundForPopup, IBackgroundForMenu, IBackgroundForReader, IBackgroundForStorage, IBackgroundForOptions {
    readonly readAlarm: string;
    
    onReload() : void;
    readAll(force? : boolean) : void;
}

// split up background to make mocks for testing more bearable

interface IBackgroundForPopup {
    readonly active : boolean;
    readonly unreadNo : number;
    
    activate(silent? : boolean) : void;
    deactivate() : void;
    openOne() : void;
    openAll() : void;
}

interface IBackgroundForMenu {
    readonly storage : IStorage;

    openThis(feed : FeedDto, force? : boolean) : void;
    readThis(feed : FeedDto) : void;
    deleteThis(feed: FeedDto) : void;
    createNewFeed(feed: FeedDto) : void;
    toggleActiveness(feed: FeedDto) : void;
}

interface IBackgroundForReader {
    readonly storage : IStorage;
    readonly ourUrl: string;
}

interface IBackgroundForStorage {
    readonly notifications : INotifications
    readonly reloaded : Event;
}

interface IBackgroundForOptions {
    readonly storage : IStorage;
    readonly active : boolean;

    activate(silent? : boolean) : void;
    deactivate() : void;
}