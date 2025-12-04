import * as fs from "fs";
import * as path from "path";
import { getFileMetadata } from "./utils.js";

// ========== CONFIGURATION ==========
const BOOK_NAME = "L'homme qui savait la langue des serpents"; // Change this to your target book
const CLIPPINGS_PATH = "/Volumes/Kindle/documents/My Clippings.txt"; // Update this path
const OUTPUT_DIR = path.join(process.cwd(), "outputs");
// ===================================

interface Highlight {
  text: string;
  location: string;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function parseClippings(content: string, targetBook: string): Highlight[] {
  const entries = content
    .split("\r\n==========\r\n")
    .filter((entry) => entry.trim());
  const highlights: Highlight[] = [];
  let highlightIndex = 0;

  for (const entry of entries) {
    const lines = entry.split("\n").filter((line) => line.trim());

    if (lines.length < 2) continue;

    // The second line contains the book name
    const bookLine = lines[0];

    // Check if this entry is from our target book
    if (!bookLine?.replace(/\r/g, "")?.includes(targetBook)) continue;

    // The highlighted text is the third line
    const text = lines[2]
      ?.replace(/,/g, "")
      ?.replace(/\./g, " ")
      ?.replace(/\:/g, " ")
      ?.replace(/»/g, " ")
      ?.replace(/\!/g, " ")
      ?.replace(/\?/g, " ")
      ?.replace(/\,/g, " -")
      ?.toLocaleLowerCase()
      ?.trim();

    // Use the highlight index (only for this book) as location
    const location = highlightIndex.toString();
    highlightIndex++;

    highlights.push({ text, location });
  }

  return highlights;
}

function getExistingHighlights(outputPath: string): string[] {
  if (!fs.existsSync(outputPath)) {
    return [];
  }

  const content = fs.readFileSync(outputPath, "utf-8");
  const lines = content.split("\n");
  const highlights: string[] = [];

  // Skip header line if present
  const startIndex = lines[0].startsWith("# Last processed:") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      highlights.push(line);
    }
  }

  return highlights;
}

export function extractFromKindle() {
  console.log(`Processing highlights for: ${BOOK_NAME}`);

  // Check if clippings file exists
  if (!fs.existsSync(CLIPPINGS_PATH)) {
    console.error(`Error: Clippings file not found at ${CLIPPINGS_PATH}`);
    console.error(
      "Please update the CLIPPINGS_PATH variable with the correct path."
    );
    process.exit(1);
  }

  // Read the clippings file
  const clippingsContent = fs.readFileSync(CLIPPINGS_PATH, "utf-8");

  // Parse highlights for the target book
  const allHighlights = parseClippings(clippingsContent, BOOK_NAME);

  if (allHighlights.length === 0) {
    console.log("No highlights found for this book.");
    return;
  }

  console.log(`Found ${allHighlights.length} total highlights for this book.`);

  // Generate output filename
  const outputFilename = sanitizeFilename(BOOK_NAME) + ".txt";
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  // Get metadata and existing highlights
  const metadata = getFileMetadata(outputPath);
  const existingHighlights = getExistingHighlights(outputPath);

  console.log(`Previously saved: ${existingHighlights.length} highlights`);
  if (metadata.translateFromIndex >= 0) {
    console.log(`Last processed index: ${metadata.translateFromIndex}`);
  }

  // Filter to get only new highlights (after the last processed index)
  const newHighlights = allHighlights.filter(
    (h) => parseInt(h.location, 10) > metadata.translateFromIndex
  );

  if (newHighlights.length === 0) {
    console.log("No new highlights to add.");
    return;
  }

  console.log(`Adding ${newHighlights.length} new highlights.`);

  // Combine existing and new highlights
  const allHighlightTexts = [
    ...existingHighlights,
    ...newHighlights.map((h) => h.text),
  ];

  // Write to file
  const outputContent = allHighlightTexts.join("\n") + "\n";
  fs.writeFileSync(outputPath, outputContent, "utf-8");

  console.log(`✓ Saved to: ${outputPath}`);
  console.log(`Total highlights in file: ${allHighlightTexts.length}`);
}
