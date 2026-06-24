import columnify from "columnify";
import { ShareService } from "./share.service";

export const remove = (pathOrHash: string) => {
  const results = ShareService.remove(pathOrHash);
  console.log(columnify(results));
};
