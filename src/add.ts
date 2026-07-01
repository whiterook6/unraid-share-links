import columnify from "columnify";
import { verifySharePath } from "./file";
import { Share } from "./share.model";
import { ShareService } from "./share.service";

const isExpiryError = (error: unknown): error is Error =>
  error instanceof Error &&
  (error.message === "Invalid expiration date" ||
    error.message === "Expiration date must be in the future");

export const add = (
  filePath: string,
  options: Partial<{
    expires: string;
  }>
) => {
  const absolutePath = verifySharePath(filePath);

  try {
    const existingShare = ShareService.getByPath(absolutePath);
    let share: Share;

    if (existingShare) {
      share = options.expires
        ? ShareService.updateExpires(absolutePath, options.expires)
        : existingShare;
    } else {
      share = ShareService.add(absolutePath, options);
    }

    console.log(columnify([share]));
  } catch (error) {
    if (isExpiryError(error)) {
      console.error(error.message);
      return;
    }
    throw error;
  }
};
