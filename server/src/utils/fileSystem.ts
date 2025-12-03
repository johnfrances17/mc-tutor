import fs from 'fs';
import path from 'path';

/**
 * Initialize data directories for file-based storage
 * Maintains compatibility with PHP file structure
 */
export const initializeDataDirectories = (): void => {
  const baseDir = process.env.UPLOAD_DIR || './data';
  
  const directories = [
    path.join(baseDir, 'chats'),
    path.join(baseDir, 'notifications'),
    path.join(baseDir, 'sessions'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Create metadata file for chats if it doesn't exist
  const chatsMetadata = path.join(baseDir, 'chats', 'metadata.json');
  if (!fs.existsSync(chatsMetadata)) {
    fs.writeFileSync(
      chatsMetadata,
      JSON.stringify(
        {
          conversations: [],
          last_updated: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log('📝 Created chats metadata file');
  }
};

/**
 * Ensure a directory exists, create if not
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Read JSON file safely
 */
export const readJsonFile = <T>(filePath: string, defaultValue: T): T => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return defaultValue;
  }
};

/**
 * Write JSON file safely
 */
export const writeJsonFile = (filePath: string, data: unknown): boolean => {
  try {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    return false;
  }
};
