import fs from "node:fs";

export const verifyFile = (absolutePath: string) => {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }
  if (!fs.statSync(absolutePath).isFile()) {
    throw new Error(`Path is not a file: ${absolutePath}`);
  }
};
