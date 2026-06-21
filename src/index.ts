import { program } from "commander";
import { list } from "./list";

program
  .command("list")
  .action(() => list());

program.parse(process.argv);