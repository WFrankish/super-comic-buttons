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
  var nameDiv = $("<div>", {class: "col-6 col-m-4 padall truncate"});
  var name = $("<b>", {text: feed.name});
  nameDiv.append(name);
  styleDiv(name, feed);
  var unreadNo = $("<div>", {text: pluralise(feed.unread, "update"), class: "col-4 col-m-4 truncate padall"});
  var openDiv = $("<div>", { class: "col-2 col-m-4"});
  var openButton = $("<input>", {type: "button", value: "Open!"});
  openButton.click(_ => bg.openThis(feed));
  openDiv.append(openButton);
  if(feed.unread > 0){
    openButton.addClass("attention");
  }
  row1.append(nameDiv);
  row1.append(unreadNo);
  row1.append(openDiv);
  var row2 = $("<div>", {class: "row"});
  subPanel.append(row2);
  var lastReadString = feed.lastRecord > new Date(0) ? asTimeString(new Date() - feed.lastRecord, 1) + " ago" : "never";
  var lastRead = $("<div>", {text: "read: " + lastReadString, class: "col-5 col-m-4 truncate padall"});
  var lastUpdateString = feed.recent.any() ? asTimeString(new Date() - feed.recent.last().date, 1) + " ago" : "unknown";
  var lastUpdate = $("<div>", {text: "updated: " + lastUpdateString, class: "col-5 col-m-4 truncate padall"});
  var readDiv = $("<div>", { class: "col-2 col-m-4"});
  var readButton = $("<input>", {type: "button", value: "Read!"});
  readButton.click(_ => bg.readThis(feed));
  readDiv.append(readButton);
  row2.append(lastRead);
  row2.append(lastUpdate);
  row2.append(readDiv);
  if(feed.enabled){
    var row3 = $("<div>", {class: "row"});
    subPanel.append(row3);
    var map = [];
    feed.dayMap.forEach(function(day){
      var hours = []
      feed.hourMap.forEach(hour => hours.push(day*hour));
      map.push(hours);
    });
    var table = $("<table>", {class: "col-m-12, col-12"});
    row3.append(table);
    var days = $("<tr>");
    table.append(days);
    days.append($("<th>", {text: "S", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[0] * feed.averagePerWeek)}, 86%, 56%)`, title: `Sunday - average of ${pluralise(Math.round(feed.dayMap[0]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "M", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[1] * feed.averagePerWeek)}, 86%, 56%)`, title: `Monday - average of ${pluralise(Math.round(feed.dayMap[1]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "T", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[2] * feed.averagePerWeek)}, 86%, 56%)`, title: `Tuesday - average of ${pluralise(Math.round(feed.dayMap[2]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "W", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[3] * feed.averagePerWeek)}, 86%, 56%)`, title: `Wednesday - average of ${pluralise(Math.round(feed.dayMap[3]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "T", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[4] * feed.averagePerWeek)}, 86%, 56%)`, title: `Thursday - average of ${pluralise(Math.round(feed.dayMap[4]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "F", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[5] * feed.averagePerWeek)}, 86%, 56%)`, title: `Friday - average of ${pluralise(Math.round(feed.dayMap[5]*feed.averagePerWeek*100)/100, "update")}`}));
    days.append($("<th>", {text: "S", class:"day", style: `color: hsl(${colourFromNumber(feed.dayMap[6] * feed.averagePerWeek)}, 86%, 56%)`, title: `Saturday - average of ${pluralise(Math.round(feed.dayMap[6]*feed.averagePerWeek*100)/100, "update")}`}));
    for(var i = 0; i < 24; i++){
      var t = $("<tr>"); // show as 0#
      table.append(t);
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[0][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Sunday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[0][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[1][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Monday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[1][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[2][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Tuesday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[2][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[3][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Wednesday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[3][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[4][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Thursday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[4][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[5][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Friday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[5][i]*feed.averagePerWeek*100)/100, "update")}`}));
      t.append($("<td>", {class: "num", style: `background-color: hsl(${colourFromNumber(map[6][i] * feed.averagePerWeek)}, 49%, 56%)`, title: `Saturday ${("0" + i).slice(-2)}:00 - average of ${pluralise(Math.round(map[6][i]*feed.averagePerWeek*100)/100, "update")}`}));
    }
  }
  var row4 = $("<div>", {class: "row"});
  subPanel.append(row4);
  var editDiv = $("<div>", { class: "col-5 col-m-4"});
  var editButton = $("<input>", {type: "button", value: "Edit"});
  editButton.click(event => editMode(feed, event));
  editDiv.append(editButton);
  var activateDiv = $("<div>", { class: "col-5 col-m-4"});
  var activateButton;
  if(feed.enabled){
    activateButton = $("<input>", {type: "button", value: "Deactivate"});
  } else {
    activateButton = $("<input>", {type: "button", value: "Activate"});
  }
  activateButton.click(_ => bg.toggleActiveness(feed));
  activateDiv.append(activateButton);
  var deleteDiv = $("<div>", { class: "col-2 col-m-4"});
  var deleteButton = $("<input>", {type: "button", value: "Delete?"});
  deleteButton.click(event => confirmDelete(feed, event));
  deleteDiv.append(deleteButton);
  row4.append(editDiv);
  row4.append(activateDiv);
  row4.append(deleteDiv);
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
      feed = new Feed({name: name, url: url, id: id, root: root, overrideLink: overrideLink, type: "html"});
    } else {
      feed = new Feed({name: name, url: url, id: id, overideLink: overrideLink, type: "html"});
    }
  } else {
    feed = new Feed({name: name, url: url, type: "rss"});
  }
  bg.createNewFeed(feed);
  nameText.val("");
  urlText.val("");
  idText.val("");
  rootText.val("");
  overrideText.val("");
}

