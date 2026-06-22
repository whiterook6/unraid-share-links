import { SQLOutputValue } from "node:sqlite";
import { formatRootUrl } from "./rootUrl";

export type Share = {
  path: string;
  key: string;
  filesize: number;
  createdAt: string;
  expiresAt: string | null;
  url: string;
};

export const getShareFormatter = (rootUrl: string) => {
  const formattedRootUrl = formatRootUrl(rootUrl);
  return (share: Record<string, SQLOutputValue>): Share => ({
    key: share.key as string,
    filesize: share.filesize as number,
    path: share.path as string,
    createdAt: share.created_at as string,
    expiresAt: (share.expires_at as string) || null,
    url: `${formattedRootUrl}/${share.key}`,
  });
};
