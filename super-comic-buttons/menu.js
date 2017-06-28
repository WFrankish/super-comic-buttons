"use strict";

var feedListDiv;

var inputText;
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
  getElements();
  xmlTypeRadio.prop("checked", true);
  xmlTypeRadio.change(toggleExtraRow);
  domTypeRadio.change(toggleExtraRow);
  toggleExtraRow();
};

function getElements(){
  feedListDiv = $("#feedListDiv");
  
  inputText = $("#inputText");
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