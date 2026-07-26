export type DetailLabel = "배경" | "수행" | "성과";

export type DetailRow = {
  label: DetailLabel;
  text: string;
};

export type DetailGroup = {
  title?: string;
  note?: string;
  rows: [DetailRow, DetailRow, DetailRow]; // 배경 · 수행 · 성과
};

export type CareerProject = {
  title: string;
  note?: string;
  groups: DetailGroup[];
};

export type CareerHighlight = {
  html: string;
};

export type CareerJob = {
  id: string;
  company: string;
  role?: string;
  period?: string;
  description?: string;
  highlights?: CareerHighlight[];
  tags?: string[];
  details?: DetailGroup[];
  projects?: CareerProject[];
  detailsSummary?: string;
};

export type CareerTone = "teal" | "violet";

export type CareerTrack = {
  id: string;
  title: string;
  tone: CareerTone;
  soon?: {
    badge: string;
    period: string;
  };
  jobs: CareerJob[];
};

function trio(
  background: string,
  action: string,
  result: string
): [DetailRow, DetailRow, DetailRow] {
  return [
    { label: "배경", text: background },
    { label: "수행", text: action },
    { label: "성과", text: result },
  ];
}

export const careerIntro = {
  title: "강승훈",
  titleEn: "Seunghoon Kang",
  email: "tmdgns4321@gmail.com",
  github: "https://github.com/seunghoonKang",
  linkedin: "https://www.linkedin.com/in/pro-kang-b05736231",
};

export const logisticsTrack: CareerTrack = {
  id: "logistics",
  title: "물류 경력",
  tone: "teal",
  soon: {
    badge: "Coming soon",
    period: "2026.07~",
  },
  jobs: [
    {
      id: "deleo",
      company: "델레오코리아",
      role: "물류운영팀 매니저",
      period: "2019.08 – 2022.03",
      description:
        "국내외 B2C 물류 IT 스타트업. 자사몰·스마트스토어 출고 및 해외 역직구, 센터 구축·운영 담당.",
      highlights: [
        {
          html: '영양제 고객사 맞춤 출고 — 월 <span class="metric">100건 → 9,000건</span> (1년, 약 90배)',
        },
        {
          html: '이벤트 돌발 물량 <span class="metric">3,000건</span> 3일 내 완료 (기존 대비 약 2주 단축)',
        },
        {
          html: '도급 → 자체 운영 전환 — 이익률 약 <span class="metric">30%</span> 개선, 센터 500평→1,000평 확장',
        },
      ],
      detailsSummary: "자세히 보기",
      details: [
        {
          title: "국내·해외 B2C 출고 운영",
          rows: trio(
            "화장품·영양제·차량용품 등 다품목, 국내 출고와 해외 역직구 병행 운영 환경.",
            "자사몰·스마트스토어 국내 B2C 출고 및 해외 역직구 총괄. EMS·DHL·UPS·SF 등 특송사별 프로세스 운영·자동화.",
            "영양제 고객사 월 출고 <span class=\"metric\">100건 → 9,000건</span>. 돌발 물량 <span class=\"metric\">3,000건</span> 3일 내 소화."
          ),
        },
        {
          title: "데이터 기반 수요 대응",
          rows: trio(
            "시즌·이벤트 물량 급증 시 인력·동선·부자재 계획 병목.",
            "3년 출고 데이터 기반 물량 예측, 출고 동선·포장대 레이아웃 재설계. Excel VBA 반복 업무 자동화. 정산서 표준화 및 연간 인상률 반영 월 정산 모델 구축.",
            "이벤트 물량 차질 없이 소화. 반복 업무 <span class=\"metric\">2분 → 10초</span>."
          ),
        },
        {
          title: "WMS/OMS · 센터 구축",
          rows: trio(
            "도급 운영·수작업·엑셀 의존도 높음. 센터 확장과 시스템 개선 동시 필요.",
            "자체 WMS/OMS 운영 및 신규 플랫폼 PRD 기획 참여. JIRA/Slack 월평균 7~10건 개선 티켓. 센터 입주(0→1)·500평→1,000평 확장·파렛트랙 설치 주도.",
            "도급 → 자체 운영, 이익률 약 <span class=\"metric\">30%</span> 개선. 상온·저온 복합 물류 기획으로 신규 고객사 유치."
          ),
        },
      ],
    },
    {
      id: "moltail",
      company: "몰테일",
      role: "출고관리팀 인턴 (미국 뉴저지)",
      period: "2017.06 – 2018.06",
      description:
        "MakeShopNCompany. 미국 뉴저지 기반 이커머스 배송대행 출고 운영.",
      highlights: [
        {
          html: '블랙프라이데이 일 출고 <span class="metric">6,000건</span> 대응 — NJ→Georgia 신규 루트로 지체 물량 1주일 내 해소',
        },
        {
          html: '고가·귀중품 전용 입출고 프로세스 — 오출고 <span class="metric">0%</span>',
        },
      ],
      detailsSummary: "자세히 보기",
      details: [
        {
          title: "피크 시즌 · 고가품 운영",
          rows: trio(
            "블랙프라이데이 평시 대비 3배 물량. 기존 루트 지체 누적. 고가·귀중품 오출고 리스크.",
            "NJ→Georgia 신규 배송 루트 제안. 고가·귀중품 전용 입출고 프로세스 설계·운영. LD3·PMC 화물 예약 및 스케줄 조정.",
            "일 출고 <span class=\"metric\">6,000건</span> 소화, 지체 물량 약 10,000건 1주일 내 해소. 고가품 오출고 <span class=\"metric\">0%</span>."
          ),
        },
      ],
    },
    {
      id: "certs",
      company: "자격",
      highlights: [
        { html: "물류관리사 (국토교통부, 2019.08)" },
        { html: "소형건설기계 조종사면허 — 지게차 (2021.03)" },
      ],
    },
  ],
};

