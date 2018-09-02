"use strict";
class Reader {
    constructor(background, notifications) {
        this.background = background;
        this.notifications = notifications;
    }
    read(feed) {
        var result = this.sendGetRequest(feed.url)
            .then((data) => this.handleResponse(data, feed), (xhr, status, err) => {
            var ex = `${feed.url} threw ${xhr.status} : ${xhr.statusText} because ${status}`;
            if (this.background.notifyMe) {
                this.notifications.error(ex);
            }
            return [];
        });
        return Promise.resolve(result);
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
            var title = feed.name;
            var date = null;
            var link = "No link";
            var item = items[i];
            var titleElem = item.getElementsByTagName("title")[0];
            if (titleElem !== undefined && titleElem !== null &&
                titleElem.textContent !== null) {
                title = titleElem.textContent.trim();
            }
            var dateElem = item.getElementsByTagName("pubDate")[0];
            if (dateElem !== undefined && dateElem !== null &&
                dateElem.textContent !== null) {
                date = new Date(dateElem.textContent);
            }
            var linkElem = item.getElementsByTagName("link")[0];
            if (linkElem !== undefined && linkElem !== null &&
                linkElem.textContent !== null) {
                link = linkElem.textContent.trim();
            }
            out.push({ title, date, link });
        }
        return out;
    }
    parseAtom(atom, feed) {
        var out = [];
        var entries = atom.getElementsByTagName("entry");
        for (var i = 0; i < entries.length; i++) {
            var title = feed.name;
            var date = null;
            var link = "No link";
            var entry = entries[i];
            var titleElem = entry.getElementsByTagName("title")[0];
            if (titleElem !== undefined && titleElem !== null &&
                titleElem.textContent !== null) {
                title = titleElem.textContent.trim();
            }
            var dateElem = entry.getElementsByTagName("updated")[0];
            if (dateElem !== undefined && dateElem !== null &&
                dateElem.textContent !== null) {
                date = new Date(dateElem.textContent);
            }
            var linkElem = entry.getElementsByTagName("id")[0];
            if (linkElem !== undefined && linkElem !== null &&
                linkElem.textContent !== null) {
                link = linkElem.textContent.trim();
            }
            out.push({ title, date, link });
        }
        return out;
    }
    parseHTML(html, feed) {
        var selector = "#" + feed.id;
        var start = $(html).filter(selector).get(0);
        var url = "";
        if (start !== undefined && start !== null) {
            var img = this.findFirstImage(start);
            if (img !== null) {
                url = img.src;
            }
        }
        // lousy parsing sticks the web extension's url on this if it's relative, so remove it
        var link = url.replace(this.background.ourUrl, feed.root);
        return [{ title: feed.name, date: null, link }];
    }
    findFirstImage(start) {
        var stack = [];
        stack.push(start);
        while (stack.length > 0) {
            var node = stack.pop();
            if (node instanceof HTMLImageElement) {
                return node;
            }
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    stack.push(node.children[i]);
                }
            }
        }
        return null;
    }
}
//# sourceMappingURL=reader.js.map