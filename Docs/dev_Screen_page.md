# Screen & UI Documentation

## 목적
이 문서는 프론트엔드 화면 및 UI 구성 요소를 기록합니다.

---

## Frontend_Node (관리자 웹 인터페이스)

### 기술 스택
- React 18.3.1
- Vite 5.0.0
- React Router DOM 7.9.5
- Axios 1.13.1
- Chart.js 4.4.0
- DnD Kit (Drag and Drop)

### 화면 구조

#### 1. 로그인 화면 (LoginPage)
- **경로**: `/login`
- **컴포넌트**: `src/pages/LoginPage.jsx`
- **API**: `POST /api/auth/login`
- **기능**:
  - 사용자 인증
  - JWT 토큰 발급 및 저장
  - 역할 기반 리다이렉트

#### 2. 홈/대시보드 (HomePage)
- **경로**: `/`
- **컴포넌트**: `src/pages/HomePage.jsx`
- **API**:
  - `GET /api/admin/stats` - 통계
  - `GET /api/admin/rate-limit-status` - Rate Limit 상태
  - `GET /api/admin/receipts-per-minute` - 분당 영수증 수
  - `GET /api/admin/metrics/system` - 시스템 메트릭
  - `GET /api/admin/metrics/redis` - Redis 메트릭
  - `GET /api/admin/metrics/kafka` - Kafka 메트릭
  - `GET /api/admin/metrics/top-latency` - 최상위 레이턴시
  - `GET /api/admin/metrics/top-count` - 최상위 카운트
- **기능**:
  - 시스템 전반 통계 대시보드
  - Chart.js를 사용한 시각화
  - 실시간 메트릭 모니터링

#### 3. 스토어 관리 (StoresPage)
- **경로**: `/stores`
- **컴포넌트**: `src/pages/StoresPage.jsx`
- **주요 컴포넌트**:
  - `StoreList` - 스토어 목록
  - `EditStoreModal` - 스토어 편집 모달
  - `AddStoreModal` - 스토어 추가 모달
  - `AddGroupModal` - 그룹 추가 모달
- **API**:
  - `GET /api/stores` - 목록 조회
  - `GET /api/stores/:id` - 상세 조회
  - `POST /api/stores` - 생성
  - `PUT /api/stores/:id` - 수정
  - `GET /api/store-groups` - 그룹 목록
  - `POST /api/store-groups` - 그룹 생성
- **기능**:
  - 스토어 CRUD
  - 스토어 그룹 관리
  - 이미지 업로드
  - 역할별 필터링 (A/S/U)

#### 4. 상품 관리 (ProductsPage)
- **경로**: `/products`
- **컴포넌트**: `src/pages/ProductsPage.jsx`
- **주요 컴포넌트**:
  - `ProductList` - 상품 목록
  - `EditProductModal` - 상품 편집 모달
  - `AddProductModal` - 상품 추가 모달
  - `AddCategoryModal` - 카테고리 추가 모달
- **API**:
  - `GET /api/products` - 목록 조회
  - `POST /api/products` - 생성
  - `PUT /api/products/:id` - 수정
  - `DELETE /api/products/:id` - 삭제
  - `POST /api/products/upload/product` - 이미지 업로드
  - `POST /api/products/delete-image` - 이미지 삭제
  - `GET /api/categories` - 카테고리 목록
  - `POST /api/categories` - 카테고리 생성
  - `PUT /api/categories/:id` - 카테고리 수정
  - `DELETE /api/categories/:id` - 카테고리 삭제
- **기능**:
  - 상품 CRUD
  - 카테고리 관리
  - Drag & Drop으로 카테고리/상품 순서 변경
  - 이미지 업로드 및 프리뷰
  - 상품 옵션 관리

#### 5. 사용자 관리 (UsersPage)
- **경로**: `/users`
- **컴포넌트**: `src/pages/UsersPage.jsx`
- **주요 컴포넌트**:
  - `UserList` - 사용자 목록
  - `EditUserModal` - 사용자 편집 모달
