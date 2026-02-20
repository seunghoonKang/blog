// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://seunghoonkang.dev",
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    plugins: [tailwindcss()],
  },
 integrations: [ mdx()],
  markdown: {
     remarkPlugins: [
      [remarkToc, { 
        heading: '목차',
        maxDepth: 3,
        tight: true
      }]
    ],
    shikiConfig: { theme: "github-dark" },
  },
});
