"use strict";

var bg;

var feedListDiv;

var nameText;
var urlText;
var xmlTypeRadio;
var domTypeRadio;
var specialRow;
var idText;
var rootText;
var overrideText;
var createNewButton;

$(init);

function init(){
  bg = browser.extension.getBackgroundPage();
  getElements();
  nameText.on("input", refreshCreateForm);
  urlText.on("input", refreshCreateForm);
  idText.on("input", refreshCreateForm);
  overrideText.on("input", refreshCreateForm);
  xmlTypeRadio.change(refreshCreateForm);
  domTypeRadio.change(refreshCreateForm);
  refreshFeedList();
  refreshCreateForm();
  createNewButton.click(createNewFeed);
  bg.addEventListener('unreadNoChange', refreshFeedList);
};

function getElements(){
  feedListDiv = $("#feedListDiv");
  
  nameText = $("#nameText");
  urlText = $("#urlText");
  xmlTypeRadio = $("#xmlTypeRadio");
  domTypeRadio = $("#domTypeRadio");
  specialRow = $("#specialRow");
  idText = $("#idText");
  rootText = $("#rootText");
  overrideText = $("#overrideText");
  createNewButton = $("#createNewButton");
};

function refreshFeedList(){
  feedListDiv.empty();
  var panels = [];
  var feeds = new MyArray(...bg.storage);
  feeds.sort(function(a, b){
    var lastA = a.recent.last();
    var lastB = b.recent.last();
    var numA = lastA == null ? 0 : lastA.date;
    var numB = lastB == null ? 0 : lastB.date;
    return numB - numA;
  })
  feeds.forEach(feed => panels.push(createFeedPanel(feed)));
  feedListDiv.append(...panels);
}

function createFeedPanel(feed){
  var panel = $("<div>", {class: "col-4 col-m-6 padall"});
  var subPanel = $("<div>", {class: "light row"});
  panel.append(subPanel);
  var row1 = $("<div>", {class: "row"});
  subPanel.append(row1);
  var name = $("<div>", {text: feed.name, class: "col-6 col-m-4 truncate padall"});
  var unreadNo = $("<div>", {text: pluralise(feed.unread, "update"), class: "col-4 col-m-4 truncate padall"});
  var openButton = $("<input>", {type: "button", value: "Open!"});
  openButton.click(_ => bg.openThis(feed));
  row1.append(name);
  row1.append(unreadNo);
  row1.append(openButton);
  var row2 = $("<div>", {class: "row"});
  subPanel.append(row2);
  var lastReadString = feed.lastRecord > new Date(0) ? asTimeString(new Date() - feed.lastRecord, 1) + " ago" : "never";
  var lastRead = $("<div>", {text: "read: " + lastReadString, class: "col-5 col-m-4 truncate padall"});
  var lastUpdateString = feed.recent.any() ? asTimeString(new Date() - feed.recent.last().date, 1) + " ago" : "unknown";
  var lastUpdate = $("<div>", {text: "updated: " + lastUpdateString, class: "col-5 col-m-4 truncate padall"});
  var readButton = $("<input>", {type: "button", value: "Read!"});
  readButton.click(_ => bg.readThis(feed));
  row2.append(lastRead);
  row2.append(lastUpdate);
  row2.append(readButton);
  return panel;
}

function refreshCreateForm(){
  var validated = true;
  if(nameText.val()){
    nameText.removeClass("invalid");
    validated = validated && true;
  } else {
    nameText.addClass("invalid");
    validated = false;
  }
  if(urlText.val()){
    urlText.removeClass("invalid");
    validated = validated && true;
  } else {
    urlText.addClass("invalid");
    validated = false;
  }
  validated = urlText.val() && validated;
  var htmlMode = domTypeRadio.is(":checked");
  if(htmlMode){
    specialRow.show();
    if(idText.val()){
      idText.removeClass("invalid");
      validated = validated && true;
    } else {
      idText.addClass("invalid");
      validated = false;
    }
    if(overrideText.val()){
      overrideText.removeClass("invalid");
      validated = validated && true;
    } else {
      overrideText.addClass("invalid");
      validated = false;
    }
  } else {
    specialRow.hide();
  }
  if(validated){
    createNewButton.prop("disabled", false);
  } else {
    createNewButton.prop("disabled", true);
  }
};

function createNewFeed(){
  var name = nameText.val();
  var url = urlText.val();
  var feed;
  var htmlMode = domTypeRadio.is(":checked");
  if(htmlMode){
    var id = idText.val();
    var root = rootText.val();
    var overrideLink = overrideText.val();
    if(root){
      feed = new Feed({name: name, url: url, id: id, root: root, overrideLink: overrideLink});
    } else {
      feed = new Feed({name: name, url: url, id: id, overideLink: overrideLink});
    }
  } else {
    feed = new Feed({name: name, url: url});
  }
  bg.createNewFeed(feed);
  nameText.val("");
  urlText.val("");
  idText.val("");
  rootText.val("");
  overrideText.val("");
}