interface IStorage {
    saveOptions() : Promise<void>;
    saveOptions(force : boolean) : Promise<void>;
    loadOptions() : Promise<void>;
    loadOptions(force : boolean) : Promise<void>;
}

type Metadata = {
    version : number,
    lastSaved : string
}


type SyncStorage  = Metadata & {
    notifyMe : boolean,
    version : number,
    period: number,
    storage : FeedDto[]
}

type LocalStorage = SyncStorage & {
    useSync : boolean
}
