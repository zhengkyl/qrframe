import fs from "node:fs/promises";
import path from "node:path";

async function stringifyPresets(src, dst) {
  try {
    const dir = await fs.opendir(src);
    for await (const dirent of dir) {
      const srcPath = path.join(src, dirent.name);
      const dstPath = path.join(dst, dirent.name);

      if (dirent.isDirectory()) {
        try {
          await fs.access(dstPath, fs.constants.F_OK);
        } catch (e) {
          await fs.mkdir(dstPath);
        }
        stringifyPresets(srcPath, dstPath);
        continue;
      }

      let fileString = await fs.readFile(srcPath, "utf-8");

      // Quick & dirty "type stripping" only works b/c files are formatted
      // This preserves spacing + comments which other methods don't

      // Remove imports (identical for all files)
      fileString = fileString.slice(111);

      // Strip types from simple function args
      fileString = fileString.replace(
        /\((?:\s*.+: .+,\s)*\s*.+: [^)]+\s*\)/g,
        (match) =>
          "(" +
          match
            .slice(1, match.length - 1)
            .split(",")
            .map((typedArg) =>
              typedArg.slice(0, typedArg.indexOf(":")).trimStart()
            )
            .join(", ") +
          ")"
      );

      fileString = fileString.replace("} satisfies RawParamsSchema;", "};");
      fileString = fileString.replaceAll("`", "\\`");
      fileString = fileString.replaceAll("${", "\\${");

      const name = dirent.name.slice(0, dirent.name.length - 3);

      await fs.writeFile(
        dstPath,
        `export const ${name} = \`${fileString}\`\n`,
        {
          flag: "w+",
        }
      );
    }
  } catch (err) {
    console.error(err);
  }
}

stringifyPresets("./presets", "./src/lib/presets");
