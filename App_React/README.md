# App_React (모바일 키오스크 애플리케이션)

Kiosk 프로젝트의 모바일 키오스크 애플리케이션입니다. React Native + Expo 기반으로 구축되었습니다.

## 기술 스택

- **React Native** 0.73.6
- **Expo** 50.0.0
- **TypeScript** 5.3.0
- **TanStack Query** 5.90.19
- **Axios** 1.6.0
- **NativeWind** 4.2.1 (Tailwind CSS)
- **Zustand** 4.4.0
- **AsyncStorage** 1.21.0

## Quick Start

### run.dev.sh 사용 (권장)

```bash
./run.dev.sh
```

스크립트가 자동으로:
1. Clean (이전 빌드 정리)
2. Install (의존성 설치)
3. Run (Expo dev 서버 시작)
4. Log (dev.log 파일에 기록)

### 수동 실행

```bash
npm install
expo start --clear
```

## 환경 설정

### 필수 .env 변수

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.219.103:3004
```

**주의사항:**
- Expo 환경변수는 반드시 `EXPO_PUBLIC_` prefix 필요
- Android 에뮬레이터에서는 `10.0.2.2` 사용 (localhost 대신)

## 프로젝트 구조

```
App_React/
├── App.tsx                 # 앱 진입점
├── src/
│   ├── screens/            # 화면 컴포넌트
│   │   ├── LoadingScreen.tsx
│   │   ├── LicenseRegisterScreen.tsx
│   │   └── MainScreen.tsx
│   ├── services/           # API 서비스
│   │   └── api.ts
│   ├── utils/              # 유틸리티
│   │   ├── logger.ts       # 중앙화된 로거
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   └── format.ts       # 포맷팅 함수
│   ├── types/              # TypeScript 타입
│   │   └── index.ts
│   ├── config/             # 설정
│   │   └── constants.ts
│   └── test/               # 테스트
├── .env                    # 환경 변수
├── package.json
├── app.json                # Expo 설정
├── tsconfig.json
└── run.dev.sh             # 개발 실행 스크립트
```

## 주요 기능

### 1. 라이선스 관리
- 라이선스 키 등록 및 검증
- AsyncStorage에 라이선스 키 저장
- JWT 토큰 기반 인증

### 2. 화면 흐름

#### LoadingScreen (초기 화면)
- 앱 시작 시 라이선스 키 및 JWT 토큰 확인
- 스토어 데이터 패치
- 2초 로딩 시뮬레이션

#### LicenseRegisterScreen (라이선스 미등록)
- 라이선스 키 입력
- 서버 검증
- 검증 성공 시 LoadingScreen으로 재진입

#### MainScreen (메인 화면)
- 카테고리별 상품 표시
- 장바구니 기능
- 상품 옵션 선택 모달
- 대기 화면 (IDLE_TIMEOUT: 60초)

### 3. 상품 관리
- 카테고리별 상품 그리드
- 상품 이미지 표시
- 상품 옵션 선택
- 장바구니 추가/삭제
- 수량 조절

### 4. 대기 화면
- 60초 비활성 시 자동 대기 화면
- 터치로 메인 화면 복귀
- 장바구니 초기화

## Logging

- 모든 로그는 중앙화된 logger 사용: `src/utils/logger.ts`
- 포맷: `[App][LEVEL][HH:MM:SS] message`
- 레벨: INFO (Blue), DEBUG (Green), ERROR (Red), WARN (Yellow)
- 로그 모니터링: `tail -f dev.log`

```typescript
import { logInfo, logDebug, logError } from '@/utils/logger';

logInfo('App initialized');
logDebug('License key:', licenseKey);
logError('API error', error);
```

## API 연동

### API Service 사용

```typescript
import { apiService } from '@/services/api';

// 라이선스 검증
const result = await apiService.checkLicense(licenseKey);

// 앱 데이터 조회
const data = await apiService.getAppData(licenseKey);
```

### Backend URL 설정
- 환경변수: `EXPO_PUBLIC_BACKEND_URL`
- Android 에뮬레이터: `http://10.0.2.2:3004`
- 실제 기기: `http://<IP>:3004`

## Storage 관리

### AsyncStorage Wrapper 사용

```typescript
import { storage } from '@/utils/storage';

// JWT 토큰
await storage.setToken(token);
const token = await storage.getToken();
await storage.removeToken();

// 라이선스 키
await storage.setLicenseKey(key);
const key = await storage.getLicenseKey();

// 스토어 데이터
await storage.setStoreData(JSON.stringify(data));
const data = await storage.getStoreData();
```

## 스타일링

### NativeWind (Tailwind CSS)

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-2xl font-bold text-gray-800">제목</Text>
</View>
```

**권장사항:**
- Tailwind CSS 클래스 우선 사용
- inline style은 필요시에만 사용

## 이미지 처리

### URL 정규화

```typescript
import { normalizeImageUrl } from '@/utils/format';

