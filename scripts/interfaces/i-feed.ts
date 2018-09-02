type FeedDto = {
    name : string;
    url: string;
    enabled? : boolean;
    type: string;
    overrideLink : string;
    id : string;
    root : string;

    recent? : FeedItemDto[];
    unreadLink : string;
    unread? : number;

    count? : number;
    dayMap? : number[];
    hourMap? : number[];
    firstRecord? : Date;
    lastRecord : Date;
}

interface IFeed extends FeedDto {
    readonly shouldRead: boolean;

    enabled : boolean;
    recent : FeedItemDto[];
    unread : number;
    count : number;
    dayMap : number[];
    hourMap : number[];
    firstRecord : Date;

    open(force? : boolean) : void;
    consume(feedItems : IFeedItem[]) : void;
}
