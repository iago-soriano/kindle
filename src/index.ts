import * as fs from "fs";
import * as path from "path";
import { extractFromKindle } from "./extract-from-kindle.js";
import { translateEntries, INPUT_FILE } from "./translate.js";

async function main() {
  // Uncomment the line below if you want to extract from Kindle first
  extractFromKindle();

  // Run the translation
  // await translateEntries();
}

// Run the script
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