const fullUrl = normalizeImageUrl(product.image_url);
// 결과: http://10.0.2.2:3004/image/products/xxx.jpg
```

**이미지 경로 규칙:**
- Backend 상대 경로: `/image/products/...`
- 프론트엔드 절대 경로: `${BACKEND_URL}/image/products/...`

## 개발 가이드

### 새 화면 추가
1. `src/screens/`에 컴포넌트 생성
2. TypeScript 타입 정의 (`src/types/index.ts`)
3. API 연동 필요 시 `src/services/api.ts`에 함수 추가
4. Logger 사용

### 에러 처리 패턴

```typescript
try {
  const data = await apiService.getAppData(licenseKey);
  setData(data);
} catch (error) {
  logError('Failed to fetch data', error);
  Alert.alert('오류', '데이터를 불러올 수 없습니다');
}
```

## 빌드 및 배포

### 개발 빌드
```bash
npm run dev          # expo start -c
npm run dev:android  # Android 에뮬레이터
npm run dev:ios      # iOS 시뮬레이터
```

### 프로덕션 빌드
```bash
npm run real:android
npm run real:ios
```

### EAS Build
```bash
eas build --platform android
eas build --platform ios
```

## 문서

- **API 명세**: `Docs/dev_api_page.md`
- **화면 구조**: `Docs/dev_Screen_page.md`
- **개발 가이드**: `Docs/aiagent_Tip.md`
- **코드 스타일**: `Docs/dev_code_style.md`

## 주의사항

1. **환경변수**: 모든 Expo 환경변수는 `EXPO_PUBLIC_` prefix 필수
2. **Logger**: 직접 console.log 사용 금지
3. **Storage**: 직접 AsyncStorage 호출 금지, storage wrapper 사용
4. **API**: apiService 사용, fetch 직접 사용 금지
5. **Android URL**: localhost 대신 `10.0.2.2` 사용

## 트러블슈팅

### Backend 연결 실패
- `EXPO_PUBLIC_BACKEND_URL` 확인
- Android: `10.0.2.2` 사용 확인
- Backend_Node 서버 실행 상태 확인
- 네트워크 방화벽 설정 확인

### 이미지 로드 실패
- 이미지 URL 정규화 확인
- Backend 이미지 경로 확인 (`/image/products/`)
- CORS 설정 확인

### 빌드 에러
```bash
rm -rf .expo node_modules/.cache
npm install
expo start --clear
```
│   └── utils/           # 유틸리티 함수
│       ├── storage.ts   # AsyncStorage 래퍼
│       └── format.ts    # 포맷팅 함수
├── App.tsx              # 앱 진입점
├── babel.config.js      # Babel 설정 (NativeWind)
├── tailwind.config.js   # TailwindCSS 설정
└── package.json
```

## 환경 변수

`.env` 파일을 생성하여 다음 변수를 설정하세요:

```
EXPO_PUBLIC_BACKEND_URL=http://localhost:3004
```

## 설치 및 실행

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm start
```

### 플랫폼별 실행
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## API 연동

Backend_Node 서버와 연동됩니다. 주요 엔드포인트:

- `GET /health` - 헬스체크
- `POST /auth/login` - 로그인
- `GET /licenses/check` - 라이선스 확인
- `GET /appdata` - 스토어 데이터 조회

## 개발 가이드

### 새로운 화면 추가
1. `src/screens/` 에 화면 컴포넌트 생성
2. 필요한 타입을 `src/types/index.ts` 에 추가
3. API 함수를 `src/services/api.ts` 에 추가
4. `Docs/dev_Screen_page.md` 업데이트

### 스타일링
- NativeWind(TailwindCSS) 사용
- 클래스명은 `className` prop 사용
- 예: `className="flex-1 bg-white p-4"`

### 상태 관리
- TanStack Query를 사용한 서버 상태 관리
- AsyncStorage를 사용한 로컬 상태 저장

## Flutter 앱과의 차이점

| 기능 | Flutter | React Native |
|------|---------|--------------|
| 스타일링 | Custom Widget | NativeWind (TailwindCSS) |
| 상태관리 | Provider | TanStack Query |
| 로컬저장소 | SharedPreferences | AsyncStorage |
| 네비게이션 | Custom | React Navigation |
| HTTP | Custom ApiService | Axios |

## 빌드

### Android APK
```bash
eas build --platform android
```

### iOS IPA
```bash
eas build --platform ios
```

## 참고 문서

- [Docs/dev_Screen_page.md](../Docs/dev_Screen_page.md) - 화면 구조
- [Docs/dev_api_page.md](../Docs/dev_api_page.md) - API 명세
- [Docs/dev_ai_error.md](../Docs/dev_ai_error.md) - 에러 로그

## 라이선스

Copyright (c) 2026 - AI Kiosk Project
