import { program } from "commander";
import { list } from "./list";
import { add } from "./add";
import { remove } from "./remove";
import { config } from "./config";

program
  .command("list")
  .action(() => list());

program
  .command("add")
  .argument("<path>", "The path to the file to share")
  .option("--expires <date>", "The date and time to expire the share")
  .action((path, options) => add(path, options.expires));

program
  .command("remove")
  .argument("<pathOrHash>", "The path or hash of the share to remove")
  .action((pathOrHash) => remove(pathOrHash));

program
  .command("config")
  .option("--root-url <url>", "The root URL to prepend to the share links")
  .action((options) => config(options));

program.parse(process.argv);