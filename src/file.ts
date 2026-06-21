import fs from "node:fs";

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
