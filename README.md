# Work Helper Frontend

React + TypeScript + Vite 기반의 법률/행정 보조 웹 서비스 프론트엔드입니다.
백엔드(Spring Boot)와 REST API로 통신합니다.

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

| 변수명 | 설명 | 기본값 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | `http://localhost:8080/api` |

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드 / 린트

```bash
npm run build   # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과 미리보기
```

## 폴더 구조

```
src/
├─ assets/                # 이미지, 아이콘 등 정적 리소스
├─ components/
│  ├─ common/             # 버튼 등 재사용 가능한 기본 UI 컴포넌트
│  └─ layout/             # Header, Footer 등 레이아웃 컴포넌트
├─ features/              # 도메인별 로직/컴포넌트 (auth, case, consultation, petition, community)
├─ pages/                 # 도메인별 메인 뷰 페이지 컴포넌트
├─ services/              # axios 인스턴스(api.ts) 및 도메인별 API 호출 함수
├─ stores/                # 전역 상태(zustand) - 예: authStore
├─ types/                 # 도메인별 TypeScript interface 정의
└─ utils/                 # 날짜/문자열 등 공통 유틸 함수
```

### 핵심 도메인

1. **Auth** - 로그인 / 회원가입
2. **Case** - 사건 등록 및 목록 관리
3. **Consultation** - AI 챗봇 기반 법률 상담
4. **Petition** - OCR 서류 업로드 및 AI 진정서 생성/미리보기
5. **Community** - 커뮤니티 게시판
