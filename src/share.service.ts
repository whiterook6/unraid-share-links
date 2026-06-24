import { randomBytes } from "crypto";
import { getDatabase } from "./database";
import { getRootUrl } from "./env";
import { getShareFormatter, Share } from "./share.model";

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
  ): Share[] => {
    const now = new Date().toISOString();

    // verify the date
    let expiresAt = null;
    if (options.expires) {
      const d = new Date(options.expires);
      if (Number.isNaN(d.getTime())) {
        throw new Error("Invalid expiration date");
      }
      expiresAt = d.toISOString();
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

    return ShareService.list();
  },

  getByHash(key: string): Share | undefined {
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE hash = ?")
      .get(key);
    if (!share) {
      return undefined;
    }
    return getShareFormatter(getRootUrl())(share);
  },

  getByPath(path: string): Share | undefined {
    const database = getDatabase();
    const share = database
      .prepare("SELECT * FROM shares WHERE path = ?")
      .get(path);
    if (!share) {
      return undefined;
    }
    return getShareFormatter(getRootUrl())(share);
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
