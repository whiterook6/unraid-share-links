import { randomBytes } from "node:crypto";
import { getDatabase } from "./database";
import { getRootUrl } from "./env";
import { getShareFormatter, Share } from "./share.model";

const parseExpiresAt = (expires: string): string => {
  const d = new Date(expires);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid expiration date");
  }
  if (d <= new Date()) {
    throw new Error("Expiration date must be in the future");
  }
  return d.toISOString();
};

export const ShareService = {
  list: (): Share[] => {
    const database = getDatabase();
    const shares = database
      .prepare(
        `SELECT path, hash, created_at, expires_at FROM shares ORDER BY created_at`
      )
      .all();

    if (shares.length === 0) {
      return [];
    }

    const shareFormatter = getShareFormatter(getRootUrl());
    return shares.map(shareFormatter);
  },

  add: (
    resolvedPath: string,
    options: Partial<{
      expires: string;
    }>
  ): Share => {
    const now = new Date().toISOString();

    let expiresAt: string | null = null;
    if (options.expires) {
      expiresAt = parseExpiresAt(options.expires);
    }

    const database = getDatabase();
    let hash = randomBytes(16).toString("hex");
    while (database.prepare("SELECT * FROM shares WHERE hash = ?").get(hash)) {
      hash = randomBytes(16).toString("hex");
    }

    database
      .prepare(
        "INSERT INTO shares (hash, path, created_at, expires_at) VALUES (?, ?, ?, ?)"
      )
      .run(hash, resolvedPath, now, expiresAt);

    const share = ShareService.getByPath(resolvedPath);
    if (!share) {
      throw new Error(`Failed to create share for path: ${resolvedPath}`);
    }
    return share;
  },

  updateExpires: (resolvedPath: string, expires: string): Share => {
    const expiresAt = parseExpiresAt(expires);
    const database = getDatabase();
    database
      .prepare("UPDATE shares SET expires_at = ? WHERE path = ?")
      .run(expiresAt, resolvedPath);

    const share = ShareService.getByPath(resolvedPath);
    if (!share) {
      throw new Error(`Failed to update share for path: ${resolvedPath}`);
    }
    return share;
  },

  getByHash(key: string): Share | undefined {
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE hash = ?")
      .get(key);
    if (!share) {
      return undefined;
    }
    const shareFormatter = getShareFormatter(getRootUrl());
    return shareFormatter(share);
  },

  getByPath(path: string): Share | undefined {
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE path = ?")
      .get(path);
    if (!share) {
      return undefined;
    }
    const shareFormatter = getShareFormatter(getRootUrl());
    return shareFormatter(share);
  },

  clear: () => {
    const database = getDatabase();
    database.exec("DELETE FROM shares");
  },

  remove: (pathOrHash: string): Share[] => {
    const database = getDatabase();
    database
      .prepare("DELETE FROM shares WHERE hash = ? OR path = ?")
      .run(pathOrHash, pathOrHash);
    return ShareService.list();
  },
};
