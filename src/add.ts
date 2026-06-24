import columnify from "columnify";
import { verifySharePath } from "./file";
import { ShareService } from "./share.service";

export const add = (
  filePath: string,
  options: Partial<{
    expires: string;
  }>
) => {
  const absolutePath = verifySharePath(filePath);

  const existingShare = ShareService.getByPath(absolutePath);
  if (existingShare) {
    console.log(columnify([existingShare]));
    return;
  }

  try {
    const results = ShareService.add(absolutePath, options);
    console.log(columnify(results));
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid expiration date") {
      console.error(error.message);
      return;
    }
    throw error;
  }
};
