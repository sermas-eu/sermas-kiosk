// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { toolkitAliases } from "../../toolkit.config.js";

// Vite resolves the @sermas sources through toolkit.config.js; the type checker
// through tsconfig.json `paths`. Both must name the same files.
describe("source aliases", () => {
  const file = path.resolve("tsconfig.json");
  const { config } = ts.parseConfigFileTextToJson(
    file,
    fs.readFileSync(file, "utf8"),
  );
  const paths: Record<string, string[]> = config.compilerOptions.paths;
  const declared = Object.fromEntries(
    Object.entries(paths)
      .filter(([name]) => name.startsWith("@sermas/"))
      .map(([name, [target]]) => [name, path.resolve(target)]),
  );

  it("tsconfig paths match the Vite aliases", () => {
    if (
      process.env.TOOLKIT_DIR ||
      process.env.API_CLIENT_DIR ||
      process.env.NODE_SDK_DIR
    ) {
      // the tsconfig names the default sibling checkouts only
      return;
    }
    expect(declared).toEqual(toolkitAliases);
  });
});
