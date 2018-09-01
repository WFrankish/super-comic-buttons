interface IBackground {
    readonly epoch : Date;

    readonly reloaded : Event;

    readonly active : boolean;
    readonly unreadNo : number;

    lastSaved : Date;
    version : number;
    storage: any; // TODO

    outOfSync : boolean;
    period: number;
    useSync: boolean;
    notifyMe : boolean;

    openOne() : void;
    openAll() : void;
    activate() : void;
    activate(silent : boolean) : void;
    deactivate() : void;
}