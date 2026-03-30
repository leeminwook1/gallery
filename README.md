# 🎨 LUMIÈRE Gallery

> 당신의 작품을 세상과 나누는 온라인 전시회

우아하고 현대적인 이미지 갤러리 웹 애플리케이션입니다. 작품을 업로드하고, 카테고리별로 분류하며, 다양한 뷰 모드로 감상할 수 있습니다.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ 주요 기능

- 🖼️ **작품 업로드 & 관리** - 이미지 업로드, 수정, 삭제 기능
- 🎭 **카테고리 분류** - 회화, 조각, 사진, 디지털, 설치미술, 기타
- 🔍 **실시간 검색** - 제목, 작가, 설명으로 작품 검색
- 📊 **다양한 뷰 모드** - 그리드, 리스트 뷰 지원
- 🎬 **슬라이드쇼** - 자동 재생 슬라이드쇼 모드
- 🖥️ **전시회 모드** - 전체화면 전시회 경험
- ❤️ **좋아요 기능** - 마음에 드는 작품 저장
- 🎲 **랜덤 작품** - 무작위 작품 감상
- 📱 **반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- 🌙 **다크 모드** - 눈에 편안한 다크 테마
- 🎉 **인터랙티브 UI** - 부드러운 애니메이션과 피드백

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/leeminwook1/gallery.git
cd gallery

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
gallery/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── images/        # 이미지 CRUD
│   │   └── upload/        # 파일 업로드
│   ├── exhibition/        # 전시회 페이지
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ImageCard.tsx      # 이미지 카드
│   ├── LightboxModal.tsx  # 라이트박스
│   ├── UploadModal.tsx    # 업로드 모달
│   ├── EditModal.tsx      # 수정 모달
│   ├── SlideshowMode.tsx  # 슬라이드쇼
│   ├── Navbar.tsx         # 네비게이션
│   ├── Toast.tsx          # 알림 토스트
│   └── Confetti.tsx       # 축하 효과
├── data/                  # 데이터 저장소
│   └── gallery.json       # 갤러리 데이터
├── lib/                   # 유틸리티
│   └── db.ts              # 데이터베이스 헬퍼
├── types/                 # TypeScript 타입
│   └── index.ts           # 공통 타입 정의
└── public/                # 정적 파일
    └── uploads/           # 업로드된 이미지
```

## 🎨 기술 스택

- **프레임워크**: Next.js 16.2 (App Router)
- **UI 라이브러리**: React 19.2
- **언어**: TypeScript 5.0
- **스타일링**: TailwindCSS 4.0 + Custom CSS
- **파일 업로드**: Multer
- **상태 관리**: React Hooks (useState, useEffect, useMemo)
- **데이터 저장**: JSON 파일 기반

## 🎯 주요 컴포넌트

### ImageCard
개별 이미지를 표시하는 카드 컴포넌트로, 호버 효과와 좋아요 기능을 포함합니다.

### LightboxModal
이미지를 전체 화면으로 보여주는 모달로, 이전/다음 네비게이션, 수정, 삭제 기능을 제공합니다.

### UploadModal
새로운 작품을 업로드하는 모달로, 이미지 미리보기와 메타데이터 입력을 지원합니다.

### SlideshowMode
자동 재생 슬라이드쇼 모드로, 전체 화면에서 작품을 감상할 수 있습니다.

## 📝 API 엔드포인트

- `GET /api/images` - 모든 이미지 조회
- `POST /api/upload` - 이미지 업로드
- `PUT /api/images/edit` - 이미지 정보 수정
- `DELETE /api/images/delete` - 이미지 삭제

## 🎨 커스터마이징

### 색상 테마
`app/globals.css`에서 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
  --gold: #C4A265;
  --bg-primary: #0A0A0A;
  --text-primary: #E8E8E8;
  /* ... */
}
```

### 카테고리
`types/index.ts`에서 카테고리를 추가하거나 수정할 수 있습니다:

```typescript
export const CATEGORIES = ["전체", "회화", "조각", "사진", "디지털", "설치미술", "기타"] as const;
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👤 작성자

**leeminwook1**

- GitHub: [@leeminwook1](https://github.com/leeminwook1)

## 🙏 감사의 말

- Next.js 팀의 훌륭한 프레임워크
- React 커뮤니티의 지속적인 지원
- 모든 오픈소스 기여자들

---

<p align="center">Made with ❤️ by leeminwook1</p>
