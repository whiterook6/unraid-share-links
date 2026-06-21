import { SQLOutputValue } from "node:sqlite";
import { formatRootUrl } from "./rootUrl";

export type Share = {
  hash: string;
  path: string;
  created_at: string;
  expires_at: string | null;
  url: string;
};

export const getShareFormatter = (rootUrl: string) => {
  const formattedRootUrl = formatRootUrl(rootUrl);
  return (share: Record<string, SQLOutputValue>): Share => ({
    hash: share.hash as string,
    path: share.path as string,
    created_at: share.created_at as string,
    expires_at: (share.expires_at as string) || null,
    url: `${formattedRootUrl}/${share.hash}`,
  });
};
