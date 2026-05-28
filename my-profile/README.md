# MyLink (마이링크) - Link-in-Bio 서비스 🔗

> **MyLink**는 사용자의 다양한 소셜 미디어 링크, 블로그, 개인 웹사이트 등을 한 페이지에 모아 직관적이고 세련되게 공유할 수 있도록 지원하는 **Link-in-Bio(링크인바이오) 서비스**입니다.

이 프로젝트는 최신 웹 기술 스택을 바탕으로 구현되어, 빠르고 부드러운 유저 경험(UX)과 아름다운 테마, 그리고 방문자 통계 분석 기능을 제공합니다.

---

## ✨ 주요 기능 (Key Features)

- **🔐 Google 로그인 연단**: 
  - Firebase Authentication을 활용하여 소셜 계정으로 신속하게 가입하고 로그인할 수 있습니다.
- **👤 커스텀 프로필 설정**:
  - 프로필 이미지(아바타), 디스플레이 이름, 나만의 개성 넘치는 **고유 핸들(Handle, `@username`)** 및 한 줄 소개(Bio)를 직관적인 인라인 에디터를 통해 손쉽게 관리합니다.
  - 디스플레이 이름과 핸들(ID)의 중복 여부를 실시간으로 체크하여 고유성을 보장합니다.
- **🔗 다이내믹 링크 관리**:
  - 원하는 제목과 URL을 입력하여 자신의 링크 카드 목록을 추가, 수정, 삭제할 수 있습니다.
  - TanStack Query의 **낙관적 업데이트(Optimistic Update)**를 적용하여 지연 없는 매끄러운 링크 편집 환경을 선사합니다.
- **🎨 개인화 테마 & 다크 모드**:
  - 다양한 파스텔톤 컬러 테마 배경을 클릭 한 번으로 간편하게 전환할 수 있습니다.
  - 눈의 피로를 덜어주는 완성도 높은 시스템 수준의 다크 모드를 완벽하게 지원합니다.
- **📊 방문자 및 링크 통계 (Stats)**:
  - 개인 페이지로 유입되는 방문자 수 및 각 링크 카드의 클릭 횟수를 모니터링할 수 있는 대시보드를 제공합니다.
- **📤 손쉬운 공유 기능**:
  - 자신의 공유 링크 복사 및 인쇄나 화면 스캔에 용이한 전용 **QR 코드 생성** 기능을 제공합니다.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, `@tailwindcss/postcss`
- **State Management & Data Fetching**: TanStack Query (React Query) v5
- **Backend & Database**: Firebase Firestore, Firebase Authentication
- **Form Handling**: React Hook Form, Zod
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 및 패키지 설치
먼저 저장소를 클론한 뒤 `my-profile` 디렉토리로 이동하여 필요한 패키지를 설치합니다.

```bash
cd my-profile
npm install
```

### 2. 환경 변수 설정
`my-profile` 루트 디렉토리에 `.env.local` 파일을 생성하고 아래와 같이 Firebase 프로젝트 구성 키들을 설정해 줍니다.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. 로컬 개발 서버 실행

```bash
npm run dev
```

서버가 구동되면 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 결과를 확인할 수 있습니다.

### 4. 빌드 및 프로덕션 실행

```bash
# 프로덕션 빌드
npm run build

# 빌드된 애플리케이션 시작
npm run start
```

---

## 📂 프로젝트 구조 (Project Structure)

```text
my-profile/
├── app/                  # Next.js App Router (Layout, Pages, Routing)
│   ├── [displayName]/    # 사용자의 퍼블릭 프로필 상세 보기 다이내믹 라우팅
│   ├── stats/            # 방문 통계 분석 페이지
│   ├── globals.css       # 글로벌 Tailwind 스타일 정의
│   ├── layout.tsx        # 최상위 레이아웃
│   └── page.tsx          # 메인 링크 관리 대시보드 및 랜딩 페이지
├── components/           # 재사용 가능한 UI 컴포넌트 (Shadcn UI 포함)
│   └── ui/               # 공통 UI 컴포넌트 (Button, Card, Dialog 등)
├── data/                 # 정적 데이터 정의
├── lib/                  # 외부 라이브러리 설정 (Firebase 연동 서비스 모듈 등)
└── public/               # 정적 애셋 (이미지, 로고, 파비콘 등)
```
