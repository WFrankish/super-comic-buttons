interface IBackground {
    readonly active : boolean;
    readonly unreadNo : number;

    openOne() : void;
    openAll() : void;
    activate() : void;
    activate(silent : boolean) : void;
    deactivate() : void;
}