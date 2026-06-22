import { getDatabase } from "./database";
import { list } from "./list";

export const remove = (pathOrKey: string) => {
  const database = getDatabase();
  database
    .prepare("DELETE FROM shares WHERE key = ? OR path = ?")
    .run(pathOrKey, pathOrKey);

  return list();
};
