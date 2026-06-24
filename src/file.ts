import fs from "node:fs";
import path from "node:path";
import { getShareRoot } from "./env";

const isInsideRoot = (root: string, candidate: string): boolean => {
  const relative = path.relative(root, candidate);
  return (
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
};

export const verifySharePath = (filePath: string): string => {
  const root = path.resolve(getShareRoot());
  const resolved = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(root, filePath);

  if (!isInsideRoot(root, resolved)) {
    throw new Error(`Path is outside share root (${root}): ${resolved}`);
  }

  verifyFile(resolved);

  const realRoot = fs.realpathSync(root);
  const realResolved = fs.realpathSync(resolved);
  if (!isInsideRoot(realRoot, realResolved)) {
    throw new Error(`Path resolves outside share root (${root}): ${resolved}`);
  }

  return realResolved;
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
