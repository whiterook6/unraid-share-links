import columnify from "columnify";
import { getDatabase } from "./database";
import { getConfig } from "./config";
import { getShareFormatter } from "./share.model";

export const list = () => {
  const database = getDatabase();
  const shares = database
    .prepare(
      `SELECT
        path,
        hash,
        created_at,
        COALESCE(expires_at, 'Never') AS expires_at FROM shares ORDER BY created_at`
    )
    .all();

  if (shares.length === 0) {
    return;
  }

  const rootUrl = getConfig("rootUrl") || "http://localhost:3000";
  const shareFormatter = getShareFormatter(rootUrl);
  console.log(columnify(shares.map(shareFormatter)));
};
