# WorkHelper Frontend

WorkHelper Frontend는 노동 문제를 겪는 사용자를 위한 React SPA입니다. 로그인·회원가입, 사건 관리, 사건별 AI 상담, 증거 분석, 진정서 작성·PDF 출력, 전문가 질문 및 관리자 전문가 심사 화면이 구현되어 있습니다.

## 기술 스택

- Node.js 22.23.2
- React 18.3.x
- TypeScript 5.x
- Vite 6.x
- React Router 6.x
- Axios 1.x
- Zustand 5.x

## 실행 방법

```bash
npm install
npm run dev
npm run lint
npm run build
```

## 환경변수

| 변수명 | 설명 | 예시 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Spring Boot Backend origin | `http://localhost:8080` |

기능별 API 함수는 API 설계서의 `/api/...` 경로를 그대로 사용합니다. 따라서 `VITE_API_BASE_URL`에는 `/api`를 포함하지 않습니다.

## 구조

```text
src/
├─ app/       # Application root와 중앙 Router
├─ pages/     # Route 단위 화면 조합
├─ features/  # 도메인별 API, 컴포넌트, 타입, 상태
└─ shared/    # 공통 Axios client와 레이아웃
```

`app/router`에서 경로를 관리하고, `pages`는 경로별 화면을 구성합니다. `features`에는 auth, cases, consultation, evidence, documents, expert, admin의 기능별 API·컴포넌트·타입이 있습니다. `shared/api/client.ts`는 공통 Axios client입니다.

Frontend는 Spring Boot의 외부 `/api`만 호출합니다. Spring Boot와 FastAPI 간의 `/internal/ai/*` 계약, AI 처리, RAG, OCR/Vision 처리는 Frontend에서 직접 호출하거나 구현하지 않습니다.
