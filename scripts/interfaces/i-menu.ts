interface IMenu {
    create($scope: IMenuScope): void;

    refreshFeedList($scope: IMenuScope): void;
}

interface IMenuScope extends ng.IScope {
    name: string;
    url: string;
    type: "html" | "rss";

    id: string;
    root: string;
    override: string;

    feeds: IFeedScope[];
}

interface IFeedScope {
    entity: FeedDto

    unread: number;
    unreadMessage: string;
    lastReadMessage: string;
    lastUpdatedMessage: string;
    
    weekdays: IWeekDayScope[];
    hours: IHourScope[];
    perWeek: string;
    perDay: string;
    betweenUpdates: string;

    editMode: boolean;

    style(): string;
    open(): void;
    read(): void;
    edit(event: JQuery.Event<HTMLElement>) : void;
    toggleActiveness(): void;
    delete(event: JQuery.Event<HTMLElement>): void;
}

interface IWeekDayScope {
    text: string;
    title: string;
    style: string;
}

interface IHourScope {
    days: IDayScope[];
}

interface IDayScope {
    title: string;
    style: string;
}