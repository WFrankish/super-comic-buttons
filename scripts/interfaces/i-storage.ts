interface IStorage {
    notifyMe: boolean;
    outOfSync: boolean;
    periodMinutes: number;
    useSync: boolean;
    storedData: FeedDto[];

    save(force?: boolean): Promise<void>;
    load(force?: boolean): Promise<void>;
}

type Metadata = {
    version: number,
    lastSaved: string
}

type SyncStorage = Metadata & {
    notifyMe: boolean,
    version: number,
    period: number,
    storage: FeedDto[]
}

type LocalStorage = SyncStorage & {
    useSync: boolean
}
