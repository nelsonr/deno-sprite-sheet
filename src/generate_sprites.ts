import { Country, SpritesmithCoordinates, SpritesmithResult } from "./types.d.ts";

import * as path from "https://deno.land/std@0.151.0/path/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.151.0/fs/mod.ts";
import outdent from "https://esm.sh/outdent@0.8.0";
import { createRequire } from "https://deno.land/std@0.151.0/node/module.ts";

const require = createRequire(import.meta.url);
const Spritesmith = require("spritesmith");

/**
 * Generates the CSS sprite sheet assets from a directory of images.
 *
 * @param {array} countries List of objects with countries name and code
 * @param {string} inputPath Path for the directory containing the source images
 * @param {string} outputPath Path for the directory for the generated assets
 * @param {string} fileName Name for the generated asset files (without file extension)
 */
function generateSpriteSheet(countries: Country[], inputPath: string, outputPath: string, fileName: string) {
    console.log("Generating sprite sheet image...");

    let imageSize = 0;
    const imageOutputPath = path.join(outputPath, `${fileName}.png`);
    const stylesheetPath = path.join(outputPath, `${fileName}.css`);
    const sprites = countries.map((country) => path.join(inputPath, country.code + ".png"));

    // Create output directory
    ensureDirSync(outputPath);

    Spritesmith.run({ src: sprites, padding: 10 }, (err: Error | null, result: SpritesmithResult) => {
        if (err) {
            console.log(err);
            return;
        }
        
        // Save sprite sheet image file
        Deno.writeFile(imageOutputPath, result.image).catch((err) => err && console.log(err));

        console.log("Generating CSS file...");

        // Try to infer the image size from the image width
        // This only works if every image has the same dimensions
        if (!imageSize) {
            const coordinatesObj: SpritesmithCoordinates = Object.entries(result.coordinates)[0][1];
            imageSize = coordinatesObj.width;
        }

        const styleSheet = createStyleSheet(result.coordinates, imageSize, `${fileName}.png`);
        Deno.writeTextFile(stylesheetPath, styleSheet).catch((err) => err && console.log(err));
    });
}

/**
 * Generates a style sheet with the coordinates of each image of a sprite sheet.
 *
 * @param {object} coords An object with coordinates of each image
 * @param {number} spriteSize The original size of the images used in the sprite sheet
 * @param {string} backgroundImage The name of the sprite sheet file
 * @returns a CSS style sheet
 */
function createStyleSheet(coords: SpritesmithCoordinates[], spriteSize: number, backgroundImage: string) {
    let css = outdent`
        .flag {
            --size: 32;
            --original-size: ${spriteSize};
            position: relative;
            width: calc(var(--size) * 1px);
            height: calc(var(--size) * 1px);
        }
        
        .flag:after {
            content: '';
            display: block;
            width: calc(var(--original-size) * 1px);
            height: calc(var(--original-size) * 1px);
            position: absolute;
            top: calc(calc((var(--original-size) - var(--size)) / -2) * 1px);
            left: calc(calc((var(--original-size) - var(--size)) / -2) * 1px);
            transform: scale(calc(var(--size) / var(--original-size)));
            background: url('${backgroundImage}') no-repeat;
        }


    `;

    for (const key in coords) {
        const countryCode = path.basename(key, ".png");
        const { x, y } = coords[key];

        css += outdent`
            .flag--${countryCode}:after {
                background-position: -${x}px -${y}px;
            }


        `;
    }

    return css;
}

export default generateSpriteSheet;
