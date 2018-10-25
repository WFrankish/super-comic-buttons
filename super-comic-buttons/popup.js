"use strict";
var menu = angular.module("popup", []);
menu.controller("popupCtrl", $scope => {
    var backgroundPage = browser.extension.getBackgroundPage();
    var background = backgroundPage.background;
    var popup = new Popup(background);
    $scope.background = background;
    $scope.toggleClick = () => popup.toggleActivate();
    $scope.menuClick = () => popup.openMenu();
    $scope.optionsClick = () => popup.openOptions();
    $scope.readOneClick = () => background.openOne();
    $scope.readAllClick = () => background.openAll();
    popup.refresh($scope);
    backgroundPage.addEventListener(background.unreadNoChange.type, () => popup.refresh($scope));
});
class Popup {
    constructor(background) {
        this.background = background;
    }
    refresh($scope) {
        if ($scope !== undefined) {
            $scope.$applyAsync(() => {
                this.refresh();
            });
        }
        else {
            if (this.background.active) {
                browser.browserAction.setIcon({
                    path: {
                        "16": "button/enabled-16.png",
                        "32": "button/enabled-32.png",
                        "64": "button/enabled-64.png",
                        "256": "button/enabled-256.png"
                    }
                });
            }
            else {
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
    toggleActivate() {
        if (this.background.active) {
            this.background.deactivate();
        }
        else {
            this.background.activate(false);
        }
        this.refresh();
    }
    openMenu() {
        browser.sidebarAction.getPanel({}).then(url => {
            // can't (yet?) open sidebar programatically, so open it in a new tab
            browser.tabs.create({ url: url });
        });
    }
    openOptions() {
        browser.runtime.openOptionsPage();
    }
}
//# sourceMappingURL=popup.js.map