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
  xmlTypeRadio.click();
  xmlTypeRadio.change(toggleExtraRow);
  domTypeRadio.change(toggleExtraRow);
  toggleExtraRow();
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

function toggleExtraRow(){
  var htmlMode = domTypeRadio.is(":checked");
  if(htmlMode){
    specialRow.show();
  } else {
    specialRow.hide();
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
}