"use strict";

var errorNoteId = "comic-error";
var noteId = "comic-note";

function notifyError(title = "", string){
	var errorNote = browser.notifications.create(errorNoteId, {
		"type": "basic",
		"title": "Super Comic Buttons: " + title,
		"message": string,
		"iconUrl": browser.extension.getURL("icons/error-96.png")
	});
}

function notify(title = "", string){
	var note = browser.notifications.create(noteId, {
		"type": "basic",
		"title": "Super Comic Buttons: " + title,
		"message": string,
		"iconUrl": browser.extension.getURL("icons/icon-96.png")
	});
}