var menu = angular.module("menu", []);

menu.controller("menuCtrl", $scope => {
    var backgroundPage: any = browser.extension.getBackgroundPage();
    var background: IBackground = backgroundPage.background;
    var menu = new Menu(background);
    $scope.type = "rss";
    $scope.createClick = () => menu.create($scope);
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
};

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
}

class OldMenu {
    feedListDiv: JQuery<HTMLDivElement>;
    bg: IBackgroundForMenu;
    nameText: JQuery<HTMLInputElement>;
    urlText: JQuery<HTMLInputElement>;
    idText: JQuery<HTMLInputElement>;
    specialRow: JQuery<HTMLDivElement>;
    domTypeRadio: JQuery<HTMLInputElement>;
    createNewButton: JQuery<HTMLButtonElement>;
    overrideText: JQuery<HTMLInputElement>;
    rootText: JQuery<HTMLInputElement>;

    constructor(
        feedListDiv: JQuery<HTMLDivElement>,
        bg: IBackgroundForMenu,
        nameText: JQuery<HTMLInputElement>,
        urlText: JQuery<HTMLInputElement>,
        idText: JQuery<HTMLInputElement>,
        specialRow: JQuery<HTMLDivElement>,
        domTypeRadio: JQuery<HTMLInputElement>,
        createNewButton: JQuery<HTMLButtonElement>,
        overrideText: JQuery<HTMLInputElement>,
        rootText: JQuery<HTMLInputElement>,
    ) {
        this.feedListDiv = feedListDiv;
        this.bg = bg;
        this.nameText = nameText;
        this.urlText = urlText;
        this.idText = idText;
        this.specialRow = specialRow;
        this.domTypeRadio = domTypeRadio;
        this.createNewButton = createNewButton;
        this.overrideText = overrideText;
        this.rootText = rootText;
    }

    refreshFeedList(): void {
        this.feedListDiv.empty();
        var panels: JQuery<HTMLElement>[] = [];
        var feeds = new MyArray(...this.bg.storage);
        feeds.sort(function (a, b) {
            var lastA = a.recent.last();
            var lastB = b.recent.last();
            var numA = lastA == null ? 0 : lastA.date;
            var numB = lastB == null ? 0 : lastB.date;
            return numB - numA;
        })
        feeds.forEach(feed => panels.push(this.createFeedPanel(feed)));
        this.feedListDiv.append(...panels);
    }

