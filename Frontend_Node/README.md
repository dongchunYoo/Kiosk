# Frontend_Node (관리자 웹 인터페이스)

Kiosk 프로젝트의 관리자용 웹 인터페이스입니다. React + Vite 기반으로 구축되었습니다.

## 기술 스택

- **React** 18.3.1
- **Vite** 5.0.0
- **React Router DOM** 7.9.5
- **Axios** 1.13.1
- **Chart.js** 4.4.0
- **DnD Kit** (Drag and Drop)

## Quick Start

### run.dev.sh 사용 (권장)

```bash
./run.dev.sh
```

스크립트가 자동으로:
1. Clean (이전 빌드 정리)
2. Install (의존성 설치)
3. Build (개발 모드에서는 생략)
4. Run (Vite dev 서버 시작)
5. Log (dev.log 파일에 기록)

### 수동 실행

```bash
npm install
PORT=3005 npm run dev
```

## 환경 설정

### 필수 .env 변수

```env
PORT=3005                                    # 프론트엔드 서버 포트
BIND_HOST=0.0.0.0
VITE_BACKEND_IP=http://localhost:3004       # Backend API URL
VITE_SERVER_NAME=dev
VITE_IMG_PATH=/image/                       # 이미지 경로
VITE_API_LOG=true                           # API 로깅 활성화
```

**주의**: Vite 환경변수는 반드시 `VITE_` prefix 필요.

## 프로젝트 구조

```
Frontend_Node/
├── src/
│   ├── main.jsx              # 앱 진입점
│   ├── App.jsx               # 라우트 정의
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── HomePage.jsx      # 대시보드
│   │   ├── StoresPage.jsx    # 스토어 관리
│   │   ├── ProductsPage.jsx  # 상품 관리
│   │   ├── UsersPage.jsx     # 사용자 관리
│   │   ├── LicensesPage.jsx  # 라이선스 관리
│   │   └── SalesPage.jsx     # 매출 관리
│   ├── components/           # 재사용 컴포넌트
│   │   ├── DashboardLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StoreManagement/
│   │   ├── ProductManagement/
│   │   └── UserManagement/
│   ├── services/             # API 클라이언트
│   │   └── api.js
│   ├── utils/                # 유틸리티
│   │   ├── logger.js         # 중앙화된 로거
│   │   └── util.js
│   └── assets/               # 정적 파일
├── public/                   # 공개 정적 파일
├── .env                      # 환경 변수
├── vite.config.js            # Vite 설정
├── package.json
└── run.dev.sh               # 개발 실행 스크립트
```

## 주요 기능

### 인증 (Authentication)
- JWT 토큰 기반 인증
- LocalStorage에 토큰 저장
- Axios Interceptor로 자동 헤더 주입
- 토큰 만료 시 자동 로그아웃

### 역할 기반 접근 제어 (RBAC)
- **A (Admin)**: 전체 권한
- **S (Store Manager)**: 할당된 그룹의 스토어만
- **U (User)**: 모든 스토어 조회

### 페이지별 기능

#### 홈/대시보드
- 시스템 전반 통계
- Chart.js 기반 시각화
- 실시간 메트릭 모니터링
- Rate Limit, Redis, Kafka 상태

#### 스토어 관리
- 스토어 CRUD
- 스토어 그룹 관리
- 이미지 업로드
- 역할별 필터링

#### 상품 관리
- 상품 CRUD
- 카테고리 관리
- Drag & Drop 순서 변경
- 이미지 업로드/프리뷰
- 상품 옵션 관리

#### 사용자 관리
- 사용자 CRUD
- 역할 할당 (A/S/U)
- 스토어/그룹 할당

#### 라이선스 관리
- 라이선스 키 관리
- 키 검증
- 스토어별 할당

#### 매출 관리
- 영수증 조회
- 날짜/스토어별 필터링
- 매출 통계

## Logging

- 모든 로그는 중앙화된 logger 사용: `src/utils/logger.js`
- 포맷: `[Frontend][LEVEL][HH:MM:SS] message`
- 레벨: INFO, DEBUG, ERROR, WARN
- 로그 모니터링: `tail -f dev.log`

```javascript
import { logInfo, logDebug, logError } from '../utils/logger';

logInfo('Component mounted');
logError('API error', error);
```

## API 연동

### API Client 사용

```javascript
import apiClient from '../services/api';

// GET 요청
const response = await apiClient.get('/api/products');

// POST 요청
await apiClient.post('/api/products', data);

// PUT 요청
await apiClient.put(`/api/products/${id}`, data);

// DELETE 요청
await apiClient.delete(`/api/products/${id}`);
```

### 이미지 URL 구성

```javascript
const backendUrl = import.meta.env.VITE_BACKEND_IP;
const imgPath = import.meta.env.VITE_IMG_PATH;
const fullUrl = `${backendUrl}${imgPath}${product.image_url}`;
```

## 개발 가이드

### 새 컴포넌트 추가
1. 적절한 디렉토리에 .jsx 파일 생성
2. 함수형 컴포넌트 사용
3. Logger import 및 사용
4. 스타일은 별도 .css 파일 또는 인라인

### 새 페이지 추가
1. `src/pages/`에 페이지 컴포넌트 생성
2. `App.jsx`에 라우트 추가
3. `Sidebar.jsx`에 메뉴 항목 추가
4. API 연동 및 에러 처리

### 에러 처리 패턴

```javascript
try {
  const response = await apiClient.get('/api/resource');
  setData(response.data);
} catch (error) {
  logError('Failed to fetch resource', error);
  alert('데이터 로드에 실패했습니다.');
}
```

## 빌드 및 배포

### 개발 빌드
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

빌드 결과는 `dist/` 디렉토리에 생성됩니다.

### 프리뷰
```bash
npm run preview
```

## 문서

- **API 명세**: `Docs/dev_api_page.md`
- **화면 구조**: `Docs/dev_Screen_page.md`
- **개발 가이드**: `Docs/aiagent_Tip.md`
- **코드 스타일**: `Docs/dev_code_style.md`

## 주의사항

1. **환경변수**: 모든 Vite 환경변수는 `VITE_` prefix 필수
2. **Logger**: 직접 console.log 사용 금지
3. **PORT**: 반드시 .env에서 관리
4. **API Client**: fetch 직접 사용 금지, apiClient 사용
5. **인증**: JWT 토큰은 LocalStorage에 저장

## 트러블슈팅

### PORT 충돌
다른 애플리케이션이 포트를 사용 중일 경우:
```bash
lsof -i :3005
kill -9 <PID>
```

### Backend 연결 실패
- `VITE_BACKEND_IP` 확인
- Backend_Node 서버 실행 상태 확인
- 네트워크 방화벽 설정 확인

### 빌드 에러
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```
