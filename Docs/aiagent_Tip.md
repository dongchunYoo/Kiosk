# AI Agent Tips for Backend_Node

## 프로젝트 개요
- **프레임워크**: Express (TypeScript)
- **ORM**: Kysely
- **인증**: JWT
- **DB**: MySQL
- **Redis**: ioredis
- **파일 업로드**: multer

---

## 새 프로젝트 자동 생성 (Scaffold)

이 레포는 3개 프로젝트 기본 셋업을 재사용하기 위한 **스캐폴드 소스**입니다.

### 생성 스크립트
- 스크립트: `scripts/scaffold.sh`
- 실행 예시:

```bash
./scripts/scaffold.sh /absolute/path/to/<NewProjectRoot>
```

### 생성되는 폴더
- `Backend_Node/`
- `Frontend_Node/`
- `App_React/`
- `Docs/`

### 필수 규칙 (.env)
- 각 프로젝트의 `.env`는 **생성되지만 값은 비어있을 수 있음**
- `PORT`는 **반드시 사용자가 `.env`에 수동으로 입력** (누락/빈값이면 `run.dev.sh`가 STOP)
- Android emulator에서 Backend URL은 반드시 `http://10.0.2.2:<PORT>` 사용 (`localhost` 금지)

### 실행
각 프로젝트 폴더에서:

```bash
./run.dev.sh
```

모든 `run.dev.sh`는 `dev.log`에 로그를 기록하며, 기본적으로 `tail -f dev.log`로 모니터링합니다.

---

## 디렉토리 구조

```
Backend_Node/
├── src/
│   ├── index.ts           # 앱 진입점
│   ├── server.ts          # Express 서버 설정
│   ├── config/            # 설정 파일 (DB, Redis, Kysely)
│   ├── controllers/       # 요청 핸들러
│   ├── routes/            # API 라우트
│   ├── services/          # 비즈니스 로직
│   ├── middleware/        # 인증, 에러 핸들링 등
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 (logger, dbHelpers 등)
├── test/                  # Vitest 테스트
├── uploads/               # 업로드된 파일
├── .env                   # 환경 변수
├── package.json
├── tsconfig.json
└── run.dev.sh            # 개발 실행 스크립트
```

---

## 핵심 규칙

### 1. Logger 사용 (필수)
직접 `console.log` 사용 금지. 반드시 `src/utils/logger.ts` 사용:

```typescript
import { logInfo, logDebug, logError } from '../utils/logger';

logInfo('Server started');
logDebug('Query result:', data);
logError('Database error', err);
```

**포맷**: `[Backend][LEVEL][HH:MM:SS] message`
- INFO: 파란색
- DEBUG: 초록색
- ERROR: 빨간색

---

### 2. PORT 규칙
- PORT는 **반드시** `.env`에서 읽기
- 하드코딩 절대 금지
- `.env`에 PORT 누락 시 → STOP

```typescript
const port = process.env.PORT || 3000; // ❌ 기본값 사용 지양
const port = process.env.PORT;         // ✅ .env 필수
if (!port) throw new Error('PORT not configured');
```

---

### 3. Redis 키 규칙
- Prefix는 **반드시** `.env`의 `REDIS_PREFIX` 사용
- 현재 값: `Kiosk`
- 키 포맷: `${REDIS_PREFIX}:<domain>:<key>`

```typescript
// ❌ 하드코딩
const key = 'kiosk:session:123';

// ✅ 환경변수 사용
const prefix = process.env.REDIS_PREFIX || 'Kiosk';
const key = `${prefix}:session:123`;
```

---

### 4. DB 쿼리 (Kysely)
- 모든 SELECT는 `SELECT *` 사용 (특정 컬럼 선택 금지)
- `getKysely()`로 인스턴스 가져오기

```typescript
import { getKysely } from '../config/kysely-setup';

const db = getKysely();
const users = await db
  .selectFrom('users')
  .select(['id', 'username', 'email']) // ❌ 특정 컬럼
  .execute();

const users = await db
  .selectFrom('users')
  .selectAll() // ✅ SELECT *
  .execute();
```

---

### 5. 에러 처리
모든 에러는 `dev_ai_error.md`에 먼저 기록:

