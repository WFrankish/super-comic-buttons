type FeedItemDto = {
    title? : string;
    feedDate : Date | null;
    date : Date;
    link : string;
}

interface IFeedItem extends FeedItemDto {
    title: string;
}