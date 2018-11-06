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
    period: number,
    storage: FeedDto[]
}

type LocalStorage = SyncStorage & {
    useSync: boolean
}

type VAnyMetadata = Metadata | V1Metadata;

type VAnyLocalStorage = LocalStorage | V1LocalStorage;

type VAnySyncStorage = SyncStorage | V1SyncStorage;

type V1Metadata = {
    version: number | undefined,
    lastSaved: string // or Date, appearently
}

type V1SyncStorage = V1Metadata & {
    notifyMe: boolean,
    period: number,
    storage: V1FeedDto[]
}

type V1LocalStorage = V1SyncStorage & {
    useSync: boolean
}