import { promises as fs } from "fs";
import path from "path";
import swc from "@swc/core";
import prettier from "prettier";

async function convertTsToJs(inputDir, outputDir) {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(inputDir);
    const tsFiles = files.filter((file) => file.endsWith(".ts"));

    for (const file of tsFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      const tsCode = await fs.readFile(inputPath, "utf-8");

      const { code } = await swc.transform(tsCode, {
        filename: inputPath,
        sourceMaps: false,
        jsc: {
          parser: {
            syntax: "typescript",
          },
          target: "ES2020",
        },
      });

      const formattedCode = await prettier.format(code, {
        parser: "babel",
      });

      const originalLines = tsCode.split("\n").slice(3);
      const strippedLines = formattedCode.split("\n");
      let preservedCode = "";
      let strippedIndex = 0;

      for (const originalLine of originalLines) {
        if (originalLine.trim() === "") {
          // Preserve empty lines
          preservedCode += "\n";
        } else {
          if (strippedIndex < strippedLines.length) {
            preservedCode += strippedLines[strippedIndex] + "\n";
            strippedIndex++;
          }
        }
      }

      preservedCode = preservedCode.replaceAll("`", "\\`");
      preservedCode = preservedCode.replaceAll("${", "\\${");
      
      await fs.writeFile(
        outputPath,
        `export const ${file.slice(0, -3)} = \`${preservedCode.slice(0, -1)}\`\n`,
        "utf-8"
      );
      console.log(`Converted and formatted: ${inputPath} -> ${outputPath}`);
    }

    console.log("Conversion and formatting completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

const inputDir = "./presets";
const outputDir = "./src/lib/presets";
convertTsToJs(inputDir, outputDir);
