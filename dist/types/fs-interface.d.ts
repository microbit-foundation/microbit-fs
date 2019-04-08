export interface FsInterface {
    write(filename: string, content: string): void;
    append(filename: string, content: string): void;
    read(filename: string): string;
    readBytes(filename: string): Uint8Array;
    remove(filename: string): void;
    exists(filename: string): boolean;
    size(filename: string): number;
    ls(): string[];
}
//# sourceMappingURL=fs-interface.d.ts.map