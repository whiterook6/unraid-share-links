import columnify from "columnify";
import { getDatabase } from "./database";
import { getRootUrl } from "./env";
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

  const shareFormatter = getShareFormatter(getRootUrl());
  console.log(columnify(shares.map(shareFormatter)));
};
