# Kindle Translation Tools

This directory contains tools for extracting Kindle highlights and translating them using OpenAI.

## Files

- `extract-from-kindle.ts` - Extracts highlights from Kindle's "My Clippings.txt" file
- `translate.ts` - Translates entries from a text file using OpenAI API
- `index.ts` - Main entry point that runs the translation and saves to CSV

## Setup

1. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

## Usage

### Translating a Text File

1. Open `translate.ts` and configure the following variables at the top:
   ```typescript
   const INPUT_FILE = "l_homme_qui_savait_la_langue_des_serpents.txt"; // Your input file
   const SOURCE_LANGUAGE = "French"; // Language to translate from
   const TARGET_LANGUAGE = "English"; // Language to translate to
   ```

2. Run the script:
   ```bash
   pnpm start
   ```

3. The script will:
   - Read all entries from your text file (skipping the first line which is metadata)
   - Translate each entry using OpenAI's GPT-4o-mini
   - Save the results to a CSV file with the same name as your input file

### Example

If your input file is `l_homme_qui_savait_la_langue_des_serpents.txt`, the output will be `l_homme_qui_savait_la_langue_des_serpents.csv` with two columns:
- `Original` - The original text
- `Translation` - The translated text

## Text File Format

The input text file should have:
- First line: Metadata (will be skipped) - e.g., `# Last processed: Index: 24`
- Following lines: One entry per line to translate

Example:
```
# Last processed: Index: 24
bûcher
lièvres
belettes
```

## Notes

- The script processes translations in batches of 10 to avoid rate limits
- There's a 100ms delay between each translation request
- The script uses GPT-4o-mini for cost-effective translations
- CSV fields are properly escaped for commas and quotes

