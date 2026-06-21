import { getDatabase } from "./database";
import { randomBytes } from "node:crypto";
import { verifyFile } from "./file";

export const add = (
  path: string,
  options: Partial<{
    expires: string;
  }>
) => {
  verifyFile(path);
  const database = getDatabase();
  const hash = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const expiresAt = options.expires
    ? new Date(options.expires).toISOString()
    : null;
  database
    .prepare(
      "INSERT INTO shares (hash, path, created_at, expires_at) VALUES (?, ?, ?, ?)"
    )
    .run(hash, path, now, expiresAt);
};
