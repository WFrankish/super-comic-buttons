"use strict";
class Feed {
    // eval(this.toSource()) should return this
    constructor({ 
        // config
        name, // string - the name of the feed
        url, // string - the url to read from
        enabled = true, // bool - whether this feed is active
        type, // string (optional) - the type of feed
        overrideLink, // string (optional) - a link to go to instead of unreadLink
        id, // string (optional) - for html "feed" hacks
        root, // string (optional) - for html "feed" hacks
        // reading
        recent = [], // Array<FeedItem> - the 10 most recent updates
        unreadLink, // string - the link to the last unread page
        unread = 0, // int - the number of unread updates
        // statistics
        count = 0, // int - the number of updates in data
        // Array<double>(7) - the probability an update is on a given day, index matches Date().getDay
        dayMap = [0, 0, 0, 0, 0, 0, 0], 
        // Aray<double>(24) - the probability an updates is at a given hour
        hourMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], firstRecord = new Date(), // Date - the date of the earliest information about this feed
        lastRecord // Date - the last time the feed was read
         } = {}) {
        this.name = name;
        this.url = url;
        this.enabled = enabled;
        // only set optional values if they're present
        if (type)
            this.type = type;
        if (overrideLink)
            this.overrideLink = overrideLink;
        if (id)
            this.id = id;
        if (root)
            this.root = root;
        this.recent = new MyArray();
        recent.forEach(item => {
            this.recent.push(new FeedItem(item));
        });
        this.unreadLink = unreadLink;
        this.unread = unread;
        this.count = count;
        this.dayMap = dayMap;
        this.hourMap = hourMap;
        this.firstRecord = new Date(firstRecord);
        this.lastRecord = new Date(lastRecord);
    }
    // getters
    get averagePerDay() {
        const day = 1000 * 60 * 60 * 24;
        var span = new Date() - this.firstRecord;
        var daysSpan = 1 + Math.trunc(span / day);
        return this.count / daysSpan;
    }
    get averagePerWeek() {
        const week = 1000 * 60 * 60 * 24 * 7;
        var span = new Date() - this.firstRecord;
        var weeksSpan = 1 + Math.trunc(span / week);
        return this.count / weeksSpan;
    }
    get latestLink() {
        if (this.overrideLink) {
            return this.overrideLink;
        }
        return this.unreadLink;
    }
    get averageGap() {
        var span = this.lastRecord - this.firstRecord;
        return span / this.count;
    }
    get shouldRead() {
        if (!this.enabled) {
            return false; // disabled, don't read automatically
        }
        const week = 1000 * 60 * 60 * 24 * 7;
        if (Date.now() - this.lastRecord > week) {
            return true; // check at least once a week;
        }
        if (Date.now() - this.firstRecord < 4 * week) {
            return true; // check more frequently if a feed is new in order to learn data
        }
        var chance = this.getCumulativeUpdateChance(this.lastRecord, new Date());
        return chance > (1 / 3); // chance of an update since our last check is better than 1 in 3
    }
    // adding and processing a new list of feed items
    consume(feedItems) {
        var firstTime = !this.recent.any();
        // update last record to now;
        this.lastRecord = new Date();
        // get index of first read item;
        var i;
        for (i = 0; i < feedItems.length; i++) {
            if (this.recent.any(f => f.equals(feedItems[i]))) {
                break;
            }
        }
        // seperate out new items;
        var unreadItems = new MyArray(...feedItems.slice(0, i));
        if (unreadItems.any()) {
            this.unreadLink = unreadItems.last().link;
            this.unread += unreadItems.length;
        }
        for (var i = unreadItems.length - 1; i >= 0; i--) {
            var feedItem = unreadItems[i];
            if (this.count <= 0) {
                this.firstRecord = feedItem.date;
            }
            // update hour map
            this.hourMap = this.hourMap.map(v => v * this.count);
            this.hourMap[feedItem.date.getHours()] += 1;
            this.hourMap = this.hourMap.map(v => v / (this.count + 1));
            // update day map
            this.dayMap = this.dayMap.map(v => v * this.count);
            this.dayMap[feedItem.date.getDay()] += 1;
            this.dayMap = this.dayMap.map(v => v / (this.count + 1));
            this.count++;
            // push to recent
            this.recent.push(feedItem);
            if (this.recent.length > 10) {
                this.recent.shift();
            }
        }
        if (firstTime) {
            if (!this.recent.any(f => dateEquals(f.date, f.feedDate))) {
                this.flush();
                this.firstRecord = new Date();
            }
        }
    }
    // removes statistical data, except firstRecord
    // useful the first time a feed is run if the rss has no time data
    flush() {
        this.count = 0;
        this.dayMap = [0, 0, 0, 0, 0, 0, 0];
        this.hourMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    // return the unread link and set the link to the newest item
    updateUnread() {
        if (this.recent.any()) {
            var old = this.unreadLink;
            this.unreadLink = this.recent.last().link;
            this.unread = 0;
            return old;
        }
    }
    open(force = false) {
        if (force || this.unread > 0) {
            var link = this.latestLink;
            var numNew = this.unread;
            this.updateUnread();
            this.unread = 0;
            var promise = browser.tabs.create({ url: link });
            promise.then(tab => {
                // TODO: some sites will override this
                browser.tabs.executeScript(tab.id, { code: `document.title = "${numNew} new update${numNew > 1 ? "s" : ""} - ${this.name}";` });
            });
        }
    }
    getCumulativeUpdateChance(time1, time2) {
        var startDay = time1.getDay();
        var startHour = time1.getHours();
        var hourSpan = (time2 - time1) / (1000 * 60 * 60);
        var n = this.averagePerWeek;
        var sum = 0;
        for (var i = 0; i < hourSpan; i++) {
            var hour = (startHour + i) % 24;
            var day = (startDay + Math.trunc(i / 24)) % 7;
            sum += n * this.dayMap[day] * this.hourMap[hour];
        }
        return sum;
    }
    toSource() {
        return `(new Feed(${super.toSource()}))`;
    }
}
class FeedItem {
    constructor({ title = "No title found", // string - title of item
        feedDate, // Date - date from feed if present
        date, // Date - assumed date of update
        link // string - link to page
         } = {}, parent // the feed
    ) {
        this.title = title;
        var nFeedDate = new Date(feedDate);
        if (!isNaN(nFeedDate.getDate())) {
            this.feedDate = nFeedDate;
        }
        else {
            this.feedDate = null;
        }
        this.link = link;
        // if the feed has no date or its date is set to the future, override it
        var now = new Date();
        var nDate = new Date(date);
        if (!isNaN(nDate.getDate())) {
            this.date = nDate;
        }
        else if (this.feedDate != null && this.feedDate < now && (parent == null || !parent.lastRecord instanceof Date || isNaN(parent.lastRecord.getDate()) || this.feedDate > parent.lastRecord)) {
            this.date = this.feedDate;
        }
        else {
            this.date = now;
        }
    }
    equals(that) {
        if (typeof that != "object") {
            return false;
        }
        var titleMatch = this.title === that.title;
        var linkMatch = this.link === that.link;
        var dateMatch = dateEquals(this.feedDate, that.feedDate);
        // do not match on date, only feedDate
        return titleMatch && linkMatch && dateMatch;
    }
    toSource() {
        return `(new FeedItem(${super.toSource()}))`;
    }
}
//# sourceMappingURL=feed-model.js.map