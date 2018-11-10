"use strict";
class Notifications {
    constructor() {
        this.notificationId = "soundstone-x-notification";
        this.notificationAlarm = "notification";
        this.anyErrors = false;
        this.messages = [];
        browser.alarms.onAlarm.addListener(x => this.releaseMessages(x));
    }
    message(message) {
        console.log(message);
        browser.alarms.create(this.notificationAlarm, {
            delayInMinutes: 0.05
        });
        this.messages.push(message);
    }
    error(error) {
        this.anyErrors = true;
        this.message("Error: " + error);
    }
    releaseMessages(info) {
        if (info.name !== this.notificationAlarm) {
            return;
        }
        let title = this.anyErrors ? "Super Comic Buttons - Error" : "Super Comic Buttons";
        let icon = "icons/" + (this.anyErrors ? "icons/error" : "icons/icon") + "-96.png";
        this.anyErrors = false;
        let summedMessages = "";
        while (this.messages.length > 0) {
            let message = this.messages.shift();
            summedMessages += message + "\n";
        }
        browser.notifications.create(this.notificationId, {
            title: title,
            message: summedMessages,
            type: "basic",
            iconUrl: icon
        });
    }
}
