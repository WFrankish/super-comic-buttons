interface IBackground {
    readonly epoch : Date;
    readonly readAlarm: string;

    readonly reloaded : Event;

    readonly active : boolean;
    readonly unreadNo : number;

    lastSaved : Date;
    readonly version : number;
    storedData: MyArray<IFeed>;

    outOfSync : boolean;
    period: number;
    useSync: boolean;
    notifyMe : boolean;

    openOne() : void;
    openAll() : void;
    activate(silent? : boolean) : void;
    deactivate() : void;

    load() : void;
    onReload() : void;
    readAll(force? : boolean) : void;
}