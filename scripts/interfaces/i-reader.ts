interface IReader {
    read(feed: Feed) : Promise<ReadResult[]>;
}

type ReadResult = {
    title: string,
    date: Date | null,
    link: string
}