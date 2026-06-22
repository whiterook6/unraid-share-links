export const formatRootUrl = (rootUrl: string): string => {
  if (rootUrl.endsWith("/")) {
    return formatRootUrl(rootUrl.slice(0, -1));
  }

  if (rootUrl.length === 0) {
    throw new Error("Invalid root URL");
  }

  return rootUrl;
};
