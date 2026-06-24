import { program } from "commander";
import { add } from "./add";
import { clear } from "./clear";
import { list } from "./list";
import { remove } from "./remove";

program
  .command("add")
  .argument("<path>", "The path to the file to share")
  .option("--expires <date>", "The date and time to expire the share")
  .action((path, options: { expires?: string }) => add(path, options));

program.command("clear").action(() => clear());

program.command("list").action(() => list());

program
  .command("remove")
  .argument("<pathOrHash>", "The path or hash of the share to remove")
  .action((pathOrHash: string) => remove(pathOrHash));

program.parse(process.argv);
