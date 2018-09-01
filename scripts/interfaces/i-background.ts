interface IBackground {
    readonly active : boolean;
    readonly unreadNo : number;

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