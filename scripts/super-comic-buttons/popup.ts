var popup = angular.module("popup", []);

popup.controller("popupCtrl", $scope => {
    var backgroundPage: any = browser.extension.getBackgroundPage();
    var background: IBackground = backgroundPage.background;
    var popup = new Popup(background);
    $scope.background = background;

    $scope.toggleClick = () => popup.toggleActivate();
    $scope.menuClick = () => popup.openMenu();
    $scope.optionsClick = () => popup.openOptions();
    $scope.readOneClick = () => background.openOne();
    $scope.readAllClick = () => background.openAll();

    popup.refresh($scope)

    backgroundPage.addEventListener(background.unreadNoChange.type, () => popup.refresh($scope));
});

class Popup implements IPopup {
    private readonly background: IBackgroundForPopup;

    constructor(
        background: IBackgroundForPopup,
    ) {
        this.background = background;
    }

    refresh($scope? : ng.IScope): void {
        if($scope !== undefined){
            $scope.$applyAsync(() => {
                this.refresh()
            })
        } else {
            if (this.background.active) {
                browser.browserAction.setIcon({
                    path: {
                        "16": "button/enabled-16.png",
                        "32": "button/enabled-32.png",
                        "64": "button/enabled-64.png",
                        "256": "button/enabled-256.png"
                    }
                });
            } else {
                browser.browserAction.setIcon({
                    path: {
                        "16": "button/icon-16.png",
                        "32": "button/icon-32.png",
                        "64": "button/icon-64.png",
                        "256": "button/icon-256.png"
                    }
                });
            }
        }
    }

    toggleActivate(): void {
        if (this.background.active) {
            this.background.deactivate();
        } else {
            this.background.activate(false);
        }
        this.refresh();
    }

    openMenu(): void {
        browser.sidebarAction.getPanel({}).then(url => {
            // can't (yet?) open sidebar programatically, so open it in a new tab
            browser.tabs.create({ url: url });
        });
    }

    openOptions(): void {
        browser.runtime.openOptionsPage();
    }
}
