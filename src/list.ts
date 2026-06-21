import columnify from "columnify";
import { getDatabase } from "./database";

export const list = () => {
  const database = getDatabase();
  const shares = database
    .prepare(
      `SELECT
        path,
        hash,
        COALESCE(expires_at, 'Never') AS expires FROM shares ORDER BY created_at`
    )
    .all();

  if (shares.length === 0) {
    return;
  }

  console.log(columnify(shares));
};