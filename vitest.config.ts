import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Le noyau est pur : tests Node, aucun DOM nécessaire.
    environment: "node",
    include: ["core/**/*.test.ts"],
  },
});
