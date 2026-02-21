import { Client } from "@notionhq/client";
import fs from "fs/promises";
import path from "path";
import katex from "katex";
import { codeToHtml } from "shiki";
import sharp from "sharp";

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
  notionVersion: "2025-09-03",
});
const databaseId = import.meta.env.NOTION_DATABASE_ID;

// 기존 schema 형태의 타입 정의
export interface NoteData {
  id: string;
  title: string;
  pubDate: Date;
  description: string;
  author: string;
  image?: {
    url: string;
    alt: string;
  };
  tags: string[];
  category: string;
  slug: string;
  excerpt?: string; // 짧은 설명 (Notion의 "Slug" 필드)
}

// Data Source ID 캐시 (빌드/개발 중 중복 API 호출 방지)
let dataSourceIdCache: string | null = null;

// Database ID에서 Data Source ID를 가져오는 함수
async function getDataSourceId(databaseId: string): Promise<string> {
  if (dataSourceIdCache) return dataSourceIdCache;

  try {
    const database = (await notion.databases.retrieve({
      database_id: databaseId,
    })) as any;

    if (database.data_sources && database.data_sources.length > 0) {
      const id = database.data_sources[0].id as string;
      dataSourceIdCache = id;
      return id;
    }

    throw new Error("No data sources found in the database");
  } catch (error: any) {
    if (error.code === "object_not_found") {
      throw new Error(
        `Database not found. Make sure:\n` +
          `1. The database is shared with your integration (Add connections)\n` +
          `2. The database ID is correct: ${databaseId}`
      );
    }
    throw error;
  }
}

// Notion 속성에서 값을 추출하는 헬퍼 함수
function getPropertyValue(property: any, type: string): any {
  if (!property) return null;

  switch (type) {
    case "title":
      return property.title?.[0]?.plain_text || "";
    case "rich_text":
      return property.rich_text?.[0]?.plain_text || "";
    case "date":
      return property.date?.start ? new Date(property.date.start) : null;
    case "checkbox":
      return property.checkbox || false;
    case "url":
      return property.url || "";
    case "file":
      const files = property.files || [];
      if (files.length > 0) {
        const firstFile = files[0];
        return firstFile.file?.url || firstFile.external?.url || "";
      }
      return "";
    case "multi_select":
      return property.multi_select?.map((item: any) => item.name) || [];
    case "select":
      return property.select?.name || "";
    default:
      return null;
  }
}

// Notion 페이지 데이터를 기존 schema 형태로 변환
async function convertNotionToNoteData(page: any): Promise<NoteData> {
  const props = page.properties;
  const slug =
    getPropertyValue(props["url-name"], "rich_text") ||
    page.id.replace(/-/g, "");

  // 대표 이미지 가져오기
  const imageUrl =
    getPropertyValue(props.Image, "file") ||
    getPropertyValue(props.Image, "url") ||
    getPropertyValue(props["대표 이미지"], "file") ||
    getPropertyValue(props["대표 이미지"], "url");
  let imageLocalPath: string | undefined = undefined;

  if (imageUrl) {
    imageLocalPath = await downloadImage(imageUrl, slug, 0);
  }

  return {
    id: page.id,
    title: getPropertyValue(props.Title || props.Name, "title") || "제목 없음",
    pubDate: getPropertyValue(props.Date, "date") || new Date(),
    description: getPropertyValue(props.Description, "rich_text") || "",
    author: getPropertyValue(props.Author, "rich_text") || "",
    image: imageLocalPath
      ? {
          url: imageLocalPath,
          alt:
            getPropertyValue(props["Image Alt"], "rich_text") ||
            getPropertyValue(props["이미지 설명"], "rich_text") ||
            "",
        }
      : undefined,
    tags: getPropertyValue(props.Tags, "multi_select") || [],
    category: getPropertyValue(props.Category, "select") || "",
    slug,
    excerpt: getPropertyValue(props.Slug, "rich_text") || undefined,
  };
}

