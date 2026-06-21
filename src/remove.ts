import { getDatabase } from "./database";
import { list } from "./list";

export const remove = (pathOrHash: string) => {
  const database = getDatabase();
  database
    .prepare("DELETE FROM shares WHERE hash = ? OR path = ?")
    .run(pathOrHash, pathOrHash);

  return list();
};
