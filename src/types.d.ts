export interface SourceFile {
    fileName: string;
    fileNameNew: string;
}

export interface RenamedFile {
    fileNameOld: string;
    fileName: string;
    filePath: string;
}

export interface Country {
    name: string;
    code: string;
}

interface SpritesmithCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SpritesmithResult {
    image: Uint8Array;
    coordinates: SpritesmithCoordinates[];
    properties: {
        width: number;
        height: number;
    };
}
