import { RenamedFile, SourceFile } from "./types.d.ts";

import * as path from "https://deno.land/std@0.151.0/path/mod.ts";
import { copy, ensureDirSync } from "https://deno.land/std@0.151.0/fs/mod.ts";

/**
 * Renames a list of files.
 *
 * @param {SourceFile[]} fileNames List of files to rename
 * @param {string} inputPath Path for the directory containing the source files
 * @param {string} outputPath Path for the directory for the renamed files
 *
 * @return List of renamed files
 */
async function renameFiles(fileNames: SourceFile[], inputPath: string, outputPath: string): Promise<RenamedFile[]> {
    // Create output directory
    ensureDirSync(outputPath);

    const fileOperations: Promise<RenamedFile>[] = [];

    for (const file of fileNames) {
        if (file.fileName && file.fileNameNew) {
            const fileInputPath = path.join(inputPath, file.fileName);
            const fileOutputPath = path.join(outputPath, file.fileNameNew);

            // Create each file asynchronously and wrap it in a Promise
            fileOperations.push(
                new Promise((resolve, reject) => {
                    copy(fileInputPath, fileOutputPath, { overwrite: true })
                        .then(() =>
                            resolve({
                                fileNameOld: file.fileName,
                                fileName: file.fileNameNew,
                                filePath: fileOutputPath,
                            })
                        )
                        .catch((error) => {
                            // Display the error in red text
                            console.log("\x1b[31m%s\x1b[0m", "- Error reading file: " + fileInputPath);
                            reject(error.message);
                        });
                }),
            );
        }
    }

    // Wait until all file operations are finished (sucessfully or not)
    const results = await Promise.allSettled(fileOperations);
    const fulfilledResults = results.filter((result) => result.status === "fulfilled") as PromiseFulfilledResult<RenamedFile>[];
    const renamedFiles = fulfilledResults.map((result) => result.value);

    return renamedFiles;
}

export default renameFiles;
