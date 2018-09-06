var clock : sinon.SinonFakeTimers;
var earlier = new Date("Jan 01 2000 11:00:00 GMT+0000");
var now = new Date("Jan 01 2000 12:00:00 GMT+0000");
var later = new Date("Jan 01 2000 13:00:00 GMT+0000");
var nowSummer = new Date("Jun 01 2000 12:00:00 GMT+0000");

QUnit.module("feed-handler", {
    beforeEach: () => {
        clock = sinon.useFakeTimers(now);

    },
    afterEach: () => {
        clock.restore();
    }
});

QUnit.test("consume - first time - set first and last record", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        {title: "", date: earlier, link: ""}
    ]);

    assert.equal(feed.firstRecord, earlier.toString());
    assert.equal(feed.lastRecord, later.toString());
});

QUnit.test("consume - not first time - only set last record", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        {title: "a", date: earlier, link: ""}
    ]);

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        {title: "b", date: now, link: ""}
    ]);

    assert.equal(feed.firstRecord, earlier.toString());
    assert.equal(feed.lastRecord, later.toString());
});

QUnit.test("consume - set unread link", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        {title: "", date: earlier, link: "www"}
    ]);

    assert.equal(feed.unreadLink, "www");
});

QUnit.test("consume - set unread link", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        {title: "", date: earlier, link: "www"}
    ]);

    assert.equal(feed.unreadLink, "www");
});

QUnit.test("consume - set unread link", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        {title: "", date: earlier, link: "www"}
    ]);

    assert.equal(feed.unreadLink, "www");
});

QUnit.test("consume - no dates, first time - flushes", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        { title: "", date: null, link: ""},
        { title: "", date: null, link: ""}
    ]);

    assert.equal(feed.count, 0);
});

QUnit.test("consume - no dates, not first time - does not flush", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        { title: "b", date: null, link: "bbb"},
        { title: "a", date: null, link: "aaa"}
    ]);

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        { title: "c", date: null, link: "ccc"},
        { title: "b", date: null, link: "bbb"},
        { title: "a", date: null, link: "aaa"}
    ]);

    assert.equal(feed.count, 1);
});

QUnit.test("consume - mixed dates - still recognises read", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        { title: "d", date: earlier, link: "ddd"},
        { title: "c", date: null, link: "ccc"},
        { title: "b", date: earlier, link: "bbb"},
        { title: "a", date: null, link: "aaa"}
    ]);

    clock = sinon.useFakeTimers(later);

    feedHandler.consume(feed, [
        { title: "h", date: earlier, link: "hhh"},
        { title: "g", date: null, link: "ggg"},
        { title: "f", date: earlier, link: "fff"},
        { title: "e", date: null, link: "eee"},
        { title: "d", date: earlier, link: "ddd"},
        { title: "c", date: null, link: "ccc"},
        { title: "b", date: earlier, link: "bbb"},
        { title: "a", date: null, link: "aaa"}
    ]);

    assert.equal(8, feed.count);
});

QUnit.test("consume - future date - corrects", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        { title: "", date: later, link: ""}
    ]);

    assert.equal(now.toString(), feed.recent[0].date);
});

QUnit.test("consume - normal time - maps correctly", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    clock = sinon.useFakeTimers(nowSummer);

    feedHandler.consume(feed, [
        { title: "", date: new Date("Fri Jun 04 1999 11:00:00 GMT+0100"), link: ""},
        { title: "", date: new Date("Sat Jun 05 1999 12:00:00 GMT+0100"), link: ""},
        { title: "", date: new Date("Sun Jun 06 1999 13:00:00 GMT+0100"), link: ""}
    ]);

    assert.equal(feed.map[5][10], (1/3));
    assert.equal(feed.map[6][11], (1/3));
    assert.equal(feed.map[0][12], (1/3));

    var total = 0;
    feed.map.forEach(d => d.forEach(h => total += h));

    assert.equal(total, 1);
});

QUnit.test("consume - summer time - maps correctly", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feedHandler.consume(feed, [
        { title: "", date: new Date("Fri Jan 01 1999 11:00:00 GMT+0000"), link: ""},
        { title: "", date: new Date("Sat Jan 02 1999 12:00:00 GMT+0000"), link: ""},
        { title: "", date: new Date("Sun Jan 03 1999 13:00:00 GMT+0000"), link: ""}
    ]);

    assert.equal(feed.map[5][11], (1/3));
    assert.equal(feed.map[6][12], (1/3));
    assert.equal(feed.map[0][13], (1/3));

    var total = 0;
    feed.map.forEach(d => d.forEach(h => total += h));

    assert.equal(total, 1);
});

QUnit.test("averagePerDay", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feed.firstRecord = new Date("Jan 01 1999 11:00:00 GMT+0000").toString();
    feed.count = 2;

    assert.equal(feedHandler.averagePerDay(feed), 0);

    feed.lastRecord = new Date("Jan 01 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerDay(feed), 2);

    feed.lastRecord = new Date("Jan 02 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerDay(feed), 1);

    feed.lastRecord = new Date("Jan 04 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerDay(feed), 0.5);
});

QUnit.test("averagePerWeek", function ( assert: Assert) {
    var feedHandler = new FeedHandler();

    var feed = feedHandler.newRssFeed("", "");

    feed.firstRecord = new Date("Jan 01 1999 11:00:00 GMT+0000").toString();
    feed.count = 2;

    assert.equal(feedHandler.averagePerWeek(feed), 0);

    feed.lastRecord = new Date("Jan 04 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerWeek(feed), 2);

    feed.lastRecord = new Date("Jan 11 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerWeek(feed), 1);

    feed.lastRecord = new Date("Jan 25 1999 11:00:00 GMT+0000").toString();    
    assert.equal(feedHandler.averagePerWeek(feed), 0.5);
});
