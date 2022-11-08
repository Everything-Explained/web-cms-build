interface ObjWithID {
    id: string | number;
    [key: string]: any;
}
export declare const pathBasename: (p: string, ext?: string | undefined) => string;
export declare const pathResolve: (...pathSegments: string[]) => string;
export declare const pathDirname: (p: string) => string;
export declare function tryCatchAsync<T>(p: Promise<T>): Promise<T | Error>;
export declare function tryCreateDir<T extends unknown>(path: string): (data: T) => T;
export declare function slugify(str: string): string;
export declare function truncateStr(to: number): (str: string) => string;
export declare function toShortHash(data: any): string;
export declare function saveAsJSON(path: string, fileName: string): <T>(data: T) => Promise<T>;
export declare function hasSameID(o1: ObjWithID): (o2: ObjWithID) => boolean;
export declare function setIfInDev<T>(data: T): T | null;
export declare function isENOENT(err: Error): boolean;
export declare function isError<T>(obj: T | Error): obj is Error;
export declare function delayExec(timeInMs: number): (cb: () => void) => Promise<unknown>;
export declare function mkDirs(dirs: string[]): void;
export declare function isDev(): boolean;
export {};