```markdown
## [2026-02-12] DB Connection Timeout

**원인**: MySQL max_connections 초과
**해결책**: Connection pool 크기 조정
**재발 방지**: 모니터링 알람 추가
```

---

### 6. 파일 추가 규칙

#### Import 추가
- 파일 **최상단**에만 추가
- 기존 import 삭제/이동 금지 (리팩토링 제외)
- 순서:
  1. Node 내장
  2. 외부 라이브러리
  3. 내부 모듈 (절대 경로)
  4. 상대 경로

```typescript
// ✅ 올바른 순서
import fs from 'fs';                        // Node 내장
import express from 'express';              // 외부
import { getKysely } from '../config/kysely-setup'; // 내부
import { logInfo } from './logger';         // 상대
```

#### Function 추가
- 파일 **하단**에만 추가
- 기존 함수 위치 이동 금지 (리팩토링 제외)

---

### 7. 개발 순서 (필수)
1. DB 리뷰 (`dev_db.sql` 확인)
2. API 정의 (`dev_api_page.md` 업데이트)
3. State 정의 (TypeScript 타입)
4. UI 구현 (해당 없음 - Backend)

---

### 8. 실행 스크립트 (`run.dev.sh`)

실행 순서:
1. Clean (node_modules, dist, dev.log 삭제)
2. Install (`npm install`)
3. Build (`npm run build`)
4. Redis 체크 및 시작
5. Run (`npm run dev`)
6. Log (`dev.log`에 기록)

```bash
./run.dev.sh
# 또는
npm run dev  # 직접 실행 (Redis 수동 시작 필요)
```

---

## 자주 하는 실수

### ❌ 직접 console.log 사용
```typescript
console.log('User created'); // ❌
```

### ✅ logger 사용
```typescript
import { logInfo } from '../utils/logger';
logInfo('User created'); // ✅
```

---

### ❌ PORT 하드코딩
```typescript
app.listen(3000); // ❌
```

### ✅ .env에서 읽기
```typescript
const port = process.env.PORT;
if (!port) throw new Error('PORT not configured');
app.listen(port); // ✅
```

---

### ❌ Redis prefix 하드코딩
```typescript
const key = 'kiosk:session:123'; // ❌
```

### ✅ 환경변수 사용
```typescript
const prefix = process.env.REDIS_PREFIX || 'Kiosk';
const key = `${prefix}:session:123`; // ✅
```

---

### ❌ 특정 컬럼만 SELECT
```typescript
db.selectFrom('users').select(['id', 'name']); // ❌
```

### ✅ SELECT *
```typescript
db.selectFrom('users').selectAll(); // ✅
```

---

## 테스트

### Vitest 실행
```bash
npm test
```

### 테스트 파일 위치
- `test/*.test.ts`

### 테스트 작성 규칙
- MSW로 외부 API 모킹
- Kysely는 실제 DB 또는 메모리 DB 사용
- 각 테스트는 독립적으로 실행 가능해야 함

---

## 문서 동기화 (필수)

다음 변경 시 **반드시** 문서 업데이트:

### API 변경
→ `Docs/dev_api_page.md` 업데이트

### DB 스키마 변경
→ `Docs/dev_db.sql` 업데이트

### 에러 발생
→ `Docs/dev_ai_error.md` 업데이트

### 코드 스타일 변경
→ `Docs/dev_code_style.md` 업데이트

### Redis 구조 변경
→ `Docs/dev_api_page.md` 및 `dev_code_style.md` 업데이트

**문서 미업데이트 = 작업 미완료**

---

## 환경 변수 (.env)

필수 변수:
```env
PORT=3004                          # 필수
BIND_HOST=0.0.0.0

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=kioskApp
MYSQL_PASSWORD=Djfudnsrj1!
MYSQL_DATABASE=Kiosk_db

JWT_SECRET=change_this_to_a_strong_secret
JWT_EXPIRES_IN=7d

UPLOADS_DIR=uploads

DEBUG=false

REDIS_PREFIX=Kiosk                 # 필수
```

---

## Kysely 타입

DB 타입은 `src/types/db.ts`에 정의:

```typescript
export interface DbTypes {
  users: UserTable;
  stores: StoreTable;
  products: ProductTable;
  // ...
}
```

