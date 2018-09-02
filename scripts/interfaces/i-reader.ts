interface IReader {
    read(feed: Feed) : Promise<any>;
}