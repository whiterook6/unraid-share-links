import columnify from "columnify";
import { ShareService } from "./share.service";

export const list = () => {
  const shares = ShareService.list();
  console.log(columnify(shares));
};
