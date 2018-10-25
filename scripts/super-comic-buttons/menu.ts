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

    entity: FeedDto;

    unread: number;
    unreadMessage: string;
    lastReadMessage: string;
    lastUpdatedMessage: string;

    weekdays: IWeekDayScope[];
    hours: IHourScope[];
    perWeek: string;
    perDay: string;
    betweenUpdates: string;

    editMode: boolean;

    constructor(
        background: IBackgroundForMenu,
        feed: FeedDto
    ) {
        this.background = background;
        this.entity = feed;

        this.unread = feed.unread;
        this.unreadMessage = Utils.pluralise(this.unread, "update");
        this.lastReadMessage = feed.lastRecord !== undefined ?
            Utils.asTimeString(Date.now() - new Date(feed.lastRecord).valueOf(), 1) + " ago" :
            "never";
        this.lastUpdatedMessage = feed.recent.length > 0 ?
            Utils.asTimeString(Date.now() - new Date(feed.recent[feed.recent.length - 1].date).valueOf(), 1) + " ago" :
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

    style(): string {
        var rand = Utils.randomHue(Utils.hashString(this.entity.name));
        var hue = Math.trunc(360 * rand);
        return this.entity.enabled ?
            `background-color: hsl(${hue}, 49%, 56%); color: hsl(${hue}, 92%, 20%)` :
            "background-color: #909090; color: #484848";
    }

    open(): void {
        this.background.openThis(this.entity, true);
    }

    read(): void {
        this.background.readThis(this.entity);
    }

    edit(event: JQuery.Event<HTMLElement>): void {
        this.editMode = true;
        var button = $(event.target)
        button.addClass("attention");
        button.text("Save!!");
        button.unbind("click");
        button.click(() => this.background.storage.save(true));
    }

    toggleActiveness(): void {
        this.background.toggleActiveness(this.entity);
    }

    delete(event: JQuery.Event<HTMLElement>): void {
        var button = $(event.target)
        button.addClass("attention");
        button.text("Delete!!");
        button.unbind("click");
        button.click(() => this.background.deleteThis(this.entity));
    }

    private transposeAndProcessMap(feed: FeedDto): number[][] {
        var map = this.background.feedHandler.offSetMapForTimeZone(feed);

        var result: number[][] = [];
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