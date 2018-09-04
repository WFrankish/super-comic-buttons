interface IReader {
    read(feed: FeedDto) : Promise<ReadResult[]>;
}

type ReadResult = {
    title: string,
    date: Date | null,
    link: string
}