- **API**:
  - `GET /api/users` - 목록 조회
  - `POST /api/users` - 생성
  - `PUT /api/users/:id` - 수정
  - `DELETE /api/users/:id` - 삭제
- **기능**:
  - 사용자 CRUD
  - 역할 관리 (A/S/U)
  - 스토어/그룹 할당

#### 6. 라이선스 관리 (LicensesPage)
- **경로**: `/licenses`
- **컴포넌트**: `src/pages/LicensesPage.jsx`
- **API**:
  - `GET /api/licenses` - 목록 조회
  - `POST /api/licenses` - 생성
  - `POST /api/licenses/check-key` - 키 검증
- **기능**:
  - 라이선스 키 관리
  - 라이선스 검증
  - 스토어별 라이선스 할당

#### 7. 매출 관리 (SalesPage)
- **경로**: `/sales`
- **컴포넌트**: `src/pages/SalesPage.jsx`
- **API**:
  - `GET /api/admin/receipts` - 영수증 목록
  - `GET /api/stores` - 스토어 목록
- **기능**:
  - 영수증 조회
  - 날짜별 필터링
  - 스토어별 필터링
  - 매출 통계

### 레이아웃 구조

#### DashboardLayout
- **컴포넌트**: `src/components/DashboardLayout.jsx`
- **기능**:
  - Sidebar 포함
  - 인증 체크
  - 라우팅 관리

#### Sidebar
- **컴포넌트**: `src/components/Sidebar.jsx`
- **메뉴 항목**:
  - 홈 (/)
  - 스토어 (/stores)
  - 상품 (/products)
  - 사용자 (/users)
  - 라이선스 (/licenses)
  - 매출 (/sales)

### 공통 기능

#### 인증 (Authentication)
- JWT 토큰 기반
- LocalStorage에 저장
- 자동 헤더 주입 (Axios Interceptor)
- 토큰 만료 시 자동 로그아웃

#### 역할 기반 접근 제어 (RBAC)
- **A (Admin)**: 전체 권한
- **S (Store Manager)**: 할당된 그룹의 스토어만
- **U (User)**: 모든 스토어 조회

#### 이미지 처리
- 업로드: multipart/form-data
- 프리뷰: Base64 또는 URL
- 삭제: 서버 API 호출

#### 에러 처리
- Logger를 통한 중앙화된 에러 로깅
- 사용자 친화적인 alert 메시지
- API 에러 응답 처리

---

## Backend_Node 관련 UI

Backend_Node는 API 서버이므로 직접적인 UI가 없습니다.

### 관련 프론트엔드 프로젝트
- **Frontend_Node**: 관리자 웹 인터페이스 (React + Vite)
- **App_React**: 모바일 앱 (React + Expo)

---

## API 엔드포인트와 UI 매핑

### 인증 화면
- **로그인**: `POST /api/auth/login`
- **회원가입**: `POST /api/auth/register`
- 관련 프론트엔드: Frontend_Node, App_React

---

### 관리자 대시보드
- **통계**: `GET /api/admin/stats`
- **영수증 목록**: `GET /api/admin/receipts`
- **시스템 메트릭**: `GET /api/admin/metrics/system`
- 관련 프론트엔드: Frontend_Node

---

### 스토어 관리
- **스토어 목록**: `GET /api/stores`
- **스토어 생성**: `POST /api/stores`
- **스토어 상세**: `GET /api/stores/:id`
- 관련 프론트엔드: Frontend_Node

---

### 상품 관리
- **상품 목록**: `GET /api/products`
- **상품 생성**: `POST /api/products`
- **상품 수정**: `PUT /api/products/:id`
- **상품 삭제**: `DELETE /api/products/:id`
- **이미지 업로드**: `POST /api/products/upload/product`
- 관련 프론트엔드: Frontend_Node

---