새 테이블 추가 시 타입도 함께 추가 필요.

---

## 미들웨어

### verifyJwt
JWT 토큰 검증. 보호된 라우트에 사용:

```typescript
import { verifyJwt } from '../middleware/auth';

router.get('/protected', verifyJwt, handler);
```

### isSuperAdmin
SuperAdmin 권한 검증:

```typescript
router.delete('/users/:id', verifyJwt, isSuperAdmin, handler);
```

---

## 파일 업로드

multer 사용:

```typescript
import { upload } from '../middleware/upload';

router.post('/upload', upload.single('image'), handler);
```

업로드 경로:
- 저장: `Backend_Node/uploads/`
- 접근: `/uploads/` 또는 `/image/`

---

## Redis 사용

```typescript
import { getRedisClient } from '../config/redis';

const redis = getRedisClient(); // 기본 클라이언트
if (!redis) {
  logError('Redis not available');
  return;
}

await redis.set('key', 'value');
const value = await redis.get('key');
```

키 prefix는 자동 적용됨: `Kiosk:key`

---

## 코드 품질 체크리스트

- [ ] Logger 사용 (console.log 금지)
- [ ] PORT는 .env에서 읽기
- [ ] Redis prefix는 환경변수 사용
- [ ] SELECT * 사용
- [ ] Import는 파일 상단에만
- [ ] Function은 파일 하단에만
- [ ] 문서 업데이트 (dev_api_page.md, dev_db.sql 등)
- [ ] 에러는 dev_ai_error.md에 기록
- [ ] TypeScript 에러 없음
- [ ] 테스트 통과

---

## 다음 단계 제안

작업 완료 후 항상 다음 단계를 제안:

1. 관련 테스트 작성/업데이트
2. API 문서 업데이트
3. 프론트엔드 연동 필요 여부
4. 성능 최적화 가능 여부
5. 보안 검토 필요 여부

---

## 빠른 참조

**로거 import:**
```typescript
import { logInfo, logDebug, logError } from '../utils/logger';
```

**Kysely import:**
```typescript
import { getKysely } from '../config/kysely-setup';
```

**Redis import:**
```typescript
import { getRedisClient } from '../config/redis';
```

**미들웨어 import:**
```typescript
import { verifyJwt, isSuperAdmin } from '../middleware/auth';
```

---

## Frontend_Node Tips

### 프로젝트 개요
- **프레임워크**: React + Vite
- **라우팅**: React Router DOM
- **HTTP**: Axios
- **차트**: Chart.js
- **DnD**: @dnd-kit

---

### 디렉토리 구조

```
Frontend_Node/
├── src/
│   ├── main.jsx           # 앱 진입점
│   ├── App.jsx            # 라우트 정의
│   ├── pages/             # 페이지 컴포넌트
│   ├── components/        # 재사용 컴포넌트
│   ├── services/          # API 클라이언트
│   ├── utils/             # 유틸리티 (logger 등)
│   └── assets/            # 정적 파일
├── public/                # 공개 정적 파일
├── .env                   # 환경 변수
├── vite.config.js         # Vite 설정
├── package.json
└── run.dev.sh            # 개발 실행 스크립트
```

---

### 핵심 규칙

#### 1. Logger 사용 (필수)
직접 `console.log` 사용 금지. 반드시 `src/utils/logger.js` 사용:

```javascript
import { logInfo, logDebug, logError, logWarn } from '../utils/logger';

logInfo('Component mounted');
logDebug('API response:', data);
logError('API error', error);
logWarn('Deprecated feature used');
```

**포맷**: `[Frontend][LEVEL][HH:MM:SS] message`
- **색상 없음** (브라우저 console 기본 스타일)
- 외부 라이브러리 사용 안함

---

#### 2. PORT 규칙
- PORT는 **반드시** `.env`에서 읽기
- Vite는 `PORT` 환경변수 사용
- Backend URL은 `VITE_BACKEND_IP` 사용

```env
PORT=3005
VITE_BACKEND_IP=http://localhost:3004
```

---

#### 3. 환경 변수 규칙
- Vite 환경변수는 `VITE_` prefix 필수
- 런타임 접근: `import.meta.env.VITE_변수명`

