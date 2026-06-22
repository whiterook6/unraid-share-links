import { getDatabase } from "./database";
import { randomBytes } from "node:crypto";
import { verifyFile } from "./file";
import path from "node:path";
import columnify from "columnify";
import { getConfig } from "./config";
import { getShareFormatter } from "./share.model";
import { list } from "./list";

export const add = (
  filePath: string,
  options: Partial<{
    expires: string;
  }>
) => {
  const absolutePath = path.resolve(filePath);
  const filesize = verifyFile(absolutePath);

  // verify the date
  if (options.expires) {
    const expires = new Date(options.expires);
    if (Number.isNaN(expires.getTime())) {
      console.error("Invalid expiration date");
      return;
    }
  }

  const database = getDatabase();
  const rootUrl = getConfig("rootUrl") || "http://localhost:3000";
  const shareFormatter = getShareFormatter(rootUrl);

  // check if the path is already in the database
  const existingShare = database
    .prepare("SELECT * FROM shares WHERE path = ?")
    .get(absolutePath);
  if (existingShare) {
    console.log(columnify(shareFormatter(existingShare)));
    return;
  }

  const key = randomBytes(16).toString("hex");
  const createdAt = new Date().toISOString();
  const expiresAt = options.expires
    ? new Date(options.expires).toISOString()
    : null;
  database
    .prepare(`INSERT INTO shares (
  path,
  key,
  filesize,
  created_at,
  expires_at
) VALUES (?, ?, ?, ?, ?)`
    ).run(
      absolutePath,
      key,
      filesize,
      createdAt,
      expiresAt
    );

  return list();
};
