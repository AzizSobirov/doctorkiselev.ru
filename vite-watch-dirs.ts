import type { Plugin } from "vite";
import path from "path";
import fs from "fs";

export default function watchDirsPlugin(options: { dirs: string[] }): Plugin {
  return {
    name: "astro-watch-dirs-plugin",
    configureServer(server) {
      const baseDir = "src"; // Base directory
      const fullDirs = options.dirs.map((dir) => path.join(baseDir, dir)); // Prepend 'src/' to each directory

      const generateIndexFile = (dir: string) => {
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });

          const exports = files
            .filter((file) => file.isFile() && file.name.endsWith(".astro"))
            .map(
              (file) =>
                `export { default as ${path.basename(file.name, ".astro")} } from "./${file.name}";`
            )
            .join("\n");

          const subDirs = files
            .filter((file) => file.isDirectory())
            .map(
              (dir) =>
                `export { default as ${dir.name} } from "./${dir.name}/index.astro";`
            )
            .join("\n");

          const content = `${exports}\n${subDirs}`;

          fs.writeFileSync(path.join(dir, "index.ts"), content);
          // console.log(`Generated index.ts for ${dir}`);
        } catch (error) {
          console.error(`Error generating index.ts for ${dir}:`, error);
        }
      };

      const watchAndGenerate = (dir: string) => {
        // Use Node.js's fs.watch to watch for file changes
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (
            filename &&
            (filename.endsWith(".astro") || filename.endsWith("/index.astro"))
          ) {
            // console.log(`Detected ${eventType} in ${dir}: ${filename}`);
            generateIndexFile(dir);
          }
        });
      };

      fullDirs.forEach((dir) => {
        if (fs.existsSync(dir)) {
          generateIndexFile(dir); // Generate index.ts initially
          watchAndGenerate(dir); // Watch for changes
        } else {
          console.warn(`Directory ${dir} does not exist.`);
        }
      });
    },
  };
}