```javascript
const backendUrl = import.meta.env.VITE_BACKEND_IP;
const imgPath = import.meta.env.VITE_IMG_PATH;
```

---

#### 4. API 호출
- `src/services/api.js`의 apiClient 사용
- JWT 토큰 자동 주입
- 에러 처리는 logger 사용

```javascript
import apiClient from '../services/api';
import { logError } from '../utils/logger';

try {
  const response = await apiClient.get('/api/products');
  // 처리
} catch (error) {
  logError('Failed to fetch products', error);
}
```

---

#### 5. 파일 추가 규칙

##### Import 추가
- 파일 **최상단**에만 추가
- 순서:
  1. React/외부 라이브러리
  2. 컴포넌트 (절대 경로)
  3. 서비스/유틸
  4. 스타일

```javascript
// ✅ 올바른 순서
import React, { useState } from 'react';
import ProductList from '../components/ProductManagement/ProductList';
import apiClient from '../services/api';
import { logError } from '../utils/logger';
import './ProductsPage.css';
```

##### Component 추가
- 함수형 컴포넌트 사용
- 파일 하단에 export

---

#### 6. 이미지 처리
Backend 이미지 URL 구성:

```javascript
const imgPath = import.meta.env.VITE_IMG_PATH; // '/image/'
const backendUrl = import.meta.env.VITE_BACKEND_IP;
const fullUrl = `${backendUrl}${imgPath}${product.image_url}`;
```

---

#### 7. 인증 처리
JWT 토큰은 localStorage에 저장:

```javascript
// 로그인 후
localStorage.setItem('token', token);

// 로그아웃
localStorage.removeItem('token');

// apiClient는 자동으로 헤더에 추가
```

---

#### 8. 실행 스크립트

```bash
./run.dev.sh
# 또는
PORT=3005 npm run dev
```

---

### 자주 하는 실수

#### ❌ 직접 console.log 사용
```javascript
console.log('Data loaded'); // ❌
```

#### ✅ logger 사용
```javascript
import { logInfo } from '../utils/logger';
logInfo('Data loaded'); // ✅
```

---

#### ❌ 환경변수 직접 하드코딩
```javascript
const apiUrl = 'http://localhost:3004'; // ❌
```

#### ✅ 환경변수 사용
```javascript
const apiUrl = import.meta.env.VITE_BACKEND_IP; // ✅
```

---

#### ❌ Vite 환경변수 prefix 누락
```env
BACKEND_IP=http://localhost:3004  # ❌
```

#### ✅ VITE_ prefix 사용
```env
VITE_BACKEND_IP=http://localhost:3004  # ✅
```

---

### 페이지 구조

모든 페이지는 다음 패턴 사용:

```javascript
import React, { useState } from 'react';
import { logError } from '../utils/logger';

const MyPage = () => {
  const [data, setData] = useState([]);
  const [refreshData, setRefreshData] = useState(false);

  // CRUD 핸들러
  const handleCreate = async (newData) => {
    try {
      await apiClient.post('/api/resource', newData);
      setRefreshData(prev => !prev);
    } catch (error) {
      logError('Failed to create', error);
    }
  };

  return (
    <div>
      {/* UI */}
    </div>
  );
};

export default MyPage;
```

---

### 모달 패턴

```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
const [currentItem, setCurrentItem] = useState(null);

const handleEdit = (item) => {
  setCurrentItem(item);
  setIsModalOpen(true);
};

const handleSave = async (id, data) => {
  try {
    await apiClient.put(`/api/resource/${id}`, data);
    setIsModalOpen(false);
    setRefreshData(prev => !prev);
  } catch (error) {
    logError('Failed to save', error);
  }
};
```

---

### 역할 기반 접근

```javascript
import { decodeToken } from '../utils/util';

const token = localStorage.getItem('token');
const claims = decodeToken(token);
const userRole = claims?.role; // 'A', 'S', 'U'

if (userRole === 'A') {
  // Admin 전용
} else if (userRole === 'S') {
  // Store Manager
} else {
  // User
}
```

---

### 코드 품질 체크리스트

