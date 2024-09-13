import { promises as fs } from "fs";
import path from "path";

const dev = process.argv[2] === "dev";
const url = dev ? "http://localhost:3000" : "https://qrframe.kylezhe.ng";

async function convertTsToJs(inputDir, outputDir) {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(inputDir);
    const jsFiles = files.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.slice(0, -3) + ".ts");

      let code = await fs.readFile(inputPath, "utf-8");

      code = code.replace("REPLACE_URL", url);
      code = code.replaceAll("`", "\\`");
      code = code.replaceAll("${", "\\${");

      await fs.writeFile(
        outputPath,
        `export const ${file.slice(0, -3)} = \`${code.slice(0, -1)}\n\`\n`,
        "utf-8"
      );
      if (!dev) console.log(`Converted and formatted: ${inputPath} -> ${outputPath}`);
    }

    if (!dev) console.log("Conversion and formatting completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

const inputDir = "./presets";
const outputDir = "./src/lib/presets";
convertTsToJs(inputDir, outputDir);