### 카테고리 관리
- **카테고리 목록**: `GET /api/categories`
- **카테고리 생성**: `POST /api/categories`
- **카테고리 수정**: `PUT /api/categories/:id`
- **카테고리 삭제**: `DELETE /api/categories/:id`
- 관련 프론트엔드: Frontend_Node

---

### 결제 화면
- **결제 생성**: `POST /api/payments`
- **결제 조회**: `GET /api/payments/:id`
- 관련 프론트엔드: App_React

---

### 사용자 관리
- **사용자 목록**: `GET /api/users`
- **사용자 생성**: `POST /api/users`
- **사용자 수정**: `PUT /api/users/:id`
- **사용자 삭제**: `DELETE /api/users/:id`
- 관련 프론트엔드: Frontend_Node

---

## 이미지 제공

### 정적 파일 서빙
- 경로: `/uploads` 또는 `/image`
- 실제 위치: `Backend_Node/uploads/`
- 사용 예:
  ```
  http://localhost:3004/uploads/products/product123.jpg
  http://localhost:3004/image/stores/store456.png
  ```

---

## 프론트엔드 개발 시 주의사항

### Android Emulator
- Backend URL은 반드시: `http://10.0.2.2:{PORT}`
- `localhost` 사용 금지 (에뮬레이터 내부 루프백으로 인식됨)

### 이미지 경로
- 서버에서 반환하는 `image_url`은 상대 경로일 수 있음
- 프론트엔드에서 Base URL 붙여서 사용:
  ```typescript
  const fullUrl = `${API_BASE_URL}${imageUrl}`;
  // 예: http://localhost:3004/uploads/products/image.jpg
  ```

### JWT 토큰
- 로그인 후 토큰을 안전하게 저장 (LocalStorage, SecureStore 등)
- 보호된 API 호출 시 헤더에 포함:
  ```typescript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```

---

## UI 변경 시 업데이트 필요

프론트엔드에서 다음과 같은 변경이 발생하면 이 문서를 업데이트하세요:

1. **새로운 화면 추가**
   - 화면명, 사용하는 API, 주요 기능

2. **API 엔드포인트 변경**
   - 변경된 엔드포인트와 영향받는 화면

3. **UI/UX 플로우 변경**
   - 사용자 경로 변경 사항

4. **이미지/파일 처리 변경**
   - 업로드/다운로드 방식 변경

---

## Backend_Node에서 제공하는 헬스체크

### 서버 상태 확인
- **엔드포인트**: `GET /health`
- **응답**:
  ```json
  { "status": "ok" }
  ```
- **용도**: 서버 정상 작동 여부 확인, 프론트엔드 초기 연결 테스트

---

**Backend는 UI가 없지만, 프론트엔드 개발을 위한 API 명세는 `dev_api_page.md`를 참조하세요.**

---

## App_React (모바일 키오스크 애플리케이션)

### 프로젝트 상태
**✅ Flutter → React Native 마이그레이션 완료 (2026-02-13)**
- app-flutter 디렉토리에서 완전 마이그레이션
- 모든 핵심 기능 React Native로 재구현
- UI/UX 동일하게 유지
- KICC/KIC 결제 네이티브 모듈 연동은 향후 작업 예정

### 기술 스택
- React Native 0.73.6
- Expo SDK 50
- TypeScript 5.3.0
- TanStack Query v5 (서버 상태 관리)
- Axios 1.6.0 (HTTP 클라이언트)
- NativeWind v4 (Tailwind CSS for RN)
- React Navigation (네비게이션)
- AsyncStorage (로컬 저장소)

### 화면 구조

#### 1. 로딩 화면 (LoadingScreen)
- **컴포넌트**: `src/screens/LoadingScreen.tsx`
- **API**:
  - `GET /api/appdata?license_key={key}` - 스토어 데이터 조회
- **기능**:
  - 앱 초기 로딩
  - JWT 토큰 및 라이선스 키 확인
  - 스토어 데이터 패치 및 AsyncStorage 저장
  - VAN 앱 설치 확인 및 다운로드 프롬프트 (`ensureVanAppInstalled`)
