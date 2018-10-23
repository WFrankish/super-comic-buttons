interface IFeedHandler {
    newRssFeed(name: string, url: string, overrideLink?: string): FeedDto;
    newHtmlFeed(name: string, url: string, id: string, root?: string, overrideLink?: string): FeedDto;
    open(feed: FeedDto, force?: boolean): void;
    shouldRead(feed: FeedDto): boolean;
    consume(feed: FeedDto, items: ReadResult[]): void;
    averagePerDay(feed: FeedDto): number;
    averagePerWeek(feed: FeedDto): number;
    latestLink(feed: FeedDto): string | null;
    averageGap(feed: FeedDto): number;
}

type FeedDto = {
    name: string;
    url: string;
    enabled: boolean;
    type: "html" | "rss";
    overrideLink?: string;
    id?: string;
    root?: string;

    recent: FeedItemDto[];
    unreadLink?: string;
    unread: number;

    count: number;
    // a 7 by 24 map of (roughly) the probability of an update
    // use UTC times
    map: number[][];
    firstRecord: string;
    lastRecord?: string;
}

type V1FeedDto = {
    name: string;
    url: string;
    enabled?: boolean;
    type: "html" | "rss";
    overrideLink?: string;
    id?: string;
    root?: string;
    recent: V1FeedItemDto[];
    unreadLink?: string;
    unread: number;
    count: number;
    dayMap: number[];
    hourMap: number[];
    firstRecord?: string;
    lastRecord?: string;
}

type FeedItemDto = {
    title: string;
    date: string;
    link: string;
}

type V1FeedItemDto = {
    title: string;
    feedDate: string | null;
    date: string;
    link: string;
}