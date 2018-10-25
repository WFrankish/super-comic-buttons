interface IPopup {
    refresh($scope? : ng.IScope): void;
    toggleActivate(): void;
    openMenu(): void;
    openOptions(): void;
}