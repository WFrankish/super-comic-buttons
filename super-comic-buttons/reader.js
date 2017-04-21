"use strict";

function sendGetRequest(url){
    return $.ajax({
       url: url,
       error: onError
    });
}

function onError(xhr){
    var err = `${xhr.status}:  ${xhr.statusText}`;
    console.log(err);
    throw err;
}

function handleResponse(data){
    if($.isXMLDoc(data)){
        return parseXml(data);
    }else{
        return parseHTML(data, id, root);
    }
};

function parseXml(xml){
    var atom = xml.getElementsByTagName("feed");
    if(atom.length > 0){
        return parseAtom(atom[0]);
    } 
    var rss = xml.getElementsByTagName("rss");
    if(rss.length > 0){
        return parseRss(rss[0]);
    }
    throw "unknown format";
}

function parseRss(rss){
    var out = [];
    var items = rss.getElementsByTagName("item");
    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var titleElem = or(item.getElementsByTagName("title")[0]);
        var title = or(titleElem.textContent, "No title");
        var dateElem = or(item.getElementsByTagName("pubDate")[0]);
        var date = dateElem ? new Date(dateElem.textContent) : null;
        var linkElem = or(item.getElementsByTagName("link")[0]);
        var link = or(linkElem.textContent, "No link");
        out.push(new FeedItem(title, date, link));
    }
    return out;
}

function parseAtom(atom){
    var out = [];
    var entries = atom.getElementsByTagName("entry");
    for(var i = 0; i < entries.length; i++){
        var entry = entries[i];
        var titleElem = or(entry.getElementsByTagName("title")[0]);
        var title = or(titleElem.textContent, "No title");
        var dateElem = or(entry.getElementsByTagName("updated")[0]);
        var date = dateElem ? new Date(dateElem.textContent) : null;
        var linkElem = or(entry.getElementsByTagName("link")[0]);
        var link = or(linkElem.attributes["href"].nodeValue,"No link");
        out.push(new FeedItem(title, date, link));
    }
    return out;
}

function parseHTML(html, id, root){
    var selector = "#" + id;
    var start = or($(selector, html).get(0) || $(html).filter(selector).get(0));
    var img = findFirstImage(start);
    var url = or(img.src, "");
    // lousy parsing sticks the web extension's url on this if it's relative;
    return new FeedItem("No title", new Date(), url.replace(ourUrl, root));
}

function findFirstImage(start){
    var stack = [];
    stack.push(start);
    while(!stack.isEmpty){
        var node = stack.pop();
        if(node.tagName === "IMG"){
            return node;
        }
        if(node.children){
            for(var i = 0; i < node.children.length; i++){
                stack.push(node.children[i]);
            }
        }
    }
    return {};
}