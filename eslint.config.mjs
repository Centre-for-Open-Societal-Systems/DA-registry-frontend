import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const allow = (from, to) => ({ from: { element: { type: from } }, allow: { to: { element: { types: { anyOf: to } } } } });

// Folder rules (see docs/ARCHITECTURE.md). Imports flow one way:
//   app → features → components / store / contexts → lib
// and code outside a feature reaches it only through its index.ts.
const layers = {
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { alwaysTryTypes: true } },
    "boundaries/elements": [
      { type: "app", pattern: "src/app/**", partialMatch: false },
      { type: "feature", pattern: "src/features/*", capture: ["featureName"] },
      { type: "components", pattern: "src/components/**", partialMatch: false },
      { type: "store", pattern: "src/store/**", partialMatch: false },
      { type: "contexts", pattern: "src/contexts/**", partialMatch: false },
      { type: "lib", pattern: "src/lib/**", partialMatch: false },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      2,
      {
        default: "disallow",
        policies: [
          allow("app", ["app", "feature", "components", "store", "contexts", "lib"]),
          allow("feature", ["feature", "components", "store", "contexts", "lib"]),
          allow("components", ["components", "store", "contexts", "lib"]),
          allow("store", ["store", "lib"]),
          allow("contexts", ["contexts", "lib"]),
          allow("lib", ["lib"]),
          // A feature's files are private: from outside, import "@/features/<name>" (its index.ts) only…
          {
            to: { element: { type: "feature" } },
            disallow: { to: { element: { fileInternalPath: "!index.ts" } } },
            message: 'Import "@/features/{{to.element.captured.featureName}}" instead of a file inside it.',
          },
          // …while files inside the same feature import each other directly (relative paths).
          { dependency: { relationship: { to: "internal" } }, allow: { to: { element: { type: "feature" } } } },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["src/**/*.{ts,tsx}"], ...layers },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
