# WorkHelper Frontend

WorkHelper Frontend는 노동 문제를 겪는 사용자를 위한 React SPA입니다. 현재 저장소는 팀 공통 foundation과 directory skeleton 단계이며, 실제 비즈니스 기능과 화면은 아직 구현하지 않았습니다.

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
Copy-Item .env.example .env
npm run dev
```

검증 및 미리보기 명령어입니다.

```bash
npm run lint
npm run build
npm run preview
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
└─ shared/    # 도메인 비종속 공통 코드
```

`features/auth`는 인증 전역 상태가 실제로 필요해질 때 `store`를 사용합니다. 다른 feature에는 필요한 하위 구조만 추가합니다.

Frontend는 Spring Boot의 외부 `/api`만 호출합니다. Spring Boot와 FastAPI 간의 `/internal/ai/*` 계약, AI 처리, RAG, OCR/Vision 처리는 Frontend에서 직접 호출하거나 구현하지 않습니다.
