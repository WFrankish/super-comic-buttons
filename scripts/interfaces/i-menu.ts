interface IMenu {
    create($scope: IMenuScope): void;
}

interface IMenuScope {
    name: string;
    url: string;
    type: "html" | "rss";

    id: string;
    root: string;
    override: string;
}