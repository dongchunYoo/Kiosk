# Code Style Guide

## 프로젝트 표준

### 프로젝트 구조
```
ProjectRoot/
 ├── Backend_Node      (API / Node + Hono)
 ├── Frontend_Node     (Admin / React + Vite)
 └── App_React         (Mobile / React + Expo)
```

### PORT 규칙
- PORT는 반드시 `.env` 파일에 수동으로 작성
- 절대 하드코딩 금지
- 절대 자동 생성 금지
- CLI 인자로 전달 금지
- 항상 `.env`에서 읽기
- 누락 시 → STOP

### 실행 순서
모든 run 스크립트는 다음 순서를 준수:
1. Clean
2. Install
3. Build
4. Run
5. Log

### Logging 파일 정책
- 로그는 반드시 `dev.log`에 작성
- `tail -f dev.log`로 모니터링
- run 스크립트에서 console-only 실행 금지

---

## Redis 거버넌스

### 1. Redis 키 prefix 규칙
- `Backend_Node/.env`의 `REDIS_PREFIX` 참조 필수
- `REDIS_PREFIX` 값 = 루트 폴더명 (현재: `Kiosk`)
- `.env`에 누락 시 → 자동 삽입

### 2. 키 포맷
```
${REDIS_PREFIX}:<domain>:<key>
```
예: `Kiosk:session:user123`

### 3. Hardcoded prefix 금지

### 4. Backend_Node/run.dev.sh 규칙
- redis-server 실행 여부 체크
- 미실행 시 → redis-server 시작
- 연결 검증
- 실패 시 → STOP

**Redis는 API 부팅 전에 반드시 활성화되어 있어야 함**

---

## Logging 거버넌스 (필수)

### Logger 파일
각 프로젝트는 자체 logger 파일 필수:
- 위치: `/src/logger.ts` (또는 src 루트)
- 모든 로그는 이 logger를 통해서만 출력
- 직접 `console.log` 사용 금지 (logger 외부)

### 로그 포맷 (통일 필수)
```
[PROJECT][LEVEL][TIMESTAMP] message
```

규칙:
- **PROJECT** = 폴더명에서 `_` 앞부분
  - `Backend_Node` → `Backend`
  - `Frontend_Node` → `Frontend`
  - `App_React` → `App`
- **LEVEL**은 다음 중 하나:
  - `INFO`
  - `DEBUG`
  - `ERROR`
- **TIMESTAMP** 포맷: `HH:MM:SS` (24시간)

### 색상 규칙 (엄격)
- `INFO` → 파란색 (Blue)
- `DEBUG` → 초록색 (Green)
- `ERROR` → 빨간색 (Red)

### 라이브러리 규칙

**Backend_Node:**
- 반드시 `chalk` 사용

**App_React:**
- 반드시 `chalk` 사용

**Frontend_Node:**
- 기본 console만 사용
- 브라우저 console 스타일링 불필요
- 외부 로깅 라이브러리 불필요

### Logger 중앙화 규칙
- `logger.ts`만 로그 출력 가능
- 비즈니스 로직은 `logger.info/debug/error` 호출
- 분산된 `console.log` 금지
- 인라인 로깅 금지

**위반 = 스타일 위반**

---

## TypeScript 규칙

### Import 규칙
- Import는 항상 파일 상단에 추가만 가능
- 기존 import 삭제/이동 금지 (리팩토링 제외)
- 순서:
  1. Node 내장 모듈
  2. 외부 라이브러리
  3. 내부 모듈 (절대 경로)
  4. 상대 경로

### Function 규칙
- 새 함수는 항상 파일 하단에 추가
- 기존 함수 위치 이동 금지 (리팩토링 제외)
- 함수 순서 변경 금지

### 변수명 규칙
- `camelCase`: 변수, 함수
- `PascalCase`: 클래스, 타입, 인터페이스
- `UPPER_SNAKE_CASE`: 상수

---

## 문서화

### 필수 문서
- `dev_Screen_page.md` (UI 변경 시)
- `dev_api_page.md` (API 변경 시)
- `dev_ai_error.md` (에러 발생 시)
- `dev_db.sql` (DB 변경 시)
- `dev_code_style.md` (스타일 변경 시)
- `aiagent_Tip.md`

### 문서 업데이트 트리거
- API 변경
- UI 변경
- 기능 변경
- Redis 구조 변경
- Logging 구조 변경

**문서 미업데이트 = 작업 미완료**

---

## 데이터 모델

### DB → Kysely
- DB 스키마는 Kysely 타입으로 관리
- 타입 정의: `src/types/db.ts`

### 공유 Zod 스키마
- API 요청/응답은 Zod로 검증
- 프론트엔드는 **반드시** `Zod.parse` 사용

---

## 에러 처리

### dev_ai_error.md 우선 업데이트
- 에러 발생 시 해당 파일에 먼저 기록
- 원인, 해결책, 재발 방지책 명시

---

## 개발 순서

1. DB 리뷰
2. API 정의
3. State 정의
4. UI 구현

---

## SELECT 쿼리 규칙

- 모든 SELECT는 `SELECT *` 사용
- 특정 컬럼만 선택 금지

---

## Android Emulator

- Backend URL은 반드시:
  ```
  http://10.0.2.2:<PORT>
  ```
- `localhost` 사용 금지

---

## 스택 (고정)

- TypeScript
- React + Expo
- React + Vite
- Node + Hono
- MySQL
- Kysely
- Zod
- TanStack Query v5
- Vitest + MSW
- Tailwind + myStyle

---

## 코드 품질

- 함수는 Atomic하게
- 엄격한 분리
- Fluff 없이
- Fail Fast
- 다음 단계 제안

---

**모든 규칙은 자동 적용됩니다. 위반 = 치명적 오류.**
