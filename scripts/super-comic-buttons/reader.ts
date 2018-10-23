class Reader implements IReader {
    private readonly background: IBackgroundForReader;
    private readonly notifications: INotifications;

    constructor(
        background: IBackgroundForReader,
        notifications: INotifications
    ) {
        this.background = background;
        this.notifications = notifications;
    }

    read(feed: FeedDto): Promise<ReadResult[]> {
        var result = this.sendGetRequest(feed.url)
            .then(
                (data) => this.handleResponse(data, feed),
                (xhr, status, err) => {
                    var ex = `${feed.url} threw ${xhr.status} : ${xhr.statusText} because ${status}`;
                    if (this.background.storage.notifyMe) {
                        this.notifications.error(ex);
                    }
                    return [];
                }
            );
        return Promise.resolve(result);
    }

    private sendGetRequest(url: string): JQueryXHR {
        return $.ajax({
            url: url
            // TODO: Is there a fix here for slightly dodgy xml?
            // I found one with '&hellip;' that won't parse via ajax, but firefox's built in thing still manages...
        });
    }


    private handleResponse(data: Element, feed: FeedDto): ReadResult[] {
        if ($.isXMLDoc(data)) {
            return this.parseXml(data, feed);
        } else {
            return this.parseHTML(data, feed);
        }
    };

    private parseXml(xml: Element, feed: FeedDto): ReadResult[] {
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

    private parseRss(rss: Element, feed: FeedDto): ReadResult[] {
        var out = [];
        var items = rss.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++) {
            var title = feed.name;
            var date: Date | null = null;
            var link = "No link";

            var item = items[i];
            var titleElem = item.getElementsByTagName("title")[0];
            if (
                titleElem !== undefined && titleElem !== null &&
                titleElem.textContent !== null
            ) {
                title = titleElem.textContent.trim();
            }
            var dateElem = item.getElementsByTagName("pubDate")[0];
            if (
                dateElem !== undefined && dateElem !== null &&
                dateElem.textContent !== null
            ) {
                date = new Date(dateElem.textContent);
            }
            var linkElem = item.getElementsByTagName("link")[0];
            if (
                linkElem !== undefined && linkElem !== null &&
                linkElem.textContent !== null
            ) {
                link = linkElem.textContent.trim();
            }
            out.push({ title, date, link });
        }
        return out;
    }

    private parseAtom(atom: Element, feed: FeedDto): ReadResult[] {
        var out = [];
        var entries = atom.getElementsByTagName("entry");
        for (var i = 0; i < entries.length; i++) {
            var title = feed.name;
            var date: Date | null = null;
            var link = "No link";

            var entry = entries[i];
            var titleElem = entry.getElementsByTagName("title")[0];
            if (
                titleElem !== undefined && titleElem !== null &&
                titleElem.textContent !== null
            ) {
                title = titleElem.textContent.trim();
            }
            var dateElem = entry.getElementsByTagName("updated")[0];
            if (
                dateElem !== undefined && dateElem !== null &&
                dateElem.textContent !== null
            ) {
                date = new Date(dateElem.textContent);
            }
            var linkElem = entry.getElementsByTagName("id")[0];
            if (
                linkElem !== undefined && linkElem !== null &&
                linkElem.textContent !== null
            ) {
                link = linkElem.textContent.trim();
            }
            out.push({ title, date, link });
        }
        return out;
    }

    private parseHTML(html: Element, feed: FeedDto): ReadResult[] {
        var selector = "#" + feed.id;
        var start = $(selector, html).get(0);
        var url = "";

        if (start !== undefined && start !== null) {
            var img = this.findFirstImage(start);
            if (img !== null) {
                url = img.src;
            }
        }

        var link = url;
        if (feed.root !== undefined) {
            // lousy parsing sticks the web extension's url on this if it's relative, so remove it
            var link = url.replace(this.background.ourUrl, feed.root);
        }
        return [{ title: feed.name, date: null, link }];
    }

    private findFirstImage(start: Element): HTMLImageElement | null {
        var stack: Element[] = [];
        stack.push(start);
        while (stack.length > 0) {
            var node = stack.pop() as Element;
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