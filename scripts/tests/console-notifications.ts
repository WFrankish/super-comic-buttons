class ConsoleNotifications implements INotifications {
    message(message: string): void {
        console.log(message);
    }

    error(error: string): void {
        console.log("error:" + error);
    }
}