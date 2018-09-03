"use strict";
var xhr;
var requests;
QUnit.module("reader", {
    beforeEach: () => {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = (xhr) => requests.push(xhr);
    },
    afterEach: () => {
        xhr.restore();
    }
});
function getMockBackground() {
    var background = {
        ourUrl: "file://",
        notifyMe: true
    };
    return background;
}
function getMockFeed() {
    var feed = {
        name: "test",
        url: "",
        type: "",
        overrideLink: "",
        id: "",
        root: "",
        unreadLink: "",
        lastRecord: new Date()
    };
    return feed;
}
QUnit.test("rss-standard", async function (assert) {
    var background = getMockBackground();
    var notifications = new ConsoleNotifications();
    var reader = new Reader(background, notifications);
    var result = reader.read(getMockFeed());
    requests[0].respond(200, {
        "Content-Type": "application/xml"
    }, sleepless_rss_standard);
    await result.then(arr => {
        arr.forEach(i => {
            assert.notEqual(i.title, "test");
            assert.notEqual(i.date, null);
            assert.notEqual(i.date.toDateString(), "Invalid Date");
            assert.notEqual(i.link, "");
        });
    });
});
QUnit.test("rss-no-dates", async function (assert) {
    var background = getMockBackground();
    var notifications = new ConsoleNotifications();
    var reader = new Reader(background, notifications);
    var result = reader.read(getMockFeed());
    requests[0].respond(200, {
        "Content-Type": "application/xml"
    }, awkward_rss_no_dates);
    await result.then(arr => {
        arr.forEach(i => {
            assert.notEqual(i.title, "test");
            assert.equal(i.date, null);
            assert.notEqual(i.link, "");
        });
    });
});
QUnit.test("atom-standard", async function (assert) {
    var background = getMockBackground();
    var notifications = new ConsoleNotifications();
    var reader = new Reader(background, notifications);
    var result = reader.read(getMockFeed());
    requests[0].respond(200, {
        "Content-Type": "application/xml"
    }, xkcd_atom_standard);
    await result.then(arr => {
        arr.forEach(i => {
            assert.notEqual(i.title, "test");
            assert.notEqual(i.date, null);
            assert.notEqual(i.date.toDateString(), "Invalid Date");
            assert.notEqual(i.link, "");
        });
    });
});
QUnit.test("html-no-root", async function (assert) {
    var background = getMockBackground();
    var notifications = new ConsoleNotifications();
    var reader = new Reader(background, notifications);
    var feed = getMockFeed();
    feed.id = "cc-comic";
    var result = reader.read(feed);
    requests[0].respond(200, {
        "Content-Type": "text/html"
    }, monster_html_no_root);
    await result.then(arr => {
        arr.forEach(i => {
            console.log(i);
            assert.equal(i.title, "test");
            assert.equal(i.date, null);
            assert.notEqual(i.link, "");
        });
    });
});
QUnit.test("html-root", async function (assert) {
    var background = getMockBackground();
    var notifications = new ConsoleNotifications();
    var reader = new Reader(background, notifications);
    var feed = getMockFeed();
    feed.id = "body";
    feed.root = "http://www.whatever.com";
    var result = reader.read(feed);
    requests[0].respond(200, {
        "Content-Type": "text/html"
    }, nuzlocke_html_root);
    await result.then(arr => {
        arr.forEach(i => {
            console.log(i);
            assert.equal(i.title, "test");
            assert.equal(i.date, null);
            assert.notEqual(i.link, "");
        });
    });
});
//# sourceMappingURL=reader-tests.js.map