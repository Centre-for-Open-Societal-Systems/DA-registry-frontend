import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "globals.css"), "utf8");
const tokens = [...css.matchAll(/^\s*--color-([a-z0-9-]+):\s*([^;]+);/gm)].map(([, name, value]) => ({ name, value: value.trim() }));

describe("theme color tokens", () => {
  it("defines tokens", () => {
    expect(tokens.length).toBeGreaterThan(20);
  });

  // A token defined as var(--itself) is invalid CSS, so every utility using it renders transparent.
  it("never define a token in terms of itself", () => {
    for (const { name, value } of tokens) expect(value, `--color-${name}`).not.toContain(`var(--color-${name})`);
  });

  it("are defined once each", () => {
    const names = tokens.map((t) => t.name);
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });
});
