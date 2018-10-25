"use strict";
class FeedHandler {
    newRssFeed(name, url) {
        var result = {
            name,
            url,
            enabled: true,
            type: "rss",
            recent: [],
            unread: 0,
            count: 0,
            map: [],
            firstRecord: new Date().toDateString()
        };
        this.flush(result);
        return result;
    }
    newHtmlFeed(name, url, id, root, overrideLink) {
        var result = {
            name,
            url,
            enabled: true,
            type: "html",
            overrideLink,
            id,
            root,
            recent: [],
            unread: 0,
            count: 0,
            map: [],
            firstRecord: new Date().toDateString()
        };
        this.flush(result);
        return result;
    }
    open(feed, force = false) {
        if (force || feed.unread > 0) {
            var link = this.latestLink(feed);
            if (link != null) {
                var numNew = feed.unread;
                this.updateUnread(feed);
                var promise = browser.tabs.create({ url: link });
                promise.then(tab => {
                    // TODO: some sites will override this
                    browser.tabs.executeScript(tab.id, { code: `document.title = "${numNew} new update${numNew > 1 ? "s" : ""} - ${feed.name}";` });
                });
            }
        }
    }
    shouldRead(feed) {
        if (!feed.enabled) {
            return false; // disabled, don't read automatically
        }
        if (feed.firstRecord === undefined || feed.lastRecord === undefined) {
            return true; // never read;
        }
        const week = 1000 * 60 * 60 * 24 * 7;
        var lastRecord = new Date(feed.lastRecord);
        var firstRecord = new Date(feed.firstRecord);
        if (Date.now() - lastRecord.valueOf() > week) {
            return true; // check at least once a week;
        }
        if (Date.now() - firstRecord.valueOf() < 4 * week) {
            return true; // check more frequently if a feed is new in order to learn data
        }
        var chance = this.getCumulativeUpdateChance(feed, lastRecord, new Date());
        return chance > (1 / 3); // chance of an update since our last check is better than 1 in 3
    }
    consume(feed, items) {
        var now = new Date();
        var firstTime = feed.recent.length == 0;
        // update last record to now
        feed.lastRecord = new Date().toString();
        // get index of first read item
        // assume: items are in newest first order
        var i;
        for (i = 0; i < items.length; i++) {
            if (feed.recent.some(f => this.equals(f, items[i], now))) {
                break;
            }
        }
        // seperate out new items
        var unreadItems = new MyArray(...items.slice(0, i));
        if (unreadItems.any()) {
            feed.unreadLink = unreadItems.last().link;
            feed.unread += unreadItems.length;
        }
        for (var i = unreadItems.length - 1; i >= 0; i--) {
            var feedItem = this.newFeedItem(unreadItems[i], now);
            if (feed.recent.length == 0) {
                feed.firstRecord = feedItem.date.toString();
            }
            // update map
            var date = new Date(feedItem.date);
            var hour = date.getUTCHours();
            var day = date.getUTCDay();
            feed.map = feed.map.map(d => d.map(v => v * feed.count));
            feed.map[day][hour]++;
            feed.map = feed.map.map(d => d.map(v => v / (feed.count + 1)));
            feed.count++;
            // push to recent
            feed.recent.push(feedItem);
            if (feed.recent.length > 10) {
                feed.recent.shift();
            }
        }
        if (firstTime) {
            if (feed.recent.every(f => f.date == now.toString())) {
                // if all items are recorded as now, and this was the first time
                // then the feed has no real dates and the existing record is bunk
                this.flush(feed);
                feed.firstRecord = new Date().toString();
            }
        }
    }
    offSetMapForTimeZone(feed) {
        var offset = Math.trunc(new Date().getTimezoneOffset() / 60);
        var result = [];
        feed.map.forEach(() => {
            result.push([]);
        });
        var days = feed.map.length;
        var hours = feed.map[0].length;
        for (var ii = 0; ii < days; ii++) {
            for (var jj = 0; jj < hours; jj++) {
                var i = ii;
                var j = jj - offset;
                if (j < 0) {
                    i = (i + days - 1) % days;
                }
                if (j >= hours) {
                    i = (i + 1) % days;
                }
                j = (hours + j) % hours;
                result[i][j] = feed.map[ii][jj];
            }
        }
        return result;
    }
    averagePerDay(feed) {
        if (feed.lastRecord === undefined) {
            return 0;
        }
        const day = 1000 * 60 * 60 * 24;
        var firstRecord = new Date(feed.firstRecord);
        var lastRecord = new Date(feed.lastRecord);
        var span = lastRecord.valueOf() - firstRecord.valueOf();
        var daysSpan = 1 + Math.trunc(span / day);
        return feed.count / daysSpan;
    }
    averagePerWeek(feed) {
        if (feed.lastRecord === undefined) {
            return 0;
        }
        const week = 1000 * 60 * 60 * 24 * 7;
        var firstRecord = new Date(feed.firstRecord);
        var lastRecord = new Date(feed.lastRecord);
        var span = lastRecord.valueOf() - firstRecord.valueOf();
        var weekSpan = 1 + Math.trunc(span / week);
        return feed.count / weekSpan;
    }
    latestLink(feed) {
        if (feed.overrideLink !== undefined) {
            return feed.overrideLink;
        }
        else if (feed.unreadLink !== undefined) {
            return feed.unreadLink;
        }
        return null;
    }
    averageGap(feed) {
        if (feed.lastRecord === undefined) {
            return NaN;
        }
        var lastRecord = new Date(feed.lastRecord);
        var firstRecord = new Date(feed.firstRecord);
        var span = lastRecord.valueOf() - firstRecord.valueOf();
        return span / feed.count;
    }
    updateUnread(feed) {
        var recent = new MyArray(...feed.recent);
        if (recent.any()) {
            feed.unreadLink = recent.last().link;
            feed.unread = 0;
        }
    }
    getCumulativeUpdateChance(feed, time1, time2) {
        var startDay = time1.getUTCDay();
        var startHour = time1.getUTCHours();
        var hourSpan = (time2.valueOf() - time1.valueOf()) / (1000 * 60 * 60);
        var n = this.averagePerWeek(feed);
        var sum = 0;
        for (var i = 0; i < hourSpan; i++) {
            var hour = (startHour + i) % 24;
            var day = (startDay + Math.trunc(i / 24)) % 7;
            sum += n * feed.map[day][hour];
        }
        return sum;
    }
    equals(existing, newer, now) {
        var dateOK = newer.date == null
            || newer.date.valueOf() > now.valueOf()
            || new Date(existing.date).valueOf() === newer.date.valueOf();
        return dateOK && existing.link === newer.link && existing.title === newer.title;
    }
    newFeedItem(readResult, now) {
        var date;
        if (readResult.date == null || readResult.date.valueOf() > now.valueOf()) {
            date = now.toString();
        }
        else {
            date = readResult.date.toString();
        }
        return {
            title: readResult.title,
            date,
            link: readResult.link
        };
    }
    flush(feed) {
        feed.count = 0;
        feed.map = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }
}
//# sourceMappingURL=feed-handler.js.map