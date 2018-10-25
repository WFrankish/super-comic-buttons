var menu = angular.module("menu", []);

menu.controller("menuCtrl", $scope => {
    var backgroundPage: any = browser.extension.getBackgroundPage();
    var background: IBackground = backgroundPage.background;
    var menu = new Menu(background);
    $scope.type = "rss";
    $scope.createClick = () => menu.create($scope);

    menu.refreshFeedList($scope);

    backgroundPage.addEventListener(background.reloaded.type, () => menu.refreshFeedList($scope));
});

class Menu implements IMenu {
    private readonly background: IBackgroundForMenu;

    constructor(
        background: IBackgroundForMenu
    ) {
        this.background = background;
    }

    create($scope: IMenuScope): void {
        if ($scope.type === "html") {
            var root = $scope.root === "" ? undefined : $scope.root;
            var override = $scope.override === "" ? undefined : $scope.override;

            var feed = this.background.feedHandler.newHtmlFeed(
                $scope.name, $scope.url,
                $scope.id, root, override
            );
            this.background.createNewFeed(feed);
        } else {
            var feed = this.background.feedHandler.newRssFeed(
                $scope.name, $scope.url
            );
            this.background.createNewFeed(feed);
        }
        $scope.name = "";
        $scope.url = "";
        $scope.type = "rss";
        $scope.id = "";
        $scope.root = "";
        $scope.override = "";
    }

    refreshFeedList($scope: IMenuScope): void {
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

class FeedScope implements IFeedScope {
    private readonly background: IBackgroundForMenu;
    private readonly feed: FeedDto;

    name: string;
    style: string;
    unread: number;
    unreadMessage: string;
    lastReadMessage: string;
    lastUpdatedMessage: string;
    enabled: boolean;

    weekdays: IWeekDayScope[];
    hours: IHourScope[];
    perWeek: string;
    perDay: string;
    betweenUpdates: string;

    constructor(
        background: IBackgroundForMenu,
        feed: FeedDto
    ) {
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

        this.weekdays = [];
        this.hours = [];

        var alteredMap = this.transposeAndProcessMap(feed);

        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        days.forEach((day, ii) => {
            var value = alteredMap.map(h => h[ii]).reduce((a, b) => a+b);
            this.weekdays.push(new WeekDayScope(day, value));
        });

        for (var ii = 0; ii < 24; ii++) {
            this.hours.push(new HourScope(ii, days, alteredMap[ii]));
        }

        this.perWeek = Utils.pluralise(Math.round(this.background.feedHandler.averagePerWeek(feed) * 100) / 100, "update");
        this.perDay = Utils.pluralise(Math.round(this.background.feedHandler.averagePerDay(feed) * 100) / 100, "update");
        this.betweenUpdates = Utils.asTimeString(this.background.feedHandler.averageGap(feed), 2);
    }

    open(): void {
        this.background.openThis(this.feed, true);
    }

    read(): void {
        this.background.readThis(this.feed);
    }

    editMode(event: JQuery.Event<HTMLElement>): void {
        // TODO
    }
    toggleActiveness(): void {
        this.background.toggleActiveness(this.feed);
    }
    delete(event: JQuery.Event<HTMLElement>): void {
        var button = $(event.target)
        button.addClass("attention");
        button.text("Delete!!");
        button.unbind("click");
        button.click(() => this.background.deleteThis(this.feed));
    }

    private transposeAndProcessMap(feed: FeedDto) : number[][]{      
        // TODO
        var result: number[][] = [];
        feed.map[0].forEach(() => {
            result.push([]);
        });

        for(var ii = 0; ii < feed.map.length; ii++){
            for(var jj = 0; jj < feed.map[0].length; jj++){
                result[jj][ii] = feed.map[ii][jj] * this.background.feedHandler.averagePerWeek(feed);
            }
        }
        return result;
    }
}

class WeekDayScope implements IWeekDayScope {
    text: string;
    title: string;
    style: string;

    constructor(day: string, value: number) {
        this.text = day[0];
        this.title = day + " - average of " + Utils.pluralise(Math.round(value * 100) / 100, "update");
        this.style = `color: hsl(${Utils.colourFromNumber(value)}, 86%, 56%)`
    }
}

class HourScope implements IHourScope {
    days: IDayScope[];

    constructor(hour: number, weekDays: string[], days: number[]) {
        this.days = []
        weekDays.forEach((day, ii) => {
            this.days.push(new DayScope(day, hour, days[ii]));
        });
    }
}

class DayScope implements IDayScope {
    title: string;
    style: string;

    constructor(day: string, hour: number, value: number) {
        this.title = `${day} ${hour.toString().padStart(2, '0')}:00 - average of ${Utils.pluralise(Math.round(value * 100) / 100, "update")}`;
        this.style = `background-color: hsl(${Utils.colourFromNumber(value)}, 49%, 56%)`
    }
}

class OldMenu {
    editMode(feed: FeedDto, event: JQuery.Event<HTMLElement>): void {
        var button = $(event.target);
        this.createNewButton.unbind("click");
        this.createNewButton.click(_ => this.editFeed(feed));
        this.createNewButton.addClass("attention");
        this.createNewButton.val("Save edits");
        var oldDisabledButtons = this.feedListDiv.find(":disabled");
        oldDisabledButtons.each(function (i) {
            var butt = $(oldDisabledButtons[i]);
            butt.prop("disabled", false)
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
            } else {
                this.rootText.val("");
            }
        } else {
            this.xmlTypeRadio.click();
        }
        this.refreshCreateForm();
    };

    // TODO if a reload happens, edit progress will be lost
    // they only happen when a user causes one, or on the infrequent automatic read, so this is acceptable for now
    editFeed(feed: FeedDto) {
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
            } else {
                feed.root = null;
            }
            feed.type = "html";
        } else {
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
        this.overrideText.val("")
        this.createNewButton.removeClass("attention");
        this.createNewButton.val("Create");
        this.refreshCreateForm();
    }


}