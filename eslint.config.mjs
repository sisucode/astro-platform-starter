import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginReact from "eslint-plugin-react";
import globals from "globals";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ...eslintPluginReact.configs.flat.recommended,
    settings: {
        react: {
            version: "detect"
        }
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "warn"
    }
  },
  {
    files: ["**/*.astro"],
    rules: {
        "react/no-unknown-property": "off",
        "react/jsx-key": "off",
        "react/jsx-no-undef": "off",
        "react/self-closing-comp": "off"
    }
  }
];
