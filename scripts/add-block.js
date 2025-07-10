import fs from "fs";
import path from "path";

// Get the type (blocks/components) and name from the command-line arguments
const type = process.argv[2]; // "blocks" or "components"
const name = process.argv[3]; // e.g., "hero" or "header"

const fileName = name.toLowerCase();
const fileNameCapital = fileName.charAt(0).toUpperCase() + fileName.slice(1);

if (!type || !name) {
  console.error("Error: Please provide a type (blocks/components) and a name.");
  process.exit(1);
}

// Define the base directory based on the type
const baseDir = path.join(process.cwd(), "src", type); // Use the type directly
const filePath = path.join(baseDir, `${fileNameCapital}.astro`);

// Check if the file already exists
if (fs.existsSync(filePath)) {
  console.error(`Error: File ${filePath} already exists.`);
  process.exit(1);
}

// Ensure the directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Content templates for the files
const templates = {
  astro: (fileName, fileNameCapital) => `---
import { Section,H2,H3,P, Image, Icon, Button } from "ui";
---

<!-- ${fileNameCapital} -->
<Section name="${fileName}"> .${fileName} </Section>

<style lang="scss" is:global>
  @use "scss/helpers" as *;

  .${fileName} {
    position: relative;
  }
</style>
`,
};

// Generate the file content
const fileContent = templates.astro(fileName, fileNameCapital);

// Write the file
fs.writeFileSync(filePath, fileContent);

console.log(`Successfully created ${filePath}`);
