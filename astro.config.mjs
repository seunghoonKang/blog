// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://seunghoonkang.dev",
  // 노트 목록이 메인(/)으로 이동
  redirects: {
    "/notes": "/",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // Astro 7 기본값('jsx')은 줄바꿈으로 생긴 inline 요소 사이 공백을 제거하므로 기존 동작 유지
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  markdown: {
    // Astro 7 기본 처리기(Sätteri) 대신 remark 플러그인을 쓰기 위해 unified 사용
    processor: unified({
      remarkPlugins: [
        [remarkToc, { heading: "목차", maxDepth: 3, tight: true }],
      ],
    }),
    shikiConfig: { theme: "github-dark" },
  },
});
