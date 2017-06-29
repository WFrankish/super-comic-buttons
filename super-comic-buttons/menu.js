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