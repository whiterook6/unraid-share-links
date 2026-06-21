import { getDatabase } from "./database";

export const remove = (pathOrHash: string) => {
  const database = getDatabase();
  database
    .prepare("DELETE FROM shares WHERE hash = ? OR path = ?")
    .run(pathOrHash, pathOrHash);
};
