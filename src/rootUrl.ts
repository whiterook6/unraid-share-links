export const formatRootUrl = (rootUrl: string): string => {
  let trimmedRootUrl = rootUrl.trim();
  if (trimmedRootUrl.length === 0) {
    throw new Error("Invalid root URL");
  }
  if (!trimmedRootUrl.startsWith("http")) {
    throw new Error("Invalid root URL");
  }
  if (trimmedRootUrl.endsWith("/")) {
    trimmedRootUrl = trimmedRootUrl.slice(0, -1);
  }

  return trimmedRootUrl;
};
