"use strict";

var bg;

$(function(){
  bg = browser.extension.getBackgroundPage();
  $("#menuButton").click(openMenu);
  $("#optionsButton").click(openOptions);
  $("#toggleButton").click(toggleActivate);
  refresh();
});

function refresh(){
  if(bg.active){
    $("#toggleButton").val("Deactivate");
    browser.browserAction.setIcon({ 
      path : {
        "16": "button/enabled-16.png",
        "32": "button/enabled-32.png",
        "64": "button/enabled-64.png",
        "256": "button/enabled-256.png"
      }
    });
  } else {
    $("#toggleButton").val("Activate!");
    browser.browserAction.setIcon({ 
      path : {
        "16": "button/icon-16.png",
        "32": "button/icon-32.png",
        "64": "button/icon-64.png",
        "256": "button/icon-256.png"
      }
    });
  }
}

function toggleActivate(){
  bg.active = !bg.active;
  refresh();
}

function openMenu(){
  if(browser.sidebarAction && false){
    // If sidebars are supported (firefox, but not chrome)
    browser.sidebarAction.getPanel({}).then(url => {
      console.log(url);
      // can't (yet?) open sidebar programatically, so open it in a new tab
      browser.tabs.create({url : url});
    });
  } else {
    browser.tabs.create({url : "menu.html"});
  }
}

function openOptions(){
  browser.runtime.openOptionsPage();
}