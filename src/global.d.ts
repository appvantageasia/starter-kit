declare namespace NodeJS {
    interface Process {
        readonly browser?: boolean;
        readonly isDev?: boolean;
        readonly isCLI?: boolean;
    }
}
