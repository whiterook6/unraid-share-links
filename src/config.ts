import columnify from "columnify";
import { getDatabase } from "./database";
import { formatRootUrl } from "./rootUrl";

export const config = (
  values: Partial<{
    rootUrl: string;
  }>
) => {
  const database = getDatabase();
  if (values.rootUrl !== undefined) {
    const formattedRootUrl = formatRootUrl(values.rootUrl);
    database
      .prepare(
        `
INSERT INTO config (key, value)
VALUES (?, ?)
ON CONFLICT(key)
DO UPDATE SET value = excluded.value`
      )
      .run("rootUrl", formattedRootUrl);
  }

  const allConfigs = database
    .prepare(
      `
SELECT key, value FROM config ORDER by key ASC`
    )
    .all();

  console.log(columnify(allConfigs));
};

export const getConfig = (key: string): string | undefined => {
  const database = getDatabase();
  const row = database
    .prepare("SELECT value FROM config WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
};
