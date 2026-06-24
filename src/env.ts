import { formatRootUrl } from "./rootUrl";

export const getPort = (): number => {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }
  return port;
};

export const getRootUrl = (): string => {
  const rootUrl =
    process.env.SHARE_FILES_ROOT_URL ?? `http://localhost:${getPort()}`;
  return formatRootUrl(rootUrl);
};

export const getShareRoot = (): string =>
  process.env.SHARE_FILES_ROOT ?? process.cwd();