- [ ] Logger 사용 (console.log 금지)
- [ ] PORT는 .env에서 읽기
- [ ] Vite 환경변수는 VITE_ prefix
- [ ] Import는 파일 상단에만
- [ ] apiClient 사용 (fetch 직접 사용 금지)
- [ ] 에러는 logger로 기록
- [ ] 모달 열기/닫기 상태 관리
- [ ] refreshData toggle 패턴 사용
- [ ] JSX 에러 없음

---

### 빠른 참조

**Logger import:**
```javascript
import { logInfo, logDebug, logError, logWarn } from '../utils/logger';
```

**API Client import:**
```javascript
import apiClient from '../services/api';
```

**환경변수 접근:**
```javascript
const value = import.meta.env.VITE_변수명;
```

**토큰 디코드:**
```javascript
import { decodeToken } from '../utils/util';
const claims = decodeToken(token);
```

---

## AI Agent Tips for App_React

### 프로젝트 개요
- **플랫폼**: React Native + Expo
- **언어**: TypeScript
- **스타일**: NativeWind (Tailwind CSS)
- **상태 관리**: Zustand, TanStack Query
- **스토리지**: AsyncStorage
- **API**: Axios

---

### 디렉토리 구조

```
App_React/
├── App.tsx               # 앱 진입점
├── src/
│   ├── screens/          # 화면 컴포넌트
│   │   ├── LoadingScreen.tsx
│   │   ├── LicenseRegisterScreen.tsx
│   │   └── MainScreen.tsx
│   ├── services/         # API 서비스
│   │   └── api.ts
│   ├── utils/            # 유틸리티
│   │   ├── logger.ts     # 중앙화된 로거
│   │   ├── storage.ts    # AsyncStorage wrapper
│   │   └── format.ts     # 포맷팅 함수
│   ├── types/            # TypeScript 타입
│   ├── config/           # 설정 (상수)
│   └── test/             # 테스트
├── .env                  # 환경 변수
├── package.json
├── app.json              # Expo 설정
├── tsconfig.json
└── run.dev.sh           # 개발 실행 스크립트
```

---

### 핵심 규칙

#### 1. Logger 사용 (필수)
직접 `console.log` 사용 금지. 반드시 `src/utils/logger.ts` 사용:

```typescript
import { logInfo, logDebug, logError } from '@/utils/logger';

logInfo('App initialized');
logDebug('License key:', licenseKey);
logError('API error', error);
```

**포맷**: `[App][LEVEL][HH:MM:SS] message`
- INFO: 파란색 (chalk.blue)
- DEBUG: 초록색 (chalk.green)
- ERROR: 빨간색 (chalk.red)
- WARN: 노란색 (chalk.yellow)

---

#### 2. 환경 변수 규칙
- Expo는 `EXPO_PUBLIC_` prefix 필수
- `.env`에 정의, `import.meta.env` 또는 `process.env`로 접근 안 됨
- Expo Config에서 `process.env.EXPO_PUBLIC_XXX` 사용

```typescript
// ❌ 직접 접근 불가
const url = process.env.EXPO_PUBLIC_BACKEND_URL;

// ✅ 환경 변수 사용
import Constants from 'expo-constants';
const url = Constants.expoConfig?.extra?.backendUrl;

// 또는 .env 파일에 직접 정의하고 babel plugin 사용
const url = process.env.EXPO_PUBLIC_BACKEND_URL;
```

**현재 환경변수:**
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.219.103:3004
```

---

#### 3. Android 에뮬레이터 URL
- 호스트 머신 localhost: `10.0.2.2`
- Backend URL 예시: `http://10.0.2.2:3004`

```typescript
// ❌ localhost는 에뮬레이터 자신을 가리킴
const url = 'http://localhost:3004';

// ✅ 호스트 머신 접근
const url = 'http://10.0.2.2:3004';
```

---

#### 4. 이미지 URL 처리
- Backend에서 상대 경로 반환: `/image/products/xxx.jpg`
- 프론트엔드에서 절대 경로 생성

```typescript
import { normalizeImageUrl } from '@/utils/format';

// Backend URL + 상대 경로
const fullUrl = normalizeImageUrl(product.image_url);
// 결과: http://10.0.2.2:3004/image/products/xxx.jpg
```

---

