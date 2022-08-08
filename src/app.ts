import { Country, SourceFile } from "./types.d.ts";

import config from "../config.json" assert { type: "json" };
import countries from "../assets/flags.json" assert { type: "json" };
import renameFiles from "./rename_files.ts";
import { createSpriteSheet } from "./spritesheet.ts";

async function main() {
    const countriesWithCode: Country[] = countries.filter((country: Country) => country.code !== "");
    const flagImages: SourceFile[] = countriesWithCode.map((country: Country) => ({
        fileName: country.name + ".png",
        fileNameNew: country.code + ".png",
    }));

    console.log("Renaming image files to country codes...");

    const renamedFlagImages = await renameFiles(
        flagImages,
        config.imagesInputPath,
        config.imagesOutputPath,
    );

    console.log("Renamed flag images count: ", renamedFlagImages.length);

    const spriteSheetImages = renamedFlagImages.map((image) => image.filePath);

    console.log("Generating sprite sheet assets...");

    createSpriteSheet(
        spriteSheetImages,
        config.buildPath,
        config.fileName,
    );
}

main();
