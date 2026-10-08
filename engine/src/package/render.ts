import { writeText } from "../lib/fsx";
import { assetsMd, platformMd, publishMd } from "./md-publish";
import { hooksMd, ideasMd, scriptMd, shotlistMd } from "./md-creative";
import { readDataIfAny, type Pkg } from "./load";

/** Regenerates every Markdown view from data/*.json. Returns written repo-relative paths. */
export const renderAllMd = async (pkg: Pkg): Promise<string[]> => {
  const written: string[] = [];
  const put = async (rel: string, text: string) => {
    await writeText(pkg.abs(rel), text);
    written.push(pkg.rel(rel));
  };
  const ideas = await readDataIfAny(pkg, "ideas");
  if (ideas) await put("IDEAS.md", ideasMd(ideas));
  const hooks = await readDataIfAny(pkg, "hooks");
  if (hooks) await put("HOOKS.md", hooksMd(hooks));
  const script = await readDataIfAny(pkg, "script");
  if (script) await put("SCRIPT.md", scriptMd(script));
  const shotlist = await readDataIfAny(pkg, "shotlist");
  if (shotlist) await put("SHOTLIST.md", shotlistMd(shotlist));
  const assets = await readDataIfAny(pkg, "assets");
  if (assets) await put("ASSETS.md", assetsMd(assets));
  const publish = await readDataIfAny(pkg, "publish");
  if (publish) {
    await put("PUBLISH.md", publishMd(publish, pkg.id));
    for (const c of publish.platforms) await put(`captions/${c.platform}.md`, platformMd(c));
  }
  return written;
};
