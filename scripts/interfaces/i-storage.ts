interface IStorage {
    saveOptions() : Promise<void>;
    saveOptions(force : boolean) : Promise<void>;
    loadOptions() : Promise<void>;
    loadOptions(force : boolean) : Promise<void>;
}