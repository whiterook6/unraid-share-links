import { SQLOutputValue } from "node:sqlite";
import { formatRootUrl } from "./rootUrl";

export type Share = {
  hash: string;
  path: string;
  created_at: string;
  expires_at: string;
  expired: boolean;
  url: string;
};

export const getShareFormatter = (rootUrl: string) => {
  const formattedRootUrl = formatRootUrl(rootUrl);
  return (share: Record<string, SQLOutputValue>): Share => {
    const expiresAtRaw = share.expires_at as string | null;
    const expiresAt = expiresAtRaw ?? "Never";
    const expired =
      expiresAtRaw !== null && new Date(expiresAtRaw) <= new Date();

    return {
      hash: share.hash as string,
      path: share.path as string,
      created_at: share.created_at as string,
      expires_at: expiresAt,
      expired,
      url: `${formattedRootUrl}/${share.hash}`,
    };
  };
};
