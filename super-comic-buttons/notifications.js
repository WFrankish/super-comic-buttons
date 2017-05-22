"use strict";

var errorNoteId = "comic-error";

function notifyError(title = "", string){
	var errorNote = browser.notifications.create(errorNoteId, {
		"type": "basic",
		"title": "Super Comic Buttons: " + title,
		"message": string,
		"iconUrl": browser.extension.getURL("icons/error.png")
	});
}