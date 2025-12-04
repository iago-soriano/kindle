# Kindle Translation Tools

This project extracts Kindle highlights and translates them using OpenAI.

## Files

- `extract-from-kindle.ts` - Extracts highlights from Kindle's "My Clippings.txt" file
- `translate.ts` - Translates entries from a text file using OpenAI API
- `fire.ts` - FIRE (Financial Independence Retire Early) savings calculator
- `index.ts` - Main entry point that orchestrates the workflow
- `utils.ts` - Helper functions for parsing file metadata

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

## Workflow

The process consists of three steps:

### Step 1: Extract from Kindle

1. Connect your Kindle device to your computer

2. Open `src/extract-from-kindle.ts` and configure:
   ```typescript
   const BOOK_NAME = "L'homme qui savait la langue des serpents"; // Your book title
   const CLIPPINGS_PATH = "/Volumes/Kindle/documents/My Clippings.txt"; // Path to Kindle
   ```

3. In `src/index.ts`, uncomment the extraction line:
   ```typescript
   extractFromKindle();
   ```

4. Run the script:
   ```bash
   pnpm start
   ```

5. The script will:
   - Read highlights from your Kindle's "My Clippings.txt" file
   - Filter highlights for the specified book
   - Save new highlights to `outputs/<book_name>.txt`
   - Track progress using metadata in the first line

**Output Format:**
```
# Last processed: Index: 24 | Translate from: 10
bûcher
lièvres
belettes
```

The metadata tracks:
- `Index`: Last highlight index extracted from Kindle. DO NOT CHANGE THIS, even if you've added and removed lines
- `Translate from`: Index to start translation from (for the next step). The line to translate from. YOU CAN CHANGE THIS

### Step 2: Review and Edit Sentences

Manually review the generated `.txt` file in the `outputs/` directory:

1. Open `outputs/<book_name>.txt`
2. Review each line (highlight) for quality
3. Edit, remove, or fix any entries as needed

This ensures you only translate clean, correct entries.

### Step 3: Translate

1. Comment out the extraction line in `src/index.ts`:
   ```typescript
   // extractFromKindle();
   ```

2. Open `src/translate.ts` and configure:
   ```typescript
   const INPUT_FILE = "outputs/l_homme_qui_savait_la_langue_des_serpents.txt";
   const SOURCE_LANGUAGE = "Francês"; // Language to translate from
   const TARGET_LANGUAGE = "Português Brasileiro"; // Language to translate to
   ```

3. Run the script:
   ```bash
   pnpm start
   ```

4. The script will:
   - Read entries from the `.txt` file
   - Use the metadata to determine which entries need translation
   - Translate only new entries (from the "Translate from" index)
   - Append translations to `outputs/<book_name>.csv`

**Output Format (CSV):**
```
bûcher,fogueira
lièvres,lebres
belettes,doninhas
```

## How It Works

### Incremental Processing

The tool tracks progress to handle incremental updates:

1. **After extraction**: The metadata stores the last processed highlight index
2. **For translation**: The "Translate from" index marks where translation should start
3. **On subsequent runs**: Only new highlights are extracted and translated

### Translation Details

- Uses OpenAI's GPT-4o-mini for cost-effective translations
- Processes in batches of 10 to avoid rate limits
- 100ms delay between requests
   - Appends to existing CSV (never overwrites)

## FIRE Calculator

Calculate how much you need to save monthly to achieve financial independence:

1. Edit the constants in `src/fire.ts`:
   ```typescript
   const CURRENT_NET_WORTH = 100000; // Your current net worth
   const INTEREST_RATE = 0.07; // Expected annual return (7%)
   const INFLATION_RATE = 0.03; // Expected inflation (3%)
   const DESIRED_MONTHLY_INCOME = 5000; // Monthly retirement income
   const WITHDRAWAL_RATE = 0.04; // Safe withdrawal rate (4% rule)
   const BIRTH_YEAR = 1980; // Your birth year
   const RETIREMENT_AGE = 65; // Desired retirement age
   ```

2. Run the calculator:
   ```bash
   pnpm run fire
   ```

The script calculates your monthly savings requirement using the 4% rule and accounts for inflation-adjusted returns.

## Example Workflow

```bash
# 1. Extract highlights from Kindle
# (Uncomment extractFromKindle() in index.ts)
pnpm start

# 2. Review and edit outputs/<book_name>.txt manually

# 3. Translate entries
# (Comment out extractFromKindle() in index.ts)
pnpm start
```

## Notes

- The extraction script sanitizes highlights by removing punctuation (commas, periods, colons, etc.)
- CSV output has no header row - just two columns: original and translation
- All files are saved in the `outputs/` directory

