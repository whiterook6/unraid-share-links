import fs from "node:fs";
import path from "node:path";
import { getShareRoot } from "./env";

export const verifySharePath = (filePath: string): string => {
  const root = path.resolve(getShareRoot());
  const resolved = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(root, filePath);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path is outside share root (${root}): ${resolved}`);
  }

  verifyFile(resolved);
  return resolved;
};

export const verifyFile = (absolutePath: string) => {
  if (!fs.statSync(absolutePath).isFile()) {
    // check if file is a file
    throw new Error(`Path is not a file: ${absolutePath}`);
  }

  try {
    fs.accessSync(absolutePath, fs.constants.R_OK); // check if file is readable
  } catch (error) {
    throw new Error(`File is not readable: ${absolutePath}`);
  }
};
