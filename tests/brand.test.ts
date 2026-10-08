import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderFactsMd } from "../engine/src/brands/facts-md";
import { listBrands, loadBrand, parseBrandId } from "../engine/src/brands/load";
import { scaffoldBrand } from "../engine/src/brands/scaffold";
import { ValidationError } from "../engine/src/lib/fsx";
import { tempRoot } from "./helpers";

describe("brand loading", () => {
  it("discovers brands by folder and ignores the _template scaffold", () => {
    expect(listBrands()).toContain("acme-focus");
    expect(listBrands()).not.toContain("_template");
  });

  it("loads the example brand and resolves spellings to its id", async () => {
    const b = await loadBrand("Acme Focus");
    expect(b.id).toBe("acme-focus");
    expect(b.config.language).toBe("en");
    expect(b.facts.facts.every((f) => f.id.startsWith("acme-focus-"))).toBe(true);
  });

  it("keeps unconfirmed and forbidden facts marked as such", async () => {
    const b = await loadBrand("acme-focus");
    const status = (id: string) => b.facts.facts.find((f) => f.id === id)?.status;
    expect(status("acme-focus-user-count")).toBe("NEEDS_CONFIRMATION");
    expect(status("acme-focus-productivity-claims")).toBe("FORBIDDEN");
    expect(renderFactsMd(b)).toContain("NEEDS_CONFIRMATION");
  });

  it("rejects an unknown brand", () => {
    expect(() => parseBrandId("not-a-brand")).toThrow(ValidationError);
  });

  it("scaffolds a new valid brand from _template and refuses to overwrite it", async () => {
    const root = await tempRoot();
    await scaffoldBrand({ id: "northwind", name: "Northwind", language: "ru", root });
    const b = await loadBrand("northwind", root);
    expect(b.config.language).toBe("ru");
    expect(b.facts.facts.every((f) => f.status !== "PUBLIC_CONFIRMED")).toBe(true);
    await expect(scaffoldBrand({ id: "northwind", name: "Northwind", language: "ru", root })).rejects.toThrow(ValidationError);
  });

  it("fails on a missing brand file", async () => {
    const root = await tempRoot();
    await rm(path.join(root, "brands", "acme-focus", "facts.yaml"));
    await expect(loadBrand("acme-focus", root)).rejects.toThrow(/facts\.yaml[\s\S]*file not found/);
  });

  it("fails on an unknown key in brand.json (strict config)", async () => {
    const root = await tempRoot();
    const file = path.join(root, "brands", "acme-focus", "brand.json");
    const json = JSON.parse(await readFile(file, "utf8"));
    await writeFile(file, JSON.stringify({ ...json, surprise: true }));
    await expect(loadBrand("acme-focus", root)).rejects.toThrow(ValidationError);
  });

  it("fails when another brand's facts leak in", async () => {
    const root = await tempRoot();
    await scaffoldBrand({ id: "northwind", name: "Northwind", language: "en", root });
    const file = path.join(root, "brands", "acme-focus", "facts.yaml");
    const yaml = await readFile(file, "utf8");
    await writeFile(file, yaml.replace("id: acme-focus-offline", "id: northwind-offline"));
    await expect(loadBrand("acme-focus", root)).rejects.toThrow(/another brand/);
  });
});
