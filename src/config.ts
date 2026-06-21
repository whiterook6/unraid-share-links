import columnify from "columnify";
import { getDatabase } from "./database";

export const config = (values: Partial<{
  rootUrl: string;
}>) => {
  const database = getDatabase();
  if (values.rootUrl !== undefined){
    database.prepare(`
      INSERT INTO config (key, value)
      VALUES (?, ?)
      ON CONFLICT(key)
      DO UPDATE SET value = excluded.value;
    `).run("rootUrl", values.rootUrl);
  }

  const allConfigs = database.prepare(`
    SELECT key, value FROM config ORDER by key ASC
  `).all();

  console.log(columnify(allConfigs));
};