function editMode(feed, event){
  var button = $(event.target);
  createNewButton.unbind("click");
  createNewButton.click(_ => editFeed(feed));
  createNewButton.addClass("attention");
  createNewButton.val("Save edits");
  var oldDisabledButtons = feedListDiv.find(":disabled");
  oldDisabledButtons.each(function(i){
    var butt = $(oldDisabledButtons[i]);
    butt.prop("disabled", false)
    butt.val("Edit");
  }); 
  button.prop("disabled", true);
  button.val("^ ^ ^ ^");
  nameText.val(feed.name);
  urlText.val(feed.url);
  if(feed.type === "html"){
    domTypeRadio.click();
    overrideText.val(feed.overrideLink);
    idText.val(feed.id);
    if(feed.root){
      rootText.val(feed.root);
    } else {
      rootText.val("");
    }
  } else {
    xmlTypeRadio.click();
  }
  refreshCreateForm();
};

// TODO if a reload happens, edit progress will be lost
// they only happen when a user causes one, or on the infrequent automatic read, so this is acceptable for now
function editFeed(feed){
  var name = nameText.val();
  var url = urlText.val();
  var id = idText.val();
  var root = rootText.val();
  var overrideLink = overrideText.val();
  var htmlMode = domTypeRadio.is(":checked");
  feed.name = name;
  feed.url = url;
  if(htmlMode){
    feed.id = id;
    feed.overrideLink = overrideLink;
    if(root){
      feed.root = root;
    } else {
      feed.root = null;
    }
    feed.type = "html";
  } else {
    feed.id = null;
    feed.overrideLink = null;
    feed.root = null;
    feed.type = "rss";
  }
  if(!bg.storage.any(f => f == feed)){
    notifyError("Edit error", "Failed to save edits");
  }
  bg.save();
  nameText.val("");
  urlText.val("");
  idText.val("");
  rootText.val("");
  overrideText.val("")
  createNewButton.removeClass("attention");
  createNewButton.val("Create");
  refreshCreateForm();
}

function confirmDelete(feed, event){
  var button = $(event.target)
  button.addClass("attention");
  button.val("Delete!!");
  button.unbind("click");
  button.click(_ => bg.deleteThis(feed));
};

function colourFromNumber(num){
  var lessThanOne = Math.min(num, 1);
  var oneToFive = Math.max(Math.min(num - 1, 5 - 1), 0);
  var hue = (120 * lessThanOne) + (15 * oneToFive);
  return hue;
}

function styleDiv(div, feed){
  var bgColour;
  var textColour;
  if(feed.enabled){
    var rand = randomHue(hashString(feed.name));
    var hue = Math.trunc(360 * rand);
    bgColour = `hsl(${hue}, 49%, 56%)`;
    textColour = `hsl(${hue}, 92%, 20%)`;
  } else {
    bgColour = "#909090";
    textColour = "#484848";
  }
  div.css({"background-color": bgColour, "color" : textColour, "border-radius": "0.2em", "padding": "0.2em"});
}