#### 2. 라이선스 등록 화면 (LicenseRegisterScreen)
- **컴포넌트**: `src/screens/LicenseRegisterScreen.tsx`
- **API**:
  - `POST /api/license-auth/login` - 라이선스 인증 및 JWT 발급
- **요청 본문**:
  ```json
  {
    "license_key": "string"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "license_key": "string"
  }
  ```
- **기능**:
  - 라이선스 키 입력
  - 서버 인증 및 JWT 토큰 발급
  - AsyncStorage에 license_key와 token 저장
  - 성공 시 `onRegistered` 콜백 → LoadingScreen 재로딩
- **UI**:
  - TextInput (라이선스 키)
  - 등록 버튼
  - Alert 피드백 ("라이선스 인증 및 토큰 발급 완료")age에 라이선스 키 저장
  - 검증 성공 시 LoadingScreen으로 재진입
- **UI**:
  - TextInput (라이선스 키)
  - 등록 버튼
  - Alert 피드백

#### 3. 메인 화면 (MainScreen)
- **컴포넌트**: `src/screens/MainScreen.tsx`
- **Props**: `storeData: AppDataResponse`
- **주요 기능**:
  - **카테고리 선택**: 상단 가로 스크롤 카테고리 탭 ("전체" + 카테고리 목록)
  - **상품 그리드**: FlatList 3열 그리드, 카테고리별 필터링
  - **장바구니 관리**:
    - 수량 증감 버튼 (+/-)
    - 삭제 버튼
    - 동일 상품+옵션 조합은 수량 증가
  - **옵션 선택 모달**:
    - 필수 옵션 표시 및 검증
    - 다중 옵션 선택 지원
    - 옵션 가격 표시
  - **대기 화면 (Waiting Screen)**:
    - 60초 (`IDLE_TIMEOUT`) 유휴 시 자동 활성화
    - 파란색 전체화면 오버레이
    - "화면을 터치하여 주문하세요" 메시지
    - 터치 시 장바구니 초기화 및 메인 복귀
  - **결제 플로우**:
    - 총액 및 VAT 계산 표시
    - Alert 확인 다이얼로그
    - KICC/KIC 결제 연동은 향후 작업
  - **실시간 UI**:
    - 현재 시각 (HH:MM:SS)
    - 유휴 카운트다운 타이머 표시
- **UI 레이아웃**:
  - 헤더: 매장명, 대기시간 카운터, 현재 시각
  - 좌측 (flex-1): 카테고리 탭 + 상품 그리드 (3열)
  - 우측 (w-80): 장바구니 목록 + 총액 + 결제 버튼
  - 모달: 옵션 선택, 대기 화면 오버레이
- **이벤트 처리**:
  - 모든 터치 이벤트 → `resetIdleTimer()` 호출
  - 상품 클릭 → 옵션 있으면 모달, 없으면 바로 장바구니
  - 장바구니 수량 변경 → 실시간 총액 업데이트
  - 60초 유휴 → 대기 화면 자동 활성화

### 데이터 구조 (AppDataResponse)

```typescript
interface AppDataResponse {
  store: Store;
  categories: Category[];
  products: Product[];
}

interface Store {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  van_type?: string; // "KICC" | "KIC"
}

interface Category {
  id: number;
  name: string;
  store_id: number;
  display_order: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  is_available: boolean;
  image_url?: string;
  product_options?: ProductOption[];
}

interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  price: number;
  is_required: boolean;
}

interface CartItem {
  product: Product;
  selectedOptions: ProductOption[];
  quantity: number;
  totalPrice: number;
}
```

### 서비스 레이어

#### API Service (`src/services/api.ts`)
- **Base Client**: Axios instance with interceptors
- **Request Interceptor**: JWT 토큰 자동 주입 (`Authorization: Bearer {token}`)
- **Methods**:
  - `login(username, password)` - 관리자 로그인
  - `loginWithLicense(license_key)` - 라이선스 인증 (POST /license-auth/login)
  - `getAppData(license_key)` - 스토어 데이터 조회
  - `uploadFile(path, file, fieldName, filename, storeId)` - Multipart 파일 업로드
  - `healthCheck()` - 헬스 체크
