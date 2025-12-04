import * as fs from "fs";

export interface FileMetadata {
  translateFromIndex: number;
}

export function getFileMetadata(filePath: string): FileMetadata {
  if (!fs.existsSync(filePath)) {
    return {
      translateFromIndex: -1,
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const metadata: FileMetadata = {
    translateFromIndex: -1,
  };

  // Check if first line is a header with metadata
  if (lines.length > 0 && lines[0].startsWith("# Translate from: ")) {
    const translateFromMatch = lines[0].match(/Translate from: (\d+)/);
    if (translateFromMatch) {
      metadata.translateFromIndex = parseInt(translateFromMatch[1], 10) + 1;
    }
  }

  return metadata;
}