export const engineeringTrack: CareerTrack = {
  id: "engineering",
  title: "개발 경력",
  tone: "violet",
  jobs: [
    {
      id: "upsight",
      company: "업사이트",
      role: "Frontend Engineer",
      period: "2025.04 – 2026.06",
      description:
        "건설 현장 관리 SaaS. 디자인 시스템·기반 기술·성능·사내 도구 프론트엔드 오너십.",
      highlights: [
        {
          html: 'Chakra UI → Tailwind 전사 마이그레이션 — <span class="metric">665파일</span>, Phase 분할·회귀 테스트로 무중단 전환',
        },
        {
          html: 'Next.js 16 + 빌드 최적화 — pre-push <span class="metric">7분 → 70초</span>',
        },
        {
          html: 'dayjs → Temporal 표준 도입, 폰트 서브셋 <span class="metric">2MB → 115KB</span>',
        },
        {
          html: 'CVE 핫픽스, useEffect 전수 감사 — 런타임 버그 <span class="metric">4건</span> 수정',
        },
        {
          html: "Sentry→Claude→Telegram AI 에러 분석 파이프라인 설계·구현",
        },
      ],
      tags: ["React", "Next.js", "TypeScript", "Tailwind", "TanStack Query"],
      detailsSummary: "프로젝트별 자세히 보기",
      projects: [
        {
          title: "01 · 메인 SaaS 프론트엔드",
          note: "Next.js App Router · React · TS · Tailwind · Radix · Zustand · TanStack Query",
          groups: [
            {
              title: "Chakra UI → Tailwind 전사 마이그레이션",
              rows: trio(
                "Chakra UI(CSS-in-JS) 런타임 오버헤드, Figma 디자인 토큰 불일치.",
                "Phase 0~6 분할 — 토큰 이식 → UI primitive 재구현+Vitest → 도메인 전환 → Chakra 완전 제거.",
                "<span class=\"metric\">665파일</span> (+23,221 / −26,281) 무중단 전환. Chakra 의존성 제거."
              ),
            },
            {
              title: "dayjs → Temporal / Next 16 / UX·안정성",
              rows: trio(
                "날짜 유틸·빌드 시간·리스트 로딩·useEffect 안티패턴으로 안정성·DX 저하.",
                "Temporal 유틸 표준화, proxy/standalone·Turbopack, 스켈레톤+keepPreviousData, useEffectEvent 전환, CVE 핫픽스, Typography v2·Select/Menu Radix 통합.",
                "pre-push 빌드 <span class=\"metric\">7분 → 70초</span>. 런타임 버그 <span class=\"metric\">4건</span> 수정. 체감 로딩·타입 안전성 개선."
              ),
            },
          ],
        },
        {
          title: "02 · 개발사 포털",
          note: "Next.js · Tailwind v4 · shadcn/ui",
          groups: [
            {
              title: "글로벌 주소 · 경로 표준화 · Toast 통합",
              rows: trio(
                "해외 사용자 Daum 우편번호 입력 불가. 경로·Toast 구현 산재.",
                "국내(Daum)+해외(Google Places) 통합 주소 입력. ROUTES 상수 중앙화(<span class=\"metric\">90파일</span>). Toast → Sonner 통합.",
                "글로벌 주소 입력 지원. 경로 오타성 버그·Toast 중복 제거."
              ),
            },
          ],
        },
        {
          title: "03 · 백오피스",
          note: "Next.js · React · TypeScript",
          groups: [
            {
              title: "문서 미리보기 · 업로드 · i18n",
              rows: trio(
                "현장 문서 웹 미리보기 및 파일·다국어·인증 플로우 일관성 필요.",
                "PDF/Excel/PPT 웹 미리보기, 재사용 다중 파일 업로드, i18n 확대, 계정 복구·인증 플로우 구현.",
                "문서 포맷 미리보기·파일 처리 중앙화. 로그아웃 후 언어 유지 다국어 UX."
              ),
            },
          ],
        },
        {
          title: "04 · 홈페이지 성능",
          note: "Next.js · TypeScript · Tailwind · Radix UI",
          groups: [
            {
              title: "폰트 · 번들 · 이미지 최적화",
              rows: trio(
                "Pretendard 전체 폰트·화면 밖 ContactForm으로 모바일 LCP·초기 JS 부하.",
                "빌드타임 폰트 서브셋, ContactForm dynamic import, Hero PNG→WebP 재인코딩.",
                "폰트 <span class=\"metric\">2MB → 115KB</span>. 초기 JS <span class=\"metric\">68KB</span> 절감. 이미지 <span class=\"metric\">37%</span> 감소."
              ),
            },
          ],
        },
        {
          title: "05 · 문서·토큰·사내 도구",
          note: "Astro · style-dictionary · Vercel · Claude API",
          groups: [
            {
              title: "문서 사이트 · 토큰 · AI 운영 도구",
              rows: trio(
                "서버사이드 Mermaid 렌더로 배포 실패. 디자인 토큰·에러 트리아지·사내 도구 파편화.",
                "Mermaid 클라이언트 하이드레이트 전환, design-tokens 파이프라인, Claude 플러그인 제품화, Sentry→Claude→Telegram 분석기 구축.",
                "배포 안정화, Figma↔코드 연계, 수동 에러 트리아지 비용 절감."
              ),
            },
          ],
        },
      ],
    },
    {
      id: "caresquare",
      company: "케어스퀘어",
      role: "Frontend Developer",
      period: "2023.09 – 2025.01",
      description:
        "헬스케어 IT 스타트업. 어드민·정부지원사업·임상시험 플랫폼 프론트엔드.",
      highlights: [
        { html: "케어플래너 어드민 디자인 개편·캘린더·에디터 구현" },
        {
          html: '일 가입자 평균 <span class="metric">0.4명 → 23명</span> 증가 기여 (24.05→24.08)',
        },
        { html: "정부지원사업 기획·디자인·개발 전 과정 참여" },
      ],
      tags: ["React", "Vue", "Next.js", "React Query", "Styled-components"],
      detailsSummary: "자세히 보기",
      details: [
        {
          title: "케어플래너 어드민",
          rows: trio(
            "관리자 UI/UX 분산, 일정·콘텐츠 편집 흐름 비직관.",
            "전체 디자인 개편, 커스텀 캘린더, React-quill 에디터·이미지 로직, Context 기반 리스트 Anchoring.",
            "일 가입자 평균 <span class=\"metric\">0.4명 → 23명</span> (24.05→24.08) 증가 기여."
          ),
        },
        {
          title: "레지스트리 허브",
          rows: trio(
            "의료전문가 연구자료 통합 플랫폼 구축 (2023.11–2023.12).",
            "FigJam 기반 디자인·기획 및 전체 프론트엔드 개발(Vue). Fuzzy search 검색 구현. 사용 시나리오·API 규칙 등 베이스부터 참여.",
            "연구자료 검색·조회 흐름 정립. 시나리오·API 규칙을 제품에 반영."
          ),
        },
      ],
    },
  ],
};

export const education = {
  school: "단국대학교",
  major: "국제통상학부 무역학",
  period: "2010.03 – 2017.02",
};

export const skills: { label: string; value: string }[] = [
  { label: "물류", value: "WMS/OMS 운영·기획, B2C 출고, 3PL 센터, 해외특송" },
  { label: "데이터", value: "Excel (VLOOKUP, XLOOKUP, VBA), SQL 기초" },
  {
    label: "Frontend",
    value: "React, Next.js, TypeScript, Tailwind, TanStack Query",
  },
  {
    label: "품질·인프라",
    value: "Vitest, Playwright, Docker, GitHub Actions, Vercel",
  },
  { label: "협업", value: "JIRA, Confluence, Slack, Notion" },
];
