"use strict";
var menu = angular.module("menu", []);
menu.controller("menuCtrl", $scope => {
    var backgroundPage = browser.extension.getBackgroundPage();
    var background = backgroundPage.background;
    var menu = new Menu(background);
    $scope.type = "rss";
    $scope.createClick = () => menu.create($scope);
    menu.refreshFeedList($scope);
    backgroundPage.addEventListener(background.reloaded.type, () => menu.refreshFeedList($scope));
});
function init() {
    // nameText.on("input", menu.refreshCreateForm);
    // urlText.on("input", menu.refreshCreateForm);
    // idText.on("input", menu.refreshCreateForm);
    // overrideText.on("input", menu.refreshCreateForm);
    // xmlTypeRadio.change(menu.refreshCreateForm);
    // domTypeRadio.change(menu.refreshCreateForm);
    // menu.refreshFeedList();
    // menu.refreshCreateForm();
    // createNewButton.click(menu.createNewFeed);
    // bg.addEventListener('unreadNoChange', menu.refreshFeedList);
}
;
class Menu {
    constructor(background) {
        this.background = background;
    }
    create($scope) {
        if ($scope.type === "html") {
            var root = $scope.root === "" ? undefined : $scope.root;
            var override = $scope.override === "" ? undefined : $scope.override;
            var feed = this.background.feedHandler.newHtmlFeed($scope.name, $scope.url, $scope.id, root, override);
            this.background.createNewFeed(feed);
        }
        else {
            var feed = this.background.feedHandler.newRssFeed($scope.name, $scope.url);
            this.background.createNewFeed(feed);
        }
        $scope.name = "";
        $scope.url = "";
        $scope.type = "rss";
        $scope.id = "";
        $scope.root = "";
        $scope.override = "";
    }
    refreshFeedList($scope) {
        $scope.$evalAsync(() => {
            $scope.feeds = this.background.storage.storedData
                .sort(function (a, b) {
                var recentA = new MyArray(...a.recent);
                var recentB = new MyArray(...b.recent);
                var lastA = recentA.lastOrDefault();
                var lastB = recentB.lastOrDefault();
                var numA = lastA == null ? 0 : new Date(lastA.date).valueOf();
                var numB = lastB == null ? 0 : new Date(lastB.date).valueOf();
                return numB - numA;
            })
                .map(f => new FeedScope(this.background, f));
        });
    }
}
class FeedScope {
    constructor(background, feed) {
        this.background = background;
        this.feed = feed;
        this.name = feed.name;
        var rand = Utils.randomHue(Utils.hashString(feed.name));
        var hue = Math.trunc(360 * rand);
        this.style = feed.enabled ?
            `background-color: hsl(${hue}, 49%, 56%); color: hsl(${hue}, 92%, 20%)` :
            "background-color: #909090; color: #484848";
        this.unread = feed.unread;
        this.unreadMessage = Utils.pluralise(this.unread, "update");
        this.lastReadMessage = feed.lastRecord !== undefined ?
            Utils.asTimeString(Date.now() - new Date(feed.lastRecord).valueOf(), 1) + " ago" :
            "never";
        this.lastUpdatedMessage = feed.recent.length > 0 ?
            Utils.asTimeString(Date.now() - new Date(feed.recent[feed.recent.length - 1].date).valueOf(), 1) + " ago" :
            "unknown";
        this.enabled = feed.enabled;
        this.days = [];
    }
    open() {
        this.background.openThis(this.feed, true);
    }
    read() {
        this.background.readThis(this.feed);
    }
    editMode(event) {
        // TODO
    }
    toggleActiveness() {
        this.background.toggleActiveness(this.feed);
    }
    delete(event) {
        var button = $(event.target);
        button.addClass("attention");
        button.text("Delete!!");
        button.unbind("click");
        button.click(() => this.background.deleteThis(this.feed));
    }
}
class OldMenu {
    createFeedPanel(feed) {
        if (feed.enabled) {
            var map = [];
            feed.map.forEach(function (day) {
                day.forEach(hour => map.push(hour));
            });
            var table = $("<table>", { class: "col-m-12, col-12" });
            subPanel.append(table);
            var days = $("<tr>");
            table.append(days);
            days.append($("<th>", { text: "S", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[0] * feed.averagePerWeek)}, 86%, 56%)`, title: `Sunday - average of ${Utils.pluralise(Math.round(feed.dayMap[0] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "M", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[1] * feed.averagePerWeek)}, 86%, 56%)`, title: `Monday - average of ${Utils.pluralise(Math.round(feed.dayMap[1] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "T", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[2] * feed.averagePerWeek)}, 86%, 56%)`, title: `Tuesday - average of ${Utils.pluralise(Math.round(feed.dayMap[2] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "W", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[3] * feed.averagePerWeek)}, 86%, 56%)`, title: `Wednesday - average of ${Utils.pluralise(Math.round(feed.dayMap[3] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "T", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[4] * feed.averagePerWeek)}, 86%, 56%)`, title: `Thursday - average of ${Utils.pluralise(Math.round(feed.dayMap[4] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "F", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[5] * feed.averagePerWeek)}, 86%, 56%)`, title: `Friday - average of ${Utils.pluralise(Math.round(feed.dayMap[5] * feed.averagePerWeek * 100) / 100, "update")}` }));
            days.append($("<th>", { text: "S", class: "day", style: `color: hsl(${this.colourFromNumber(feed.dayMap[6] * feed.averagePerWeek)}, 86%, 56%)`, title: `Saturday - average of ${Utils.pluralise(Math.round(feed.dayMap[6] * feed.averagePerWeek * 100) / 100, "update")}` }));
            for (var i = 0; i < 24; i++) {
                var t = $("<tr>"); // show as 0#
                table.append(t);
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[0][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Sunday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[0][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[1][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Monday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[1][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[2][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Tuesday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[2][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[3][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Wednesday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[3][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[4][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Thursday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[4][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[5][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Friday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[5][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
                t.append($("<td>", { class: "num", style: `background-color: hsl(${this.colourFromNumber(map[6][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Saturday ${("0" + i).slice(-2)}:00 - average of ${Utils.pluralise(Math.round(map[6][i] * feed.averagePerWeek * 100) / 100, "update")}` }));
            }
            var inforow = $("<div>", { class: "row" });
            subPanel.append(inforow);
            inforow.append($("<div>", { class: "col-m-6 col-3 padall wrap", text: `${Utils.pluralise(Math.round(feed.averagePerWeek * 100) / 100, "update")} per week` }));
            inforow.append($("<div>", { class: "col-m-6 col-3 padall wrap", text: `${Utils.pluralise(Math.round(feed.averagePerDay * 100) / 100, "update")} per day` }));
            inforow.append($("<div>", { class: "col-m-6 col-6 padall wrap", text: `~${Utils.asTimeString(feed.averageGap, 2)} between updates` }));
        }
    }
    editMode(feed, event) {
        var button = $(event.target);
        this.createNewButton.unbind("click");
        this.createNewButton.click(_ => this.editFeed(feed));
        this.createNewButton.addClass("attention");
        this.createNewButton.val("Save edits");
        var oldDisabledButtons = this.feedListDiv.find(":disabled");
        oldDisabledButtons.each(function (i) {
            var butt = $(oldDisabledButtons[i]);
            butt.prop("disabled", false);
            butt.val("Edit");
        });
        button.prop("disabled", true);
        button.val("^ ^ ^ ^");
        this.nameText.val(feed.name);
        this.urlText.val(feed.url);
        if (feed.type === "html") {
            this.domTypeRadio.click();
            this.overrideText.val(feed.overrideLink);
            this.idText.val(feed.id);
            if (feed.root) {
                this.rootText.val(feed.root);
            }
            else {
                this.rootText.val("");
            }
        }
        else {
            this.xmlTypeRadio.click();
        }
        this.refreshCreateForm();
    }
    ;
    // TODO if a reload happens, edit progress will be lost
    // they only happen when a user causes one, or on the infrequent automatic read, so this is acceptable for now
    editFeed(feed) {
        var name = this.nameText.val();
        var url = this.urlText.val();
        var id = this.idText.val();
        var root = this.rootText.val();
        var overrideLink = this.overrideText.val();
        var htmlMode = this.domTypeRadio.is(":checked");
        feed.name = name;
        feed.url = url;
        if (htmlMode) {
            feed.id = id;
            feed.overrideLink = overrideLink;
            if (root) {
                feed.root = root;
            }
            else {
                feed.root = null;
            }
            feed.type = "html";
        }
        else {
            feed.id = null;
            feed.overrideLink = null;
            feed.root = null;
            feed.type = "rss";
        }
        if (!this.bg.storage.any(f => f == feed)) {
            notifyError("Edit error", "Failed to save edits");
        }
        this.bg.save();
        this.nameText.val("");
        this.urlText.val("");
        this.idText.val("");
        this.rootText.val("");
        this.overrideText.val("");
        this.createNewButton.removeClass("attention");
        this.createNewButton.val("Create");
        this.refreshCreateForm();
    }
    colourFromNumber(num) {
        var lessThanOne = Math.min(num, 1);
        var oneToFive = Math.max(Math.min(num - 1, 5 - 1), 0);
        var hue = (120 * lessThanOne) + (15 * oneToFive);
        return hue;
    }
}
//# sourceMappingURL=menu.js.map