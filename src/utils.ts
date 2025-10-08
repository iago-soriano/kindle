import * as fs from "fs";

export interface FileMetadata {
  lastProcessedIndex: number;
  translateFromIndex: number;
}

export function getFileMetadata(filePath: string): FileMetadata {
  if (!fs.existsSync(filePath)) {
    return {
      lastProcessedIndex: -1,
      translateFromIndex: -1,
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const metadata: FileMetadata = {
    lastProcessedIndex: -1,
    translateFromIndex: -1,
  };

  // Check if first line is a header with metadata
  if (lines.length > 0 && lines[0].startsWith("# Last processed:")) {
    const indexMatch = lines[0].match(/Index: (\d+)/);
    if (indexMatch) {
      metadata.lastProcessedIndex = parseInt(indexMatch[1], 10);
    }

    const translateFromMatch = lines[0].match(/Translate from: (\d+)/);
    if (translateFromMatch) {
      metadata.translateFromIndex = parseInt(translateFromMatch[1], 10);
    }
  }

  return metadata;
}
