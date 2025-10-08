import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { getFileMetadata, type FileMetadata } from "./utils.js";

// ========== CONFIGURATION ==========
const INPUT_FILE = "outputs/l_homme_qui_savait_la_langue_des_serpents.txt"; // Change this to your target file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set your API key in environment
const SOURCE_LANGUAGE = "Francês"; // Language to translate from
const TARGET_LANGUAGE = "Português Brasileiro"; // Language to translate to
// ===================================

interface TranslationEntry {
  original: string;
  translation: string;
}

function getExistingTranslations(csvPath: string): TranslationEntry[] {
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  return lines.map((line) => {
    const lastCommaIndex = line.lastIndexOf(",");
    return {
      original: line.substring(0, lastCommaIndex),
      translation: line.substring(lastCommaIndex + 1),
    };
  });
}

export async function translateEntries(): Promise<void> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please set it before running the script."
    );
  }

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const inputPath = path.join(process.cwd(), INPUT_FILE);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Get metadata from the input file
  const metadata = getFileMetadata(inputPath);

  // Read the input file
  const content = fs.readFileSync(inputPath, "utf-8");
  const lines = content.split("\n");

  // Determine which entries need translation
  // translateFromIndex is the last index that was processed in the previous run
  // We need to translate entries after that index
  const startIndex = metadata.translateFromIndex;
  const entriesToTranslate = lines
    .slice(startIndex)
    .filter((line: string) => line.length > 0);

  if (entriesToTranslate.length === 0) {
    console.log("No entries to translate.");
    return;
  }

  // Generate CSV filename from the input txt filename
  const baseName = path.basename(INPUT_FILE, ".txt");
  const csvFilename = `${baseName}.csv`;
  const csvPath = path.join(process.cwd(), "outputs", csvFilename);

  // Get existing translations
  const existingTranslations = getExistingTranslations(csvPath);
  console.log(
    `Found ${existingTranslations.length} existing translations in CSV.`
  );

  if (entriesToTranslate.length === 0) {
    console.log("No new entries to translate.");
    return;
  }

  console.log(`Found ${lines.length} lines in the file.`);
  console.log(
    `Starting translation from index ${startIndex} (${entriesToTranslate.length} new entries).`
  );
  console.log(`Translating from ${SOURCE_LANGUAGE} to ${TARGET_LANGUAGE}...`);

  const newTranslations: TranslationEntry[] = [];

  // Process entries in batches to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < entriesToTranslate.length; i += BATCH_SIZE) {
    const batch = entriesToTranslate.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(entriesToTranslate.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNumber}/${totalBatches}...`);

    // Translate each entry in the batch
    for (const entry of batch) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é um tradutor profissional. Traduza o seguinte texto em ${SOURCE_LANGUAGE} para ${TARGET_LANGUAGE}. Forneça apenas a tradução, sem explicações ou contexto adicional.`,
            },
            {
              role: "user",
              content: entry,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        });

        const translation =
          response.choices[0]?.message?.content?.trim() ||
          "[Translation failed]";

        newTranslations.push({
          original: entry,
          translation: translation,
        });

        console.log(`  ✓ Translated: "${entry}" → "${translation}"`);
      } catch (error) {
        console.error(`  ✗ Error translating "${entry}":`, error);
        newTranslations.push({
          original: entry,
          translation: "[Translation error]",
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`\nCompleted ${newTranslations.length} new translations.`);

  if (newTranslations.length === 0) {
    console.log("No new translations to write.");
    return;
  }

  // Combine existing and new translations
  const allTranslations = [...existingTranslations, ...newTranslations];

  // Create CSV content
  const csvLines = allTranslations.map(
    (entry: { original: string; translation: string }) => {
      // Remove all quotes from entries
      const original = entry.original.replace(/"/g, "");
      const translation = entry.translation.replace(/"/g, "");
      return `${original},${translation}`;
    }
  );

  const csvContent = csvLines.join("\n");

  // Write to CSV file
  fs.writeFileSync(csvPath, csvContent, "utf-8");

  console.log(`\n✓ Translations written to: ${csvPath}`);
  console.log(`New translations: ${newTranslations.length}`);
  console.log(`Total entries in CSV: ${allTranslations.length}`);
}

export { INPUT_FILE };
