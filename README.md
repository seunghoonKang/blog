# Blog

Astro 기반의 정적 블로그입니다. Notion을 CMS로 사용하여 콘텐츠를 관리하고, Posts와 Notes 두 가지 타입의 콘텐츠를 지원합니다. (Posts는 추가 예정)

## ✨ 주요 기능

- 📝 **Notion CMS 연동**: Notion 데이터베이스를 통해 콘텐츠 관리
- 📚 **이중 콘텐츠 타입**: Posts와 Notes로 콘텐츠 분류
- 🎨 **다크/라이트 테마**: 사용자 선호에 따른 테마 전환
- 🏷️ **태그 시스템**: 콘텐츠 태그 기반 분류 및 필터링
- 💻 **코드 하이라이팅**: Shiki를 사용한 문법 강조
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 최적화
- 🖼️ **이미지 최적화**: Sharp를 사용한 이미지 처리
- 📑 **목차 자동 생성**: Markdown 문서의 목차 자동 생성

## 📁 프로젝트 구조

```
/
├── public/                 # 정적 파일
│   ├── fonts/            # 폰트 파일
│   └── notes-images/     # Notion에서 가져온 이미지
├── scripts/              # 유틸리티 스크립트
│   └── cleanup-original-images.js
├── src/
│   ├── assets/          # 이미지, 아이콘 등
│   ├── components/      # Astro 컴포넌트
│   │   ├── BlogPost.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Main.astro
│   │   ├── Navigation.astro
│   │   └── Social.astro
│   ├── data/            # 로컬 마크다운 파일
│   │   ├── notes/
│   │   └── posts/
│   ├── layouts/         # 레이아웃 컴포넌트
│   │   ├── BaseLayout.astro
│   │   └── MarkdownPostLayout.astro
│   ├── pages/           # 라우트 페이지
│   │   ├── index.astro
│   │   ├── notes/
│   │   ├── posts/
│   │   └── tags/
│   ├── styles/          # 전역 스타일
│   │   └── global.css
│   └── utils/           # 유틸리티 함수
│       ├── notion.ts    # Notion API 연동
│       └── smoothScroll.ts
├── astro.config.mjs     # Astro 설정
├── content.config.ts    # 콘텐츠 컬렉션 설정
└── package.json
```

## 🛠️ 사용 기술

- **Astro** - 정적 사이트 생성 프레임워크
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **MDX** - Markdown + JSX 지원
- **Notion API** - 콘텐츠 관리 시스템
- **Shiki** - 코드 문법 강조
- **Sharp** - 이미지 최적화
- **TypeScript** - 타입 안정성

## 📜 사용 가능한 명령어

| 명령어                | 설명                              |
| :-------------------- | :-------------------------------- |
| `pnpm dev`            | 개발 서버 시작 (`localhost:4321`) |
| `pnpm build`          | 프로덕션 빌드 생성 (`./dist/`)    |
| `pnpm preview`        | 빌드된 사이트 미리보기            |
| `pnpm cleanup-images` | 원본 이미지 정리 스크립트 실행    |
| `pnpm astro ...`      | Astro CLI 명령어 실행             |

## 📝 콘텐츠 작성

### Notion을 통한 작성

1. Notion 데이터베이스에 새 페이지 생성
2. 필수 필드 입력:
   - Title: 제목
   - PubDate: 발행일
   - Description: 설명
   - Author: 작성자
   - Tags: 태그 (배열)
   - Category: 카테고리
   - Slug: URL 슬러그
3. 빌드 시 자동으로 마크다운으로 변환

### 로컬 마크다운 파일 작성

`src/data/posts/` 또는 `src/data/notes/` 디렉토리에 마크다운 파일을 생성하고 frontmatter를 추가하세요:

```markdown
---
title: "포스트 제목"
pubDate: 2024-01-01
description: "포스트 설명"
author: "작성자"
image:
  url: "/image.jpg"
  alt: "이미지 설명"
tags: ["태그1", "태그2"]
category: "카테고리"
---

포스트 내용...
```

## 🎨 커스터마이징

### 테마 변경

`src/styles/global.css`에서 CSS 변수를 수정하여 테마 색상을 변경할 수 있습니다.

### 폰트 변경

`public/fonts/` 디렉토리에 폰트 파일을 추가하고 `global.css`에서 폰트를 설정하세요.

## 📦 배포

빌드된 사이트는 `dist/` 디렉토리에 생성됩니다. 다음 플랫폼에 배포할 수 있습니다:

- **Vercel** (권장)
- **Netlify**
- **GitHub Pages**
- 기타 정적 호스팅 서비스

### Vercel 배포 예시

```bash
# Vercel CLI 설치
pnpm add -g vercel

# 배포
vercel
```

환경 변수는 배포 플랫폼의 설정에서 추가해야 합니다.

### Giscus 댓글 (notes 글)

1. [blog](https://github.com/seunghoonKang/blog) 레포에서 Discussions 활성화
2. [Giscus GitHub App](https://github.com/apps/giscus) 설치
3. [giscus.app](https://giscus.app/ko)에서 `pathname` 매핑·카테고리 설정 후 ID 복사
4. Vercel(또는 로컬 `.env`)에 `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` 설정 후 재배포

## 🤝 기여

이슈나 풀 리퀘스트를 환영합니다!

## 📄 라이선스

이 프로젝트는 개인 블로그 프로젝트입니다.

## 🔗 관련 링크

- [Astro 공식 문서](https://docs.astro.build)
- [Notion API 문서](https://developers.notion.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
