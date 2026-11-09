// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://seunghoonkang.dev",
  // 노트 목록이 메인(/)으로 이동
  redirects: {
    "/notes": "/",
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    plugins: [tailwindcss()],
  },
 integrations: [mdx(), sitemap()],
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
