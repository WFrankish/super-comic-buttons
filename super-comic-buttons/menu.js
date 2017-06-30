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
  bg.storage.forEach(feed => panels.push(createFeedPanel(feed)));
  feedListDiv.append(...panels);
}

function createFeedPanel(feed){
  var panel = $("<div>", {class: "col-4 col-m-6 padall"});
  var subPanel = $("<div>", {class: "light"});
  panel.append(subPanel);
  var row1 = $("<div>", {class: "row"});
  subPanel.append(row1);
  var name = $("<span>", {text: feed.name, class: "col-4 col-m-4 truncate padall"});
  var unreadNo = $("<span>", {text: pluralise(feed.unread, "update"), class: "col-4 col-m-4 truncate padall"});
  var timeSinceString = feed.recent.any() ? asTimeString(new Date() - feed.recent[0].date, 1) + " ago" : "unknown";
  var timeSince = $("<span>", {text: "last: " + timeSinceString, class: "col-4 col-m-4 truncate padall"});
  row1.append(name);
  row1.append(unreadNo);
  row1.append(timeSince);
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