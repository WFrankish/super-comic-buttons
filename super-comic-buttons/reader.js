"use strict";
function read(feed) {
    var resp = sendGetRequest(feed.url);
    var xml = resp.then(data => handleResponse(data, feed));
    var success = xml.then(data => {
        feed.consume(data);
        return true;
    }, function (xhr, text, err) {
        var e = `${feed.url} threw ${xhr.status} : ${xhr.statusText} because ${text}`;
        if (browser.extension.getBackgroundPage().notifyMe) {
            notifyError(feed.title, e);
        }
        return false;
    });
    return success;
}
function sendGetRequest(url) {
    return $.ajax({
        url: url
        // TODO: Is there a fix here for slightly dodgy xml?
        // I found one with '&hellip;' that won't parse via ajax, but firefox's built in thing still manages...
    });
}
function handleResponse(data, feed) {
    if ($.isXMLDoc(data)) {
        return parseXml(data, feed);
    }
    else {
        return parseHTML(data, feed);
    }
}
;
function parseXml(xml, feed) {
    var atom = xml.getElementsByTagName("feed");
    if (atom.length > 0) {
        return parseAtom(atom[0], feed);
    }
    var rss = xml.getElementsByTagName("rss");
    if (rss.length > 0) {
        return parseRss(rss[0], feed);
    }
    throw "unknown format";
}
function parseRss(rss, feed) {
    var out = [];
    var items = rss.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var titleElem = or(item.getElementsByTagName("title")[0]);
        var title = or(titleElem.textContent, "No title");
        var dateElem = or(item.getElementsByTagName("pubDate")[0]);
        var feedDate = dateElem ? new Date(dateElem.textContent) : null;
        var linkElem = or(item.getElementsByTagName("link")[0]);
        var link = or(linkElem.textContent, "No link");
        out.push(new FeedItem({ title, feedDate, link }, feed));
    }
    return out;
}
function parseAtom(atom, feed) {
    var out = [];
    var entries = atom.getElementsByTagName("entry");
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var titleElem = or(entry.getElementsByTagName("title")[0]);
        var title = or(titleElem.textContent, "No title");
        var dateElem = or(entry.getElementsByTagName("updated")[0]);
        var feedDate = dateElem ? new Date(dateElem.textContent) : null;
        var linkElem = or(entry.getElementsByTagName("link")[0]);
        var link = or(linkElem.attributes["href"].nodeValue, "No link");
        out.push(new FeedItem({ title, feedDate, link }, feed));
    }
    return out;
}
function parseHTML(html, feed) {
    var selector = "#" + feed.id;
    var start = or($(selector, html).get(0) || $(html).filter(selector).get(0));
    var img = findFirstImage(start);
    var url = or(img.src, "");
    // lousy parsing sticks the web extension's url on this if it's relative, so remove it
    var link = url.replace(ourUrl, feed.root);
    return [new FeedItem({ link })];
}
function findFirstImage(start) {
    var stack = [];
    stack.push(start);
    while (!stack.isEmpty) {
        var node = stack.pop();
        if (node.tagName === "IMG") {
            return node;
        }
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                stack.push(node.children[i]);
            }
        }
    }
    return {};
}
//# sourceMappingURL=reader.js.map