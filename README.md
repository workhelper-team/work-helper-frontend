![](docs/images/title_banner.png)
<div align="center"><b><h3>
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router">
<img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios">
</br>
<img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot">
<img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java">
<img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Spring Security">
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
</br>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
<img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch">
<img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain">
</br>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
</br>
<img src="https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" alt="Amazon EC2">
<img src="https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" alt="Amazon S3">
<img src="https://img.shields.io/badge/Amazon_RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white" alt="Amazon RDS">
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
</br></br>
AI를 활용해 노동자의 권리를 보호하고 피해 구제 절차를 지원합니다.</br>
<a href="http://workhelper-front-bucket.s3-website.ap-northeast-2.amazonaws.com/">서비스 접속</a>
 · 
<a href="https://youtu.be/kuHNYSx85pk">시연 영상</a>
</br></br>

<table border="1" width="75%">
  <tr>
    <td colspan="3" align="center"><b>GitHub Repository</b></td>
  </tr>
  <tr>
    <td align="center" width="33.33%"><a href="https://github.com/workhelper-team/work-helper-frontend">프론트엔드</a></td>
    <td align="center" width="33.33%"><a href="https://github.com/workhelper-team/work-helper-backend">백엔드</a></td>
    <td align="center" width="33.33%"><a href="https://github.com/workhelper-team/work-helper-ai">AI 서버</a></td>
  </tr>
</table>
</br>
</h3></b></div>

## 프로젝트 보고서
| 보고서 | 별첨 |
| :---: | :---: |
| [![](docs/images/report.png)](https://drive.google.com/file/d/1z77QWlTrn-q8-e5Nt0XfNtqUGK486Avh/view?usp=sharing) | [![](docs/images/etc.png)](https://drive.google.com/file/d/1F5LqKwR31_nzdSNEVt11HtvXAsZL0L_8/view?usp=sharing) |

# WorkHelper Frontend
## 프로젝트 개요

WorkHelper Frontend는 노동 문제를 겪는 사용자를 위한 React SPA입니다. 사용자가 사건을 관리하고, 사건별 상담과 증거 분석을 진행하며, 진정서를 작성하고 전문가에게 질문할 수 있는 화면을 제공합니다.

## 팀 구성 및 역할 분담

| 담당자 | 구분 | 역할 |
| --- | --- | --- |
| 박성진(PM) | AI 서버 | 내부 API, OCR, LLM 워크플로우 및 RAG 개발, AI 서버 CI/CD, AI 서버 버전 관리 |
| 권순현(PL) | AI 서버 | 법령·판례 수집, 파싱, 임베딩 및 DB 적재, RAG, AI 채팅상담 개발, 백엔드 CI/CD |
| 이규원(AA) | 프론트/백 | DB 설계 및 구축, 외부 API 연동, 내부 AI API 연동, 프론트엔드/백엔드 버전 관리 |
| 홍동연 | 프론트/백 | AI 채팅상담 화면구현, 사건목록 화면구현, 화면 UI 구현 |
| 홍은지 | 프론트/백 | 로그인 및 회원가입 화면구현, JWT + Redis Session 기반 인증 세션 구현, React Router 기반 라우팅 제어 |
| 홍은영 | 프론트/백 | 전문가 QnA 화면구현, JWT 기반 사용자 권한별 분기 처리, S3 파일 업로드 로직 구현, 통합 테스트 |

## 시연 영상 및 서비스 화면

### 시연 영상
[![](docs/images/fp-thumbnail.png)](https://youtu.be/kuHNYSx85pk)

### 서비스 화면

| 메인화면 | 로그인 화면 | 사건 관리 화면 |
| :---: | :---: | :---: |
| ![](docs/images/main.png) | ![](docs/images/login.png) | ![](docs/images/mycase.png) |

| AI 채팅 상담 화면 | 증거 서류 분석 화면 | 진정서 작성 초안 화면 |
| :---: | :---: | :---: |
| ![](docs/images/aichat.png) | ![](docs/images/ocr.png) | ![](docs/images/petition.png) |

## 주요 기능

- 회원가입 및 로그인
- 사건 목록, 생성 및 상세 관리
- 사건별 AI 상담
- 사건 증거 등록 및 분석 화면
- 진정서 작성 및 PDF 출력
- 전문가 질문 및 답변
- 관리자 전문가 신청 심사

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Runtime | Node.js 22.23.2 |
| UI | React 18.3.x |
| Language | TypeScript 5.x |
| Build tool | Vite 6.x |
| Routing | React Router 6.x |
| HTTP client | Axios 1.x |
| State management | Zustand 5.x |

## 서비스 아키텍처

```mermaid
flowchart LR
    User[사용자] --> UI[React SPA\n페이지 및 기능]
    UI --> Client[공통 Axios client]
    Client -->|외부 /api 요청| Backend[Spring Boot Backend]
    Backend -. 백엔드 내부 AI 연동 .-> AI[FastAPI 및 AI 처리]
```

Frontend는 Spring Boot의 외부 `/api`만 호출합니다. Spring Boot와 FastAPI 간의 `/internal/ai/*` 계약, AI 처리, RAG, OCR/Vision 처리는 백엔드 영역이며 이 저장소에서 직접 호출하거나 구현하지 않습니다.

## 프로젝트 디렉토리 구조

```text
src/
├─ app/          # Application root와 중앙 Router
├─ pages/        # Route 단위 화면 조합
├─ features/     # 도메인별 API, 컴포넌트, 타입, 상태
│  ├─ admin/
│  ├─ auth/
│  ├─ cases/
│  ├─ consultation/
│  ├─ documents/
│  ├─ evidence/
│  └─ expert/
└─ shared/       # 공통 API client, 레이아웃, 유틸리티
```

## 실행 방법

### 요구 사항

- Node.js `22.23.2` 이상, `23` 미만
- Spring Boot Backend

### 설치 및 실행

```bash
npm install
npm run dev
```

### 검사 및 빌드

```bash
npm run lint
npm run build
```

### 환경 변수

| 변수명 | 설명 | 예시 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Spring Boot Backend origin | `http://localhost:8080` |

API 함수는 `/api/...` 경로를 사용하므로 `VITE_API_BASE_URL`에는 `/api`를 포함하지 않습니다.
