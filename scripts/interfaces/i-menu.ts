interface IMenu {
    create($scope: IMenuScope): void;

    refreshFeedList($scope: IMenuScope): void;
}

interface IMenuScope {
    name: string;
    url: string;
    type: "html" | "rss";

    id: string;
    root: string;
    override: string;

    feeds: IFeedScope[];

    $evalAsync(func: () => void): void;
}

interface IFeedScope {
    name: string;
    style: string;
    unread: number;
    unreadMessage: string;
    lastReadMessage: string;
    lastUpdatedMessage: string;
    enabled: boolean;
    days: IDayScope[];

    open(): void;
    read(): void;
    editMode(event: JQuery.Event<HTMLElement>) : void;
    toggleActiveness(): void;
    delete(event: JQuery.Event<HTMLElement>): void;
}

interface IDayScope {
    text: string;
    title: string;
    style: string;
}