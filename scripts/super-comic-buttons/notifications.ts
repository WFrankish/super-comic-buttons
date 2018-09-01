class Notifications implements INotifications {
    readonly notificationId = "soundstone-x-notification";
    readonly notificationAlarm = "notification";

    private anyErrors: boolean = false;
    private messages: string[] = [];

    constructor() {
        browser.alarms.onAlarm.addListener(x => this.releaseMessages(x));
    }

    message(message: string): void {
        console.log(message);
        browser.alarms.create(this.notificationAlarm,
            {
                delayInMinutes: 0.05
            }
        );
        this.messages.push(message);
    }

    error(error: string): void {
        this.anyErrors = true;
        this.message("Error: " + error);
    }

    private releaseMessages(info: browser.alarms.Alarm): void {
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

        browser.notifications.create(
            this.notificationId,
            {
                title: title,
                message: summedMessages,
                type: "basic",
                iconUrl: icon
            }
        );
    }
}