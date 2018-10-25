var options = angular.module("options", []);

options.controller("optionsCtrl", $scope => {
    var backgroundPage: any = browser.extension.getBackgroundPage();
    var background: IBackground = backgroundPage.background;
    var options = new Options(background);
    $scope.storage = background.storage;
    $scope.options = options;

    $scope.periodClick = () => options.updatePeriod();
    $scope.syncSwitch = () => options.switchSyncOption();
    $scope.errorSwitch = () => options.switchErrorOption();
    $scope.forceSaveClick = () => options.forceSave();
    $scope.forceLoadClick = () => options.forceLoad();
    options.restoreOptions();
});

class Options implements IOptions {
    private readonly background: IBackgroundForOptions;
    private readonly storage: IStorage;
    
    private syncPending = false;

    needsWarning = false;
    infoText = "";

    constructor(
        background: IBackgroundForOptions,
    ) {
        this.background = background;
        this.storage = background.storage;

        this.storage.outOfSync = false;
    }

    restoreOptions($scope?: ng.IScope): void {
        if ($scope !== undefined) {
            $scope.$applyAsync(() => {
                this.restoreOptions();
            })
        }
        else {
            this.syncPending = false;

            this.infoText = "Manually Save/Load";
            this.needsWarning = false;

            this.storage.load(false).then(() => {
                if (this.storage.outOfSync) {
                    this.infoText = "Local data and sync data have become out of sync. Please choose to either load sync data or save local data to resolve this";
                    this.needsWarning = true;
                }
            });
        }
    }

    switchSyncOption(): void {
        if (!this.storage.useSync || this.syncPending) {
            this.storage.outOfSync = false;
            var promise = this.storage.save(false);
            promise.then(_ => {
                this.restoreOptions();
            });
        } else {
            this.syncPending = true;
            this.infoText = "To start using Firefox Sync, please choose whether to load any existing sync data, or save existing local data";
            this.needsWarning = true;
        }
    }

    switchErrorOption(): void {
        var promise = this.storage.save(false);
        promise.then(_ => {
            this.restoreOptions();
        });
    }

    updatePeriod(): void {
        if (this.storage.periodMinutes <= 0) {
            this.storage.periodMinutes = 1;
        }
        var promise = this.storage.save(false);
        promise.then(_ => {
            if (this.background.active) {
                this.background.deactivate();
                this.background.activate(true);
            }
        });
    }



    forceLoad(): void {
        if(this.syncPending){
            this.saveLocalThenForceLoad;
        } else {
            this.forceLoadWithoutSave();
        }
    }

    forceSave(): void {
        this.storage.useSync = true;
        var promise = this.storage.save(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }

    private forceLoadWithoutSave(): void {
        this.storage.useSync = true;
        var promise = this.storage.load(true);
        promise.then(_ => {
            this.restoreOptions();
        });
    }

    private saveLocalThenForceLoad(): void {
        browser.storage.local.set({
            useSync: true,
        }).then(_ => {
            this.forceLoadWithoutSave();
        });
    }

}