    createFeedPanel(feed: FeedDto): JQuery<HTMLElement> {
        var panel = $("<div>", { class: "col-4 col-m-6 padall" });
        var subPanel = $("<div>", { class: "light row" });
        panel.append(subPanel);
        var nameDiv = $("<div>", { class: "col-5 col-m-7 padall truncate" });
        var name = $("<b>", { text: feed.name, class: "col-m-12 col-12 truncate" });
        nameDiv.append(name);
        this.styleDiv(name, feed);
        var unreadNo = $("<div>", { text: Utils.pluralise(feed.unread, "update"), class: "col-4 col-m-5 truncate padall" });
        var openDiv = $("<div>", { class: "col-3 col-m-6 padall" });
        var openButton = $("<input>", { type: "button", value: "Open!" });
        openButton.click(_ => this.bg.openThis(feed, true));
        openDiv.append(openButton);
        if (feed.unread > 0) {
            openButton.addClass("attention");
        }
        subPanel.append(nameDiv);
        subPanel.append(unreadNo);
        subPanel.append(openDiv);
        var lastReadString = feed.lastRecord !== undefined ? Utils.asTimeString(Date.now() - new Date(feed.lastRecord).valueOf(), 1) + " ago" : "never";
        var lastRead = $("<div>", { text: "read: " + lastReadString, class: "col-4 col-m-6 truncate padall" });
        var lastUpdateString = feed.recent.any() ? Utils.asTimeString(Date.now() - feed.recent.last().date, 1) + " ago" : "unknown";
        var lastUpdate = $("<div>", { text: "updated: " + lastUpdateString, class: "col-5 col-m-7 truncate padall" });
        var readDiv = $("<div>", { class: "col-3 col-m-5 padall" });
        var readButton = $("<input>", { type: "button", value: "Read!" });
        readButton.click(_ => this.bg.readThis(feed));
        readDiv.append(readButton);
        subPanel.append(lastRead);
        subPanel.append(lastUpdate);
        subPanel.append(readDiv);
        if (feed.enabled) {
            var map: number[] = [];
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
        var editDiv = $("<div>", { class: "col-4 col-m-6 padall" });
        var editButton = $("<input>", { type: "button", value: "Edit" });
        editButton.click(event => this.editMode(feed, event));
        editDiv.append(editButton);
        var activateDiv = $("<div>", { class: "col-4 col-m-6 padall" });
        var activateButton;
        if (feed.enabled) {
            activateButton = $("<input>", { type: "button", value: "Deactivate" });
        } else {
            activateButton = $("<input>", { type: "button", value: "Activate" });
        }
        activateButton.click(_ => this.bg.toggleActiveness(feed));
        activateDiv.append(activateButton);
        var deleteDiv = $("<div>", { class: "col-4 col-m-6 padall" });
        var deleteButton = $("<input>", { type: "button", value: "Delete?" });
        deleteButton.click(event => this.confirmDelete(feed, event));
        deleteDiv.append(deleteButton);
        subPanel.append(editDiv);
        subPanel.append(activateDiv);
        subPanel.append(deleteDiv);
        return panel;
    }

    refreshCreateForm(): void {
        var validated = true;
        if (this.nameText.val()) {
            this.nameText.removeClass("invalid");
            validated = validated && true;
        } else {
            this.nameText.addClass("invalid");
            validated = false;
        }
        if (this.urlText.val()) {
            this.urlText.removeClass("invalid");
            validated = validated && true;
        } else {
            this.urlText.addClass("invalid");
            validated = false;
        }
        validated = this.urlText.val() && validated;
        var htmlMode = this.domTypeRadio.is(":checked");
        if (htmlMode) {
            this.specialRow.show();
            if (this.idText.val()) {
                this.idText.removeClass("invalid");
                validated = validated && true;
            } else {
                this.idText.addClass("invalid");
                validated = false;
            }
            if (this.overrideText.val()) {
                this.overrideText.removeClass("invalid");
                validated = validated && true;
            } else {
                this.overrideText.addClass("invalid");
                validated = false;
            }
        } else {
            this.specialRow.hide();
        }
        if (validated) {
            this.createNewButton.prop("disabled", false);
        } else {
            this.createNewButton.prop("disabled", true);
        }
    };

    createNewFeed() {
        var name = this.nameText.val();
        var url = this.urlText.val();
        var feed;
        var htmlMode = this.domTypeRadio.is(":checked");
        if (htmlMode) {
            var id = this.idText.val();
            var root = this.rootText.val();
            var overrideLink = this.overrideText.val();
            if (root) {
                feed = new Feed({ name: name, url: url, id: id, root: root, overrideLink: overrideLink, type: "html" });
            } else {
                feed = new Feed({ name: name, url: url, id: id, overideLink: overrideLink, type: "html" });
            }
        } else {
            feed = new Feed({ name: name, url: url, type: "rss" });
        }
        this.bg.createNewFeed(feed);
        this.nameText.val("");
        this.urlText.val("");
        this.idText.val("");
        this.rootText.val("");
        this.overrideText.val("");
    }

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

    confirmDelete(feed: FeedDto, event: JQuery.Event<HTMLElement>): void {
        var button = $(event.target)
        button.addClass("attention");
        button.val("Delete!!");
        button.unbind("click");
        button.click(_ => this.bg.deleteThis(feed));
    };

    colourFromNumber(num: number): number {
        var lessThanOne = Math.min(num, 1);
        var oneToFive = Math.max(Math.min(num - 1, 5 - 1), 0);
        var hue = (120 * lessThanOne) + (15 * oneToFive);
        return hue;
    }

    styleDiv(div: JQuery<HTMLDivElement>, feed: FeedDto) {
        var bgColour;
        var textColour;
        if (feed.enabled) {
            var rand = Utils.randomHue(Utils.hashString(feed.name));
            var hue = Math.trunc(360 * rand);
            bgColour = `hsl(${hue}, 49%, 56%)`;
            textColour = `hsl(${hue}, 92%, 20%)`;
        } else {
            bgColour = "#909090";
            textColour = "#484848";
        }
        div.css({ "background-color": bgColour, "color": textColour, "border-radius": "0.2em", "padding": "0.2em", "text-align": "center" });
    }
}