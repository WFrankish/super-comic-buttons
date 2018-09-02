"use strict";
class Reader {
    constructor(background, notifications) {
        this.background = background;
        this.notifications = notifications;
    }
    read(feed) {
        var resp = this.sendGetRequest(feed.url);
        var xml = resp.then(data => this.handleResponse(data, feed));
        var success = xml.then(data => {
            feed.consume(data);
            return true;
        }, function (xhr, text, err) {
            var e = `${feed.url} threw ${xhr.status} : ${xhr.statusText} because ${text}`;
            if (this.background.notifyMe) {
                this.notifications.error(feed.title, e);
            }
            return false;
        });
        return success;
    }
    sendGetRequest(url) {
        return $.ajax({
            url: url
            // TODO: Is there a fix here for slightly dodgy xml?
            // I found one with '&hellip;' that won't parse via ajax, but firefox's built in thing still manages...
        });
    }
    handleResponse(data, feed) {
        if ($.isXMLDoc(data)) {
            return this.parseXml(data, feed);
        }
        else {
            return this.parseHTML(data, feed);
        }
    }
    ;
    parseXml(xml, feed) {
        var atom = xml.getElementsByTagName("feed");
        if (atom.length > 0) {
            return this.parseAtom(atom[0], feed);
        }
        var rss = xml.getElementsByTagName("rss");
        if (rss.length > 0) {
            return this.parseRss(rss[0], feed);
        }
        throw "unknown format";
    }
    parseRss(rss, feed) {
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
    parseAtom(atom, feed) {
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
    parseHTML(html, feed) {
        var selector = "#" + feed.id;
        var start = or($(selector, html).get(0) || $(html).filter(selector).get(0));
        var img = this.findFirstImage(start);
        var url = or(img.src, "");
        // lousy parsing sticks the web extension's url on this if it's relative, so remove it
        var link = url.replace(ourUrl, feed.root);
        return [new FeedItem({ link })];
    }
    findFirstImage(start) {
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
}
//# sourceMappingURL=reader.js.map