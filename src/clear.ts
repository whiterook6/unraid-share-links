import { getDatabase } from "./database";

export const clear = () => {
  const database = getDatabase();
  database.exec("DELETE FROM shares");
};
