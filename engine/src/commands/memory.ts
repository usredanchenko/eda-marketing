import type { Command } from "commander";
import { parseBrandId } from "../brands/load";
import { info, ok } from "../lib/out";
import { checkSimilar, rebuildMemory } from "../memory/index";

export const registerMemory = (program: Command) => {
  const mem = program.command("memory").description("Content memory: what was already made, duplicates");

  mem.command("rebuild")
    .description("Rebuild memory/index.jsonl from the seed and all packages")
    .action(async () => ok(`records: ${(await rebuildMemory()).length}`));

  mem.command("check <text>")
    .description("Check a topic/hook for repeats (lexical similarity, no paid embeddings)")
    .option("--brand <id>", "brand id (default: all brands)")
    .action(async (text: string, o: { brand?: string }) => {
      await rebuildMemory();
      const hits = await checkSimilar(text, o.brand ? parseBrandId(o.brand) : undefined);
      if (!hits.length) return ok("new topic — nothing similar");
      hits.slice(0, 8).forEach((h) => info(`${h.verdict === "duplicate" ? "DUPLICATE" : "similar"} ${h.score}  ${h.brand} ${h.id}: ${h.topic} [${h.status}]`));
    });
};