// 데이터베이스에서 포스트 목록을 가져오는 함수
export async function getPosts(): Promise<NoteData[]> {
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in environment variables"
    );
  }

  const dataSourceId = await getDataSourceId(databaseId);

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  const notes = await Promise.all(
    response.results.map(page => convertNotionToNoteData(page))
  );

  return notes;
}

// HTML 특수 문자를 이스케이프하는 함수
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// display 모드에서 \\ 또는 \newline을 올바르게 처리하기 위한 전처리
// LaTeX 표준: display 모드에서 \\는 동작하지 않음 → gathered 환경으로 감싸기
function preprocessDisplayEquation(expression: string): string {
  const trimmed = expression.trim();
  const hasLineBreak = /\\\\|\\newline/.test(trimmed);
  const hasEnv = /\\begin\s*\{/.test(trimmed); // 이미 aligned, gathered 등 사용 중
  if (hasLineBreak && !hasEnv) {
    return `\\begin{gathered}${trimmed}\\end{gathered}`;
  }
  return trimmed;
}

// LaTeX 수식 렌더링 (displayMode: true = 블록, false = 인라인)
function renderEquation(expression: string, displayMode: boolean): string {
  if (!expression?.trim()) return "";
  const processed =
    displayMode ? preprocessDisplayEquation(expression) : expression.trim();
  try {
    return katex.renderToString(processed, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return escapeHtml(expression);
  }
}

// 🔧 개선: 인라인 코드 스타일 적용을 위한 CSS 클래스 추가
function richTextToHtml(richText: any[]): string {
  if (!richText || richText.length === 0) return "";

  return richText
    .map((text: any) => {
      // 인라인 수식
      if (text.type === "equation" && text.equation?.expression) {
        return renderEquation(text.equation.expression, false);
      }

      let content = text.plain_text || "";

      // HTML 특수문자 이스케이프
      content = escapeHtml(content);

      // 🔧 수정: 인라인 코드 처리 개선
      if (text.annotations?.code) {
        // 디버깅: 원본 텍스트 확인 (개발 중에만 사용)
        // console.log("Original code text:", JSON.stringify(text.plain_text));

        // 노션에서 직접 입력한 백틱 제거 (양쪽 모두)
        // 예: `사람` -> 사람, ``코드`` -> 코드
        content = content.replace(/^`+/g, "").replace(/`+$/g, "");

        // CSS 가상 요소 텍스트 제거 (::before, ::after가 텍스트로 나타나는 경우)
        content = content
          .replace(/\s*::before\s*/gi, "")
          .replace(/\s*::after\s*/gi, "");

        // 색상 정보를 data 속성으로 전달 (CSS에서 처리)
        const colorAttr =
          text.annotations?.color && text.annotations.color !== "default"
            ? ` data-color="${escapeHtml(text.annotations.color)}"`
            : "";

        content = `<code${colorAttr}>${content}</code>`;
      } else {
        // 일반 텍스트의 공백 보존
        if (content.includes("  ")) {
          content = content.replace(/ {2,}/g, (match: string) =>
            "&nbsp;".repeat(match.length)
          );
        }

        // 스타일 적용
        if (text.annotations?.bold) content = `<strong>${content}</strong>`;
        if (text.annotations?.italic) content = `<em>${content}</em>`;
        if (text.annotations?.strikethrough) content = `<del>${content}</del>`;
        if (text.annotations?.underline) content = `<u>${content}</u>`;

        // 색상 정보를 data 속성으로 전달 (CSS에서 처리)
        if (text.annotations?.color && text.annotations.color !== "default") {
          content = `<span data-color="${escapeHtml(text.annotations.color)}">${content}</span>`;
        }
      }

      if (text.href) {
        content = `<a href="${escapeHtml(text.href)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
      }

      return content;
    })
    .join("");
}

// 🔧 개선: 이미지 다운로드 에러 핸들링 강화
async function downloadImage(
  imageUrl: string,
  noteSlug: string,
  imageIndex: number
): Promise<string> {
  try {
    const imageDir = path.join(
      process.cwd(),
      "public",
      "notes-images",
      noteSlug
    );

    await fs.mkdir(imageDir, { recursive: true });

    // 이미 저장된 이미지가 있으면 스킵 (재빌드 시 속도 개선)
    const existingExtensions = ["webp", "gif", "svg", "png", "jpg"];
    for (const ext of existingExtensions) {
      const existingPath = path.join(imageDir, `image-${imageIndex}.${ext}`);
      try {
        await fs.access(existingPath);
        return `/notes-images/${noteSlug}/image-${imageIndex}.${ext}`;
      } catch {
        /* 파일 없음, 계속 진행 */
      }
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 파일 확장자 추출
    const contentType = response.headers.get("content-type") || "";
    let extension = "jpg";

    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("svg")) extension = "svg";
    else {
      const urlExtension = imageUrl.split(".").pop()?.split("?")[0];
      if (
        urlExtension &&
        ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
          urlExtension.toLowerCase()
        )
      ) {
        extension = urlExtension.toLowerCase();
      }
    }

    // SVG는 최적화하지 않고 그대로 저장
    if (extension === "svg") {
      const filename = `image-${imageIndex}.${extension}`;
      const filePath = path.join(imageDir, filename);
      await fs.writeFile(filePath, buffer);
      return `/notes-images/${noteSlug}/${filename}`;
    }

    // GIF/WebP는 애니메이션 유지를 위해 animated 옵션 사용
    const isAnimatedFormat = extension === "gif" || extension === "webp";
    const sharpOptions = isAnimatedFormat
      ? { animated: true, pages: -1 }
      : undefined;

    // 이미지 최적화
    try {
      const sharpImage = sharp(buffer, sharpOptions);
      const metadata = await sharpImage.metadata();

      const maxWidth = 1920;
      const shouldResize = metadata.width && metadata.width > maxWidth;

      let processedImage = sharpImage;
      if (shouldResize) {
        // 애니메이션 이미지는 pageHeight 기반 리사이즈 필요
        const pages = metadata.pages ?? 1;
        const pageHeight = metadata.pageHeight ?? (metadata.height ?? 0) / pages;
        const resizeHeight =
          pages > 1 ? Math.round(pageHeight * pages * (maxWidth / metadata.width!)) : undefined;

        processedImage = sharpImage.resize(maxWidth, resizeHeight ?? null, {
          withoutEnlargement: true,
          fit: "inside",
        });
      }

      const webpBuffer = await processedImage
        .webp({ quality: 85, effort: 6 })
        .toBuffer();

      // WebP 파일만 저장
      const webpFilename = `image-${imageIndex}.webp`;
      const webpFilePath = path.join(imageDir, webpFilename);
      await fs.writeFile(webpFilePath, webpBuffer);

      return `/notes-images/${noteSlug}/${webpFilename}`;
    } catch (sharpError) {
      console.warn("Image optimization failed, saving original:", sharpError);
      const filename = `image-${imageIndex}.${extension}`;
      const filePath = path.join(imageDir, filename);
      await fs.writeFile(filePath, buffer);
      return `/notes-images/${noteSlug}/${filename}`;
    }
  } catch (error) {
    console.error("Error downloading image:", error);
    return imageUrl;
  }
}

// 테이블 행 블록 가져오기
async function fetchTableRows(tableBlockId: string): Promise<any[]> {
  const rows: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: tableBlockId,
      ...(cursor && { start_cursor: cursor }),
    });
    rows.push(...response.results);
    hasMore = response.has_more;
    cursor = response.next_cursor || undefined;
  }
  return rows;
}

// 🔧 개선: 에러 핸들링 강화
async function processChildren(
  blockId: string,
  noteSlug: string,
  imageIndex: { current: number }
): Promise<string> {
  try {
    const allBlocks: any[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        ...(cursor && { start_cursor: cursor }),
      });
      allBlocks.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor || undefined;
    }

    const processedBlocks = groupListBlocks(allBlocks);
    const htmlChunks = await Promise.all(
      processedBlocks.map(block => blockToHtml(block, noteSlug, imageIndex))
    );

    return htmlChunks.join("");
  } catch (error) {
    console.error("Error processing children blocks:", error);
    return "";
  }
}

// Notion 블록을 HTML로 변환하는 함수
async function blockToHtml(
  block: any,
  noteSlug: string,
  imageIndex: { current: number }
): Promise<string> {
  const type = block.type;
  const content = block[type];

  // 그룹화된 리스트 처리
  if (type === "bulleted_list_group" || type === "numbered_list_group") {
    const tag = type === "bulleted_list_group" ? "ul" : "ol";
    const itemsHtml = await Promise.all(
      block.items.map((item: any) => blockToHtml(item, noteSlug, imageIndex))
    );
    return `<${tag}>${itemsHtml.join("")}</${tag}>`;
  }

  if (!content && type !== "divider") return "";

  // 자식 블록 재귀 처리
  let childrenHtml = "";
  if (block.has_children) {
    childrenHtml = await processChildren(block.id, noteSlug, imageIndex);
  }

  // 개별 블록 타입별 렌더링
  switch (type) {
    case "paragraph":
      const pText = richTextToHtml(content.rich_text || []);
      return pText || childrenHtml
        ? `<p>${pText}${childrenHtml}</p>`
        : `<p><br></p>`;

    case "bulleted_list_item":
    case "numbered_list_item":
      return `<li>${richTextToHtml(content.rich_text || [])}${childrenHtml}</li>`;

    case "heading_1":
    case "heading_2":
    case "heading_3":
      const depth = type.split("_")[1];
      const text = richTextToHtml(content.rich_text || []);
      const id = text
        .replace(/<[^>]*>/g, "") // HTML 태그 제거
        .toLowerCase()
        .replace(/[^\w\s가-힣-]/g, "") // 한글 지원
        .replace(/\s+/g, "-");
      return `<h${depth} id="${id}">${text}</h${depth}>${childrenHtml}`;

    case "image":
      const url =
        content.type === "external" ? content.external?.url : content.file?.url;
      const caption =
        content.caption?.map((t: any) => t.plain_text).join("") || "";
      if (!url) return "";
      const localPath = await downloadImage(
        url,
        noteSlug,
        imageIndex.current++
      );
      return caption
        ? `<figure><img src="${localPath}" alt="${escapeHtml(caption)}" loading="lazy" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`
        : `<img src="${localPath}" alt="" loading="lazy" />`;

    case "code":
      const codeText =
        content.rich_text?.map((t: any) => t.plain_text).join("") || "";
      try {
        return await codeToHtml(codeText, {
          lang: content.language || "text",
          themes: { light: "one-light", dark: "tokyo-night" },
          defaultColor: false,
        });
      } catch (error) {
        console.warn("Code highlighting failed:", error);
        return `<pre><code>${escapeHtml(codeText)}</code></pre>`;
      }

    case "divider":
      return `<hr />`;

    case "equation": {
      const expression = content.expression || "";
      const equationHtml = renderEquation(expression, true);
      return equationHtml
        ? `<div class="equation-block">${equationHtml}</div>`
        : "";
    }

    case "quote":
      return `<blockquote>${richTextToHtml(content.rich_text || [])}${childrenHtml}</blockquote>`;

    case "column_list":
      return `<div class="column-list">${childrenHtml}</div>`;

    case "column":
      return `<div class="column">${childrenHtml}</div>`;

    case "callout": {
      const calloutText = richTextToHtml(content.rich_text || []);
      const emoji = content.icon?.emoji;
      const iconHtml = emoji
        ? `<span class="callout-icon">${emoji}</span>`
        : "";
      return `<div class="callout">${iconHtml}<div class="callout-content">${calloutText}${childrenHtml}</div></div>`;
    }

    case "toggle":
      const toggleText = richTextToHtml(content.rich_text || []);
      return `<details><summary>${toggleText}</summary>${childrenHtml}</details>`;

    case "table": {
      const tableRows = await fetchTableRows(block.id);
      const hasColumnHeader = content.has_column_header ?? false;
      const hasRowHeader = content.has_row_header ?? false;

      const renderRow = (row: any, isHeaderRow: boolean) =>
        `<tr>${(row.table_row?.cells ?? [])
          .map((cell: any[], i: number) => {
            const tag =
              isHeaderRow || (hasRowHeader && i === 0) ? "th" : "td";
            return `<${tag}>${richTextToHtml(cell || [])}</${tag}>`;
          })
          .join("")}</tr>`;

      const theadHtml =
        hasColumnHeader && tableRows.length > 0
          ? `<thead>${renderRow(tableRows[0], true)}</thead>`
          : "";
      const tbodyRows = hasColumnHeader ? tableRows.slice(1) : tableRows;
      const tbodyHtml = `<tbody>${tbodyRows
        .map((row: any) => renderRow(row, false))
        .join("")}</tbody>`;

      return `<div class="table-wrapper"><table class="prose-table">${theadHtml}${tbodyHtml}</table></div>`;
    }

    case "table_row":
      // table_row는 table 블록 내부에서 직접 처리되므로 여기 도달하지 않음
      return "";

    default:
      return childrenHtml;
  }
}

// 제목을 URL-safe slug로 변환하는 함수
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, "") // 특수문자 제거 (한글은 유지)
    .replace(/\s+/g, "-") // 공백을 하이픈으로
    .replace(/-+/g, "-") // 연속된 하이픈을 하나로
    .replace(/^-+|-+$/g, ""); // 앞뒤 하이픈 제거
}

// 특정 노트의 콘텐츠(블록)만 가져오는 함수 (note 메타데이터 없이)
export async function getNoteContent(note: NoteData) {
  const allBlocks: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: note.id,
        ...(cursor && { start_cursor: cursor }),
      });
      allBlocks.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor || undefined;
    }

    const imageIndex = { current: 1 };

    const processedBlocks = groupListBlocks(allBlocks);
    const htmlChunks = await Promise.all(
      processedBlocks.map(block => blockToHtml(block, note.slug, imageIndex))
    );
    const htmlContent = htmlChunks.join("");

    // 헤딩 추출
    const headings = allBlocks
      .filter(b => ["heading_1", "heading_2", "heading_3"].includes(b.type))
      .map(b => {
        const type = b.type;
        const richText = b[type].rich_text || [];
        const plainText = richText.map((t: any) => t.plain_text).join("");
        return {
          depth: parseInt(type.split("_")[1]),
          text: richTextToHtml(richText),
          slug: plainText
            .toLowerCase()
            .replace(/[^\w\s가-힣-]/g, "")
            .replace(/\s+/g, "-"),
        };
      });

    return { content: htmlContent, headings };
  } catch (error) {
    console.error("Error in getNoteContent:", error);
    return { content: "", headings: [] };
  }
}

// slug로 노트를 찾아 상세 정보와 콘텐츠를 가져오는 함수 (notes가 없을 때 fallback)
export async function getNoteBySlug(slug: string, notes?: NoteData[]) {
  const noteList = notes ?? (await getPosts());
  let note = noteList.find(n => n.slug === slug);
  if (!note) {
    note = noteList.find(n => titleToSlug(n.title) === slug);
  }
  if (!note) return null;

  const { content, headings } = await getNoteContent(note);
  return { data: note, content, headings };
}

// 블록 배열을 순회하며 연속된 리스트 아이템을 그룹화
function groupListBlocks(blocks: any[]): any[] {
  const grouped: any[] = [];
  let currentGroup: { type: string; items: any[] } | null = null;

  for (const block of blocks) {
    const isBullet = block.type === "bulleted_list_item";
    const isNumber = block.type === "numbered_list_item";

    if (isBullet || isNumber) {
      const type = isBullet ? "bulleted_list_group" : "numbered_list_group";
      if (currentGroup && currentGroup.type === type) {
        currentGroup.items.push(block);
      } else {
        currentGroup = { type, items: [block] };
        grouped.push(currentGroup);
      }
    } else {
      currentGroup = null;
      grouped.push(block);
    }
  }
  return grouped;
}
