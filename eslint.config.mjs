import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    // This overrides specific ESLint rules
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable no-explicit-any rule
      "@typescript-eslint/no-unused-vars": "off", // Disable no-unused-vars rule
      "@typescript-eslint/no-empty-function": "off", // Disable no-empty-function rule
      "@typescript-eslint/no-require-imports": "off", // Disable no-require-imports rule
      "prefer-const": "off", // Disable prefer-const rule
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react/display-name": "off",
    },
  },
];

export default eslintConfig;
