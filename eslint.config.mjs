import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["public/**", ".cache/**", "node_modules/**", "coverage/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /* 이 프로젝트에서 실제로 사고를 냈던 규칙들은 error로 올린다.
         useEffect 의존성 누락으로 AOS가 매 렌더 재초기화되고, 매 렌더
         재생성되는 함수가 의존성 배열에 들어가 스크립트가 반복 주입됐다. */
      "react-hooks/exhaustive-deps": "error",

      /* 외부 SDK를 window에서 꺼내 쓰는 코드가 any로 새는 것을 막는다. */
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      /* props 검증은 TypeScript가 한다. prop-types는 중복이자 런타임 비용이다. */
      "react/prop-types": "off",

      /* 정적 사이트라 콘솔 로그가 사용자 브라우저에 그대로 노출된다. */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  {
    files: ["**/*.test.{ts,tsx}", "vitest.setup.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  /* 포매팅 규칙은 Prettier가 단독으로 소유한다. */
  prettier,
];