- **Features**:
  - Automatic token refresh from AsyncStorage
  - Error logging with `logError`
  - Support for X-Store-Id header (multipart uploads)

#### VAN Installer Utility (`src/utils/vanInstaller.ts`)
- **ensureVanAppInstalled(vanType)**: VAN 앱 설치 확인 및 다운로드 유도
- **Supported VAN Types**:
  - `KICC`: kr.co.kicc.easycarda (vanApk/EasyCard-A_v1.0.3.8.apk)
  - `KIC`: kr.co.kisvan.andagent.inapp (vanApk/KIS-ANDAGT_V1057.apk)
- **Platform**: Android only
- **Note**: 현재는 네이티브 모듈 없이 항상 다운로드 프롬프트 표시 (향후 개선 예정)

### 이미지 처리

- **경로 정규화**: `normalizeImageUrl()`
  - Backend URL: `EXPO_PUBLIC_BACKEND_URL`
  - 상대 경로: `/image/products/...`
  - 절대 경로 생성: `http://10.0.2.2:3004/image/products/...`
- **Android 에뮬레이터**: `10.0.2.2`를 호스트 머신 localhost로 사용

### 유틸리티

#### storage.ts (AsyncStorage Wrapper)
- `getToken()` - JWT 토큰 조회
- `setToken(token)` - JWT 토큰 저장
- `removeToken()` - JWT 토큰 삭제
- `getLicenseKey()` - 라이선스 키 조회
- `setLicenseKey(key)` - 라이선스 키 저장
- `removeLicenseKey()` - 라이선스 키 삭제
- `getStoreData()` - 스토어 데이터 조회
- `setStoreData(data)` - 스토어 데이터 저장
- `removeStoreData()` - 스토어 데이터 삭제

#### format.ts
- `formatPrice(price)` - 숫자를 원화 포맷으로 변환 (천단위 콤마)
- `formatTime()` - 현재 시간을 HH:MM:SS 포맷으로 반환
- `normalizeImageUrl(url)` - 이미지 URL 정규화 (BACKEND_URL 조합)

#### logger.ts
- **Format**: `[App][LEVEL][HH:MM:SS] message`
- **Levels**: INFO (Blue), DEBUG (Green), ERROR (Red)
- **Library**: chalk (color output)
- `logInfo(message, ...args)` - INFO 레벨 로그
- `logDebug(message, ...args)` - DEBUG 레벨 로그
- `logError(message, ...args)` - ERROR 레벨 로그

### 환경 변수

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.219.103:3004
```

- Expo는 `EXPO_PUBLIC_` prefix 필수
- Android 에뮬레이터에서는 `10.0.2.2` 사용 권장
- 실제 디바이스에서는 네트워크 IP 사용

---

## UI 변경 시 업데이트 필요

프론트엔드에서 다음과 같은 변경이 발생하면 이 문서를 업데이트하세요:

1. **새로운 화면 추가**
   - 화면명, 사용하는 API, 주요 기능

2. **API 엔드포인트 변경**
   - 변경된 엔드포인트와 영향받는 화면

3. **UI/UX 플로우 변경**
   - 사용자 경로 변경 사항

4. **이미지/파일 처리 변경**
   - 업로드/다운로드 방식 변경

---

## Backend_Node에서 제공하는 헬스체크

### 서버 상태 확인
- **엔드포인트**: `GET /health`
- **응답**:
  ```json
  { "status": "ok" }
  ```
- **용도**: 서버 정상 작동 여부 확인, 프론트엔드 초기 연결 테스트

---

**Backend는 UI가 없지만, 프론트엔드 개발을 위한 API 명세는 `dev_api_page.md`를 참조하세요.**
