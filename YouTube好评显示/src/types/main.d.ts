interface UserSettings {
    userAccount: string;
    userPoints: number;
    autoCopy: boolean;
    autoSlide: boolean;

    autoSolveNormal: boolean;
    solveIntervalMin: number;
    solveIntervalMax: number;

    autoSolveTest: boolean;
    solveIntervalMinTest: number;
    solveIntervalMaxTest: number;

    autoRefresh: boolean;
    loop: boolean;
    randomInterval: boolean;
    switchInterval: number;
    switchLevel: number;
    range: boolean;
    chapterAmount: number;
    rangeStart: number;
    rangeEnd: number;

    [propName: string]: any;
}