#### 5. AsyncStorage 사용
직접 AsyncStorage 호출 금지, `src/utils/storage.ts` wrapper 사용:

```typescript
import { storage } from '@/utils/storage';

// ✅ Wrapper 사용
await storage.setToken(jwtToken);
const token = await storage.getToken();

// ❌ 직접 호출 금지
await AsyncStorage.setItem('token', jwtToken);
```

**제공 메서드:**
- `getToken()` / `setToken(token)` / `removeToken()`
- `getLicenseKey()` / `setLicenseKey(key)`
- `getStoreData()` / `setStoreData(data)`

---

#### 6. 화면 흐름
1. **LoadingScreen** (초기 진입)
   - 라이선스 키 확인
   - JWT 토큰 확인
   - 스토어 데이터 패치
   
2. **LicenseRegisterScreen** (라이선스 없을 때)
   - 라이선스 키 입력 및 검증
   - AsyncStorage에 저장
   
3. **MainScreen** (정상 실행)
   - 카테고리 + 상품 표시
   - 장바구니 기능
   - 옵션 선택 모달
   - 대기 화면 (IDLE_TIMEOUT)

---

#### 7. NativeWind (Tailwind CSS)
- className prop 사용
- 스타일 우선순위: Tailwind > inline style

```tsx
// ✅ NativeWind 사용
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-gray-800">제목</Text>
</View>

// ❌ StyleSheet 사용 지양 (필요시에만)
<View style={styles.container}>
```

---

#### 8. API 호출
- `src/services/api.ts`의 `apiService` 사용
- 에러 처리 필수

```typescript
import { apiService } from '@/services/api';

try {
  const data = await apiService.getAppData(licenseKey);
  // 성공 처리
} catch (error) {
  logError('Failed to fetch app data', error);
  Alert.alert('오류', '데이터를 불러올 수 없습니다');
}
```

**제공 메서드:**
- `checkLicense(licenseKey)` - 라이선스 검증
- `getAppData(licenseKey)` - 앱 데이터 조회

---

#### 9. TypeScript 타입
- `src/types/index.ts`에 정의
- any 타입 사용 금지

```typescript
// ✅ 타입 정의 사용
interface AppDataResponse {
  store: Store;
  categories: Category[];
  products: Product[];
}

// ❌ any 사용 금지
const data: any = await fetchData();
```

---

#### 10. 실행 스크립트 (`run.dev.sh`)

실행 순서:
1. Clean (.expo, dist, node_modules/.cache 삭제)
2. Install (`npm install`)
3. Run (`expo start --clear`)
4. Log (`dev.log`에 기록)

```bash
./run.dev.sh
# 또는
npm run dev  # expo start -c
```

---

### 자주 하는 실수

#### ❌ 직접 console.log 사용
```typescript
console.error('API error:', error); // ❌
```

#### ✅ logger 사용
```typescript
import { logError } from '@/utils/logger';
logError('API error:', error); // ✅
```

---

#### ❌ 환경변수 prefix 누락
```env
BACKEND_URL=http://localhost:3004 # ❌
```

#### ✅ EXPO_PUBLIC_ prefix 사용
```env
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3004 # ✅
```

---

#### ❌ localhost 사용 (Android)
```typescript
const url = 'http://localhost:3004'; // ❌ 에뮬레이터 자신
```

#### ✅ 10.0.2.2 사용
```typescript
const url = 'http://10.0.2.2:3004'; // ✅ 호스트 머신
```

---

#### ❌ 직접 AsyncStorage 호출
```typescript
await AsyncStorage.setItem('token', token); // ❌
```

#### ✅ storage wrapper 사용
```typescript
await storage.setToken(token); // ✅
```

---

### Quick Reference

**Logger import:**
```typescript
import { logInfo, logDebug, logError, logWarn } from '@/utils/logger';
```

**Storage import:**
```typescript
import { storage } from '@/utils/storage';
```

**API Service import:**
```typescript
import { apiService } from '@/services/api';
```

**Format utils import:**
```typescript
import { formatPrice, formatTime, normalizeImageUrl } from '@/utils/format';
```

**환경변수 접근 (Expo):**
```typescript
const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
```

---

**모든 규칙 위반 = 치명적 오류**
