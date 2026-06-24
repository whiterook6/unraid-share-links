import { getDatabase } from "./database";
import { randomBytes } from "node:crypto";
import { verifySharePath } from "./file";
import columnify from "columnify";
import { getRootUrl } from "./env";
import { getShareFormatter } from "./share.model";
import { list } from "./list";

export const add = (
  filePath: string,
  options: Partial<{
    expires: string;
  }>
) => {
  const absolutePath = verifySharePath(filePath);

  // verify the date
  if (options.expires) {
    try {
      new Date(options.expires);
    } catch (error) {
      console.error("Invalid expiration date");
      return;
    }
  }

  const database = getDatabase();
  const shareFormatter = getShareFormatter(getRootUrl());

  // check if the path is already in the database
  const existingShare = database
    .prepare("SELECT * FROM shares WHERE path = ?")
    .get(absolutePath);
  if (existingShare) {
    console.log(columnify(shareFormatter(existingShare)));
    return;
  }

  const hash = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const expiresAt = options.expires
    ? new Date(options.expires).toISOString()
    : null;
  database
    .prepare(
      "INSERT INTO shares (hash, path, created_at, expires_at) VALUES (?, ?, ?, ?)"
    )
    .run(hash, absolutePath, now, expiresAt);

  return list();
};
