interface IOptions {
    infoText: string;
    needsWarning: boolean;

    restoreOptions($scope?: ng.IScope): void;
    switchSyncOption(): void;
    switchErrorOption(): void;
    updatePeriod(): void;
    forceLoad(): void;
    forceSave(): void;
}