"use strict";
$(initPopup);
function initPopup() {
    var backgroundPage = browser.extension.getBackgroundPage();
    var background = backgroundPage.background;
    var menuButton = $("#menu-button");
    var optionsButton = $("#options-button");
    var toggleButton = $("#toggle-button");
    var readOneButton = $("#read-one-button");
    var readAllButton = $("#read-all-button");
    var popup = new Popup(background, toggleButton, readOneButton, readAllButton);
    menuButton.click(() => popup.openMenu);
    optionsButton.click(() => popup.openOptions);
    toggleButton.click(() => popup.toggleActivate);
    readOneButton.click(() => background.openOne);
    readAllButton.click(() => background.openAll);
    backgroundPage.addEventListener('unreadNoChange', popup.refresh);
    popup.refresh();
}
class Popup {
    constructor(background, toggleButton, readOneButton, readAllButton) {
        this.background = background;
        this.toggleButton = toggleButton;
        this.readOneButton = readOneButton;
        this.readAllButton = readAllButton;
    }
    refresh() {
        if (this.background.active) {
            this.toggleButton.val("Deactivate");
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
            this.toggleButton.val("Activate!");
            browser.browserAction.setIcon({
                path: {
                    "16": "button/icon-16.png",
                    "32": "button/icon-32.png",
                    "64": "button/icon-64.png",
                    "256": "button/icon-256.png"
                }
            });
        }
        if (this.background.unreadNo > 0) {
            this.readOneButton.prop("disabled", false);
        }
        else {
            this.readOneButton.prop("disabled", true);
        }
        if (this.background.unreadNo > 1) {
            this.readAllButton.prop("disabled", false);
        }
        else {
            this.readAllButton.prop("disabled", true);
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