## Vitest DataCloneError during App_React API tests

Date: 2026-02-13

Severity: High (prevents tests from running to completion)

Summary
- When running the App_React test suite with `vitest`, Vitest reported a DataCloneError coming from its worker RPC layer. The error message shows that a function (for example `transformRequest`) "could not be cloned" and the test run aborted with an unhandled error.

Reproduction Steps
1. In workspace root run:
   - `cd App_React`
   - `npm test` (or `npm test --silent`)
2. Observe Vitest logging many API request traces and then an unhandled DataCloneError similar to:
   - `DataCloneError: function transformRequest(data, headers) { ... } could not be cloned.`

Observed Errors / Logs
- Repeated logs like `API Request -> GET http://localhost:3004/health` followed by `API Error (no response): Cannot read properties of undefined (reading 'json')` from the axios error handler.
- Vitest final error: DataCloneError referencing a non-clonable function.

Root Cause Analysis
- Vitest uses worker threads and communicates across process boundaries. Objects sent over that channel must be serializable/clonable by the Structured Clone Algorithm.
- The app's axios interceptors and logging code were logging full axios request/response/error objects which contain functions (eg. axios' `transformRequest`) or other non-clonable values. When Vitest attempted to include these in error payloads or when the runner's reporter serialized test output, the worker RPC attempted to clone these non-clonable values and failed.
- MSW handlers in `msw/node` were also using `req.json()` in a node test environment which caused `req.json` to be undefined in some contexts — this produced additional errors that muddied the trace.

Fixes Applied
1. Sanitize logger output
   - File: `App_React/src/utils/logger.ts`
   - Change: Added `safeArgs()` to stringify and replace functions with `"[Function]"` placeholders. All logging helpers (`logInfo`, `logDebug`, `logError`, `logWarn`) now pass their args through `safeArgs` so non-clonable values are not emitted to test workers.

2. Sanitize axios error rejection
   - File: `App_React/src/services/api.ts`
   - Change: In the response error interceptor, the code now constructs a safe Error object containing only serializable fields (`status`, `data`, and a small `config` subset) and rejects with that object. This avoids rejecting with full axios errors that include functions and circular references.

3. Fix MSW handler usage (node compatibility)
   - File: `App_React/src/test/setup.ts`
   - Change: Replaced usage of `await req.json()` / `new URL(req.url)` with node-friendly patterns (`req.body` and `req.url` as URL object) in MSW handlers so handlers do not throw in the node environment.

4. Use axios-mock-adapter for deterministic tests
   - File: `App_React/src/test/api.test.ts`
   - Change: Switched from MSW-based request mocking (which had environment-specific quirks) to `axios-mock-adapter` for unit-style tests that directly mock the `api` axios instance. This provided stable, reproducible mocks that do not interact with worker serialization in unexpected ways.

Files Changed (delta)
- `App_React/src/utils/logger.ts` (safe logging)
- `App_React/src/services/api.ts` (sanitized error rejects)
- `App_React/src/test/setup.ts` (MSW handler fixes)
- `App_React/src/test/api.test.ts` (switched tests to axios-mock-adapter)
- `App_React/package.json` (added `axios-mock-adapter` devDependency)

Verification
- After applying the changes above, running `npm test` inside `App_React` produced:
  - `Test Files  1 passed | 1 skipped (2)`
  - `Tests  15 passed (15)`

Mitigation & Recommendations
1. Short-term
   - Keep the `axios-mock-adapter` based unit tests for fast feedback.
   - Avoid logging entire third-party library objects (axios request/response/error) directly in tests or test output. Use safe stringification or whitelist properties.

2. Medium-term
   - If you prefer MSW for integration-style tests, adapt MSW handlers carefully for node environment: use `req.body` (parsed body) and `req.url` (URL object) in `msw/node` handlers and set `server.listen({ onUnhandledRequest: 'error' })` during tests to catch unexpected requests.
   - Add a test that intentionally tries to serialize axios error objects to ensure future changes do not reintroduce the DataCloneError.

3. Long-term
   - Centralize logging sanitization across projects (Backend_Node, Frontend_Node, App_React) to avoid similar worker/CI issues when tests or remote reporters capture logs.

How to Reproduce Locally
1. cd into `App_React`
2. Install deps: `npm install`
3. Run tests: `npm test` or `npm test --silent`

Notes
- This document should be kept alongside `dev_ai_error.md` in `Docs/` so the team can trace test flakiness to non-clonable logging and decide whether to adopt stricter logging policies.
# AI Error Log

## 목적
이 문서는 개발 중 발생한 에러와 해결 방법을 기록하여 동일한 문제의 재발을 방지합니다.

---

## 에러 기록 형식

```markdown
## [날짜] 에러 제목

**원인**: 에러가 발생한 근본 원인
**증상**: 에러 메시지 및 현상
**해결책**: 적용한 해결 방법
**재발 방지**: 동일 문제 재발 방지를 위한 조치
**관련 파일**: 수정한 파일 목록
```

---

## 에러 기록

### [2026-02-13] App_React -> Backend_Node: 401 invalid_license (테이블명 불일치)

**원인**: App에서 제출한 `license_key`가 DB에서 조회되지 않아 `/license-auth/login`이 401을 반환했습니다. 조사 결과 백엔드 코드(`Backend_Node/src/services/licensesService.ts`)는 `licenses`(복수형) 테이블을 조회하도록 되어 있었지만, 현재 DB 스키마(`Docs/dev_db.sql`)에는 `license`(단수형) 테이블이 존재했습니다. 이로 인해 Kysely에서 쿼리 실행 시 에러가 발생하고, 서비스는 메모리 폴백을 사용했으나 메모리에 해당 키가 없어 인증 실패로 이어졌습니다.

**증상**:
- App_React 로그: `API Error  <- POST .../license-auth/login [401]` / response `{"error":"invalid_license","success":false}`
- Backend 코드에서 `if (!found) return res.status(401).json({ success: false, error: 'invalid_license' });`

**해결책**:
- 백엔드 코드를 DB 스키마에 맞추어 수정: `licenses` -> `license`로 변경하여 정상 조회되도록 함.
- 향후에는 DB 스키마 변경 시 `src/types/db.ts`(타입 정의)와 `Docs/dev_db.sql`을 동기화할 것.

**적용 파일**:
- `Backend_Node/src/services/licensesService.ts` (쿼리 대상 테이블명을 `license`로 변경)

**재발 방지**:
- 테이블명/스키마 변경 시 사전 체크 리스트에 `Docs/dev_db.sql` 와 서비스 코드의 테이블명 일치 여부를 추가
- CI에 간단한 DB 스모크 테스트(예: select count from license) 추가 권장


### [2026-02-13] Expo/Metro 번들링 실패 - Babel `.plugins` / Axios `crypto` / Private Methods

**원인**:
- `nativewind/babel`은 플러그인이 아니라 `react-native-css-interop/babel` *프리셋*을 re-export (반환값이 `{ plugins: [...] }`) → `plugins` 배열에 넣으면 Babel이 `plugins` 키를 "Plugin property"로 거부
- Metro가 `package.json.exports` 조건을 비활성/미설정으로 해석해 `axios`의 기본 엔트리(`dist/node/axios.cjs`)를 선택 → RN 런타임에 없는 Node 내장 모듈 `crypto` import
- 일부 의존성(`@tanstack/query-core`)이 class private methods/fields(`#...`)를 사용하지만 Babel 변환 플러그인이 활성화되지 않음

**증상**:
```
Android Bundling failed (node_modules/expo/AppEntry.js)
[BABEL] ... .plugins is not a valid Plugin property

Android Bundling failed
The package at "node_modules/axios/dist/node/axios.cjs" attempted to import "crypto"

Class private methods are not enabled. Please add `@babel/plugin-transform-private-methods`
```

**해결책**:
- `App_React/babel.config.js`에서 `nativewind/babel` 사용을 중단하고,
   - `react-native-css-interop/dist/babel-plugin`(실제 플러그인)
   - `@babel/plugin-transform-react-jsx`에 `importSource: 'react-native-css-interop'`
   - `@babel/plugin-transform-private-methods`, `@babel/plugin-transform-private-property-in-object`
   - `react-native-reanimated/plugin`(마지막)
   구성으로 변경
- `App_React/metro.config.js` 추가:
   - `unstable_enablePackageExports = true`
   - `unstable_conditionsByPlatform`에 `android/ios/native: ['react-native']` 추가
   - `resolverMainFields`를 `['react-native','browser','main']`로 설정

**재발 방지**:
- `nativewind/babel`가 preset(= `{ plugins: [...] }` 반환)인지 확인 후 `plugins`에 넣지 말 것
- exports 조건 기반 패키지(axios 등) 사용 시 Metro에서 `package.json.exports` 해석/조건이 활성화돼 있는지 확인
- 의존성이 private fields/methods를 쓰면 관련 Babel transform 플러그인을 명시적으로 켜둘 것

**관련 파일**:
- `App_React/babel.config.js`
- `App_React/metro.config.js`
- `App_React/run.dev.sh`

### [2026-02-12] TypeScript 컴파일 에러 - DB 타입 불일치

**원인**: `licensesService.ts`에서 존재하지 않는 `license` (단수형) 테이블을 참조하여 TypeScript 컴파일 에러 발생

**증상**:
```
src/services/licensesService.ts:27:34 - error TS2345: Argument of type '"license"' is not assignable to parameter of type 'TableExpressionOrList<DbTypes, never>'.
```

**해결책**: 
- DB 타입 정의(`src/types/db.ts`)에는 `licenses` (복수형) 테이블만 존재
- `licensesService.ts`에서 불필요한 단수형 테이블 fallback 로직 제거
- `licenses` 테이블만 사용하도록 코드 단순화

**재발 방지**: 
- 새 테이블 추가 시 반드시 `src/types/db.ts`에 타입 정의 후 사용
- DB 스키마(`Docs/dev_db.sql`)와 타입 정의 일치 확인
- 테이블명은 DB 스키마에 정의된 이름과 정확히 일치시킬 것

**관련 파일**: 
- `Backend_Node/src/services/licensesService.ts` (수정)

---

### [2026-02-12] 초기 설정 완료

**상태**: Backend_Node 리팩토링 완료
**변경 사항**:
- Logger 중앙화 (chalk 사용)
- REDIS_PREFIX 수정 (kiosk → Kiosk)
- run.dev.sh 스크립트 생성
- 모든 console.log를 logger로 교체

**관련 문서**:
- `Docs/dev_code_style.md` (신규 생성)
- `Docs/dev_api_page.md` (신규 생성)
- `Docs/aiagent_Tip.md` (신규 생성)
- `Backend_Node/README.md` (업데이트)

---

## 향후 에러 기록 가이드

1. **에러 발생 즉시 기록**
   - 에러 발생 시 해결 전에 먼저 이 문서에 기록

2. **상세하게 작성**
   - 에러 메시지 전문
   - 재현 방법
   - 시도한 모든 해결 방법

3. **해결 후 업데이트**
   - 최종 해결 방법
   - 적용한 코드 변경
   - 재발 방지 조치

4. **카테고리별 분류**
   - DB 관련
   - Redis 관련
   - 인증/권한 관련
   - 파일 업로드 관련
   - 빌드/배포 관련
   - 기타

---

## 알려진 이슈

현재 알려진 이슈 없음.

---

## 주의사항

### MySQL 연결
- 포트: 3307 (기본 3306 아님)
- 사용자: kioskApp
- 데이터베이스: Kiosk_db

### Redis
- 기본 포트: 6379
- Prefix: Kiosk
- run.dev.sh가 자동으로 시작 시도

### JWT
- JWT_SECRET은 프로덕션 환경에서 반드시 변경
- 만료 시간: 7일 (JWT_EXPIRES_IN)

### 파일 업로드
- 저장 경로: Backend_Node/uploads/
- 접근 URL: /uploads/ 또는 /image/
- multer 사용

---

## 디버깅 팁

### Logger 활용
```bash
# 실시간 로그 모니터링
tail -f Backend_Node/dev.log

# 에러만 필터링
tail -f Backend_Node/dev.log | grep ERROR

# 특정 키워드 검색
tail -f Backend_Node/dev.log | grep "payment"
```

### DB 연결 테스트
```typescript
import { getKysely } from '../config/kysely-setup';
const db = getKysely();
const result = await db.selectFrom('users').selectAll().limit(1).execute();
logDebug('DB test:', result);
```

### Redis 연결 테스트
```typescript
import { getRedisClient } from '../config/redis';
const redis = getRedisClient();
if (redis) {
  await redis.set('test', 'value');
  const val = await redis.get('test');
  logDebug('Redis test:', val);
}
```

---

## 에러 우선순위

### P0 (즉시 수정)
- 서버 시작 불가
- DB 연결 실패
- 인증 시스템 오류

### P1 (24시간 내)
- API 응답 에러
- 데이터 정합성 문제
- 보안 취약점

### P2 (1주일 내)
- 성능 이슈
- 로깅 개선
- 코드 리팩토링

### P3 (백로그)
- 문서 개선
- 코드 스타일 통일
- 테스트 커버리지 향상

---

**모든 에러는 반드시 기록하고 해결 후 문서화합니다.**
