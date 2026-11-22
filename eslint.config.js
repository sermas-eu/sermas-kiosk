import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".svelte-kit/", "build/", "node_modules/"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, PKG_VERSION: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      // to settle with the runes migration of the components
      "svelte/require-each-key": "warn",
      "svelte/infinite-reactive-loop": "warn",
      "svelte/no-navigation-without-resolve": "warn",
      // every {@html} source is sanitized (renderMarkdown, sanitizeHtml)
      "svelte/no-at-html-tags": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
);
