import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: {
    noExternal: ["@langchain/langgraph", "deepagents", "langchain"],
    resolve: {
      // Cloudflare Workers support node:async_hooks with nodejs_compat. Use
      // LangGraph's node entry for the server bundle so DeepAgents' task tool
      // can read AsyncLocalStorage-backed runtime config.
      conditions: ["module", "node", "production"],
    },
  },
});
