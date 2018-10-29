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
                var lastA = MyArray.lastOrDefault(a.recent);
                var lastB = MyArray.lastOrDefault(b.recent);
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
        this.entity = feed;
        this.unread = feed.unread;
        this.unreadMessage = Utils.pluralise(this.unread, "update");
        this.lastReadMessage = feed.lastRecord !== undefined ?
            Utils.asTimeString(Date.now() - new Date(feed.lastRecord).valueOf(), 1) + " ago" :
            "never";
        this.lastUpdatedMessage = feed.recent.length > 0 ?
            Utils.asTimeString(Date.now() - new Date(MyArray.last(feed.recent).date).valueOf(), 1) + " ago" :
            "unknown";
        this.weekdays = [];
        this.hours = [];
        var alteredMap = this.transposeAndProcessMap(feed);
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        days.forEach((day, ii) => {
            var value = alteredMap.map(h => h[ii]).reduce((a, b) => a + b);
            this.weekdays.push(new WeekDayScope(day, value));
        });
        for (var ii = 0; ii < 24; ii++) {
            this.hours.push(new HourScope(ii, days, alteredMap[ii]));
        }
        this.perWeek = Utils.pluralise(Math.round(this.background.feedHandler.averagePerWeek(feed) * 100) / 100, "update");
        this.perDay = Utils.pluralise(Math.round(this.background.feedHandler.averagePerDay(feed) * 100) / 100, "update");
        this.betweenUpdates = Utils.asTimeString(this.background.feedHandler.averageGap(feed), 2);
        this.editMode = false;
    }
    style() {
        var rand = Utils.randomHue(Utils.hashString(this.entity.name));
        var hue = Math.trunc(360 * rand);
        return this.entity.enabled ?
            `background-color: hsl(${hue}, 49%, 56%); color: hsl(${hue}, 92%, 20%)` :
            "background-color: #909090; color: #484848";
    }
    open() {
        this.background.openThis(this.entity, true);
    }
    read() {
        this.background.readThis(this.entity);
    }
    edit(event) {
        this.editMode = true;
        var button = $(event.target);
        button.addClass("attention");
        button.text("Save!!");
        button.unbind("click");
        button.click(() => this.background.storage.save(true));
    }
    toggleActiveness() {
        this.background.toggleActiveness(this.entity);
    }
    delete(event) {
        var button = $(event.target);
        button.addClass("attention");
        button.text("Delete!!");
        button.unbind("click");
        button.click(() => this.background.deleteThis(this.entity));
    }
    transposeAndProcessMap(feed) {
        var map = this.background.feedHandler.offSetMapForTimeZone(feed);
        var result = [];
        map[0].forEach(() => {
            result.push([]);
        });
        var days = map.length;
        var hours = map[0].length;
        for (var ii = 0; ii < days; ii++) {
            for (var jj = 0; jj < hours; jj++) {
                result[jj][ii] = map[ii][jj] * this.background.feedHandler.averagePerWeek(feed);
            }
        }
        return result;
    }
}
class WeekDayScope {
    constructor(day, value) {
        this.text = day[0];
        this.title = day + " - average of " + Utils.pluralise(Math.round(value * 100) / 100, "update");
        this.style = `color: hsl(${Utils.colourFromNumber(value)}, 86%, 56%)`;
    }
}
class HourScope {
    constructor(hour, weekDays, days) {
        this.days = [];
        weekDays.forEach((day, ii) => {
            this.days.push(new DayScope(day, hour, days[ii]));
        });
    }
}
class DayScope {
    constructor(day, hour, value) {
        this.title = `${day} ${hour.toString().padStart(2, '0')}:00 - average of ${Utils.pluralise(Math.round(value * 100) / 100, "update")}`;
        this.style = `background-color: hsl(${Utils.colourFromNumber(value)}, 49%, 56%)`;
    }
}
//# sourceMappingURL=menu.js.map