import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.GRAPHQL_API_URL ?? "http://localhost:3001/api/graphql",
  documents: "src/gql/**/*.gql",
  generates: {
    // 1) Base types + operations + DocumentNodes
    "src/gql/generated/": {
      preset: "client",
      plugins: [],
      config: {
        // optional: tune as you like
        useTypeImports: true,
        skipTypename: false,
      },
    },

    // 2) React Apollo hooks for client components
    // "src/gql/generated-hooks.tsx": {
    //   plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
    //   config: {
    //     withHooks: true,
    //     withHOC: false,
    //     withComponent: false,
    //   },
    // },

    //   // 3) Generic SDK for fetch-based RSC/server actions
    //   "src/gql/sdk.ts": {
    //     plugins: ["@graphql-codegen/typescript-generic-sdk"],
    //   },
  },
};

export default config;
