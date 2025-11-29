import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Downgrade no-explicit-any to warning instead of error
      '@typescript-eslint/no-explicit-any': 'warn',
      // Downgrade unused vars to warning
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      // Downgrade unescaped entities to warning
      'react/no-unescaped-entities': 'warn',
      // Downgrade img element warning
      '@next/next/no-img-element': 'warn',
      // Downgrade exhaustive deps to warning
      'react-hooks/exhaustive-deps': 'warn',
      // Keep these as errors - they're important
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/immutability': 'error',
    },
  },
]);

export default eslintConfig;
