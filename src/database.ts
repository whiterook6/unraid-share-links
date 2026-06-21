import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const APP_NAME = "share-files";
const DB_FILENAME = "shares.db";

let database: DatabaseSync | undefined;

/**
 * Default config directory for local dev and linked CLI installs.
 *
 * macOS:  ~/Library/Application Support/share-files/
 * Linux:  ~/.config/share-files/
 *
 * In Docker, set SHARE_FILES_DB instead (e.g. /config/shares.db) and mount
 * that directory as a volume from the Unraid host appdata path.
 */
const configDir = (): string => {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, APP_NAME);
  }

  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_NAME);
  }

  return path.join(os.homedir(), ".config", APP_NAME);
};

const resolveDbPath = (): string => {
  const dbPath =
    process.env.SHARE_FILES_DB ?? path.join(configDir(), DB_FILENAME);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return dbPath;
};

const initSchema = (db: DatabaseSync): void => {
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shares (
      hash       TEXT PRIMARY KEY,
      path       TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );
  `);
};

export const getDatabase = (): DatabaseSync => {
  if (!database) {
    database = new DatabaseSync(resolveDbPath());
    initSchema(database);
  }

  return database;
};
