# Backend_Node API 문서

## 기본 정보
- Base URL: `http://localhost:{PORT}`
- 인증: JWT Bearer Token (대부분의 엔드포인트)
- Content-Type: `application/json`

---

## 인증 (Auth)

### POST /api/auth/register
사용자 등록

**요청 본문:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

**응답:**
```json
{
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

---

### POST /api/auth/login
사용자 로그인

**요청 본문:**
```json
{
  "username": "string",
  "password": "string"
}
```

**응답:**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "username": "string"
  }
}
```

---

## 사용자 (Users)

### GET /api/users
사용자 목록 조회

**응답:**
```json
{
  "data": [
    {
      "id": "number",
      "username": "string",
      "email": "string"
    }
  ]
}
```

---

### POST /api/users
사용자 생성

**요청 본문:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

---

### GET /api/users/:user_Id
특정 사용자 조회

**파라미터:**
- `user_Id`: 사용자 ID

---

### PUT /api/users/update
### PUT /api/users/:id
사용자 정보 수정 (SuperAdmin 권한 필요)

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string (optional)"
}
```

---

### POST /api/users/delete
### DELETE /api/users/:id
사용자 삭제 (SuperAdmin 권한 필요)

**헤더:**
- `Authorization: Bearer {token}`

---

## 라이선스 (Licenses)

### GET /api/licenses
라이선스 목록 조회

**쿼리 파라미터:**
- `store_id`: (선택) 특정 스토어의 라이선스만 조회

**응답:**
```json
{
  "data": [
    {
      "id": "number",
      "license_key": "string",
      "expiry_dt": "string (datetime) | null",
      "device_id": "string | null",
      "uuid": "string | null",
      "store_id": "number | null",
      "active": "number | null",
      "meta": "any | null"
    }
  ]
}
```

---

### POST /api/licenses
라이선스 생성

**요청 본문:**
```json
{
  "license_key": "string",
  "meta": "any (optional)"
}
```

**응답:**
```json
{
  "id": "number",
  "license_key": "string"
}
```

---

### POST /api/licenses/check-key
라이선스 키 검증

**요청 본문:**
```json
{
  "key": "string"
}
```

**응답:**
```json
{
  "valid": "boolean",
  "license": {
    "id": "number",
    "license_key": "string"
  } | null
}
```

---

## 앱 데이터 (App Data)

이 엔드포인트는 클라이언트(앱)가 시작 시 필요한 기본 데이터를 제공합니다.

### GET /api/appdata
앱 실행을 위한 요약 데이터(스토어 정보, 설정 등)를 반환합니다.

**쿼리 파라미터 (예시):**
- `license_key`: (선택) 라이선스 키로 연계된 데이터 반환

**응답 예:**
```json
{
  "store": { "id": 1, "name": "..." },
  "settings": { /* ... */ }
}
```

### GET /appdata (호환성)
레거시 클라이언트(RN/Flutter 등) 호환을 위해 `/appdata` (즉, `/api` 접두사 없는 경로)도 동일한 데이터를 반환합니다. 새 클라이언트에서는 `/api/appdata`를 사용하도록 권장합니다.


---

## 스토어 (Stores)

### GET /api/stores
스토어 목록 조회

**헤더:**
- `Authorization: Bearer {token}` (필요 시)

---

### GET /api/stores/:id
특정 스토어 조회

**파라미터:**
- `id`: 스토어 ID

---

### POST /api/stores
스토어 생성

**헤더:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}` (필요 시)

**Form Data:**
- `name`: 스토어 이름
- `image`: 이미지 파일 (선택)

---

## 스토어 그룹 (Store Groups)

### GET /api/store-groups
스토어 그룹 목록 조회

---

### POST /api/store-groups
스토어 그룹 생성

**요청 본문:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

---

## 카테고리 (Categories)

### GET /api/categories
카테고리 목록 조회

**헤더:**
- `Authorization: Bearer {token}`

---

### GET /api/categories/:id
특정 스토어의 카테고리 조회

**헤더:**
- `Authorization: Bearer {token}`

**파라미터:**
- `id`: 스토어 ID

---

### POST /api/categories
카테고리 생성

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "name": "string",
  "store_id": "number",
  "display_order": "number (optional)"
}
```

---

### PUT /api/categories/update
### PUT /api/categories/:id
카테고리 수정

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "id": "number",
  "name": "string",
  "display_order": "number (optional)"
}
```

---

### POST /api/categories/delete
### DELETE /api/categories/:id
카테고리 삭제

**헤더:**
- `Authorization: Bearer {token}`

---

## 상품 (Products)

### GET /api/products
상품 목록 조회

**헤더:**
- `Authorization: Bearer {token}`

**쿼리 파라미터:**
- `store_id`: (선택) 특정 스토어의 상품만 조회
- `category_id`: (선택) 특정 카테고리의 상품만 조회

---

### POST /api/products
상품 생성

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "name": "string",
  "price": "number",
  "store_id": "number",
  "category_id": "number (optional)",
  "image_url": "string (optional)",
  "is_available": "boolean (optional)",
  "display_order": "number (optional)"
}
```

---

### PUT /api/products/update
### PUT /api/products/:id
상품 수정

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "id": "number",
  "name": "string (optional)",
  "price": "number (optional)",
  "category_id": "number (optional)",
  "is_available": "boolean (optional)",
  "display_order": "number (optional)"
}
```

---

### POST /api/products/delete
### DELETE /api/products/:id
상품 삭제

**헤더:**
- `Authorization: Bearer {token}`

---

### POST /api/products/upload/product/:storeId
### POST /api/products/upload/product
상품 이미지 업로드

**헤더:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Form Data:**
- `image`: 이미지 파일

---

### POST /api/products/delete-image
상품 이미지 삭제

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "product_id": "number",
  "image_url": "string"
}
```

---

## 상품 옵션 (Product Options)

### GET /api/product-options
상품 옵션 목록 조회

**헤더:**
- `Authorization: Bearer {token}`

**쿼리 파라미터:**
- `product_id`: (선택) 특정 상품의 옵션만 조회

---

### POST /api/product-options
상품 옵션 생성

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "product_id": "number",
  "name": "string",
  "price_modifier": "number (optional)",
  "is_available": "boolean (optional)"
}
```

---

### PUT /api/product-options/update
### PUT /api/product-options/:id
상품 옵션 수정

**헤더:**
- `Authorization: Bearer {token}`

**요청 본문:**
```json
{
  "id": "number",
  "name": "string (optional)",
  "price_modifier": "number (optional)",
  "is_available": "boolean (optional)"
}
```

---

### POST /api/product-options/delete
### DELETE /api/product-options/:id
상품 옵션 삭제

**헤더:**
- `Authorization: Bearer {token}`

---

## 결제 (Payments)

### POST /api/payments
결제 생성

**요청 본문:**
```json
{
  "bizNumber": "string",
  "orderNo": "string",
  "device_id": "string",
  "storeId": "number",
  "payment_time": "string (datetime)",
  "total_amount": "number",
  "card_payment": "number",
  "other_payment": "number",
  "products_snapshot": "array"
}
```

**응답:**
```json
{
  "id": "number",
  "orderNo": "string",
  "status": "string"
}
```

---

### GET /api/payments/:id
결제 조회

**파라미터:**
- `id`: 결제 ID

**응답:**
```json
{
  "id": "number",
  "orderNo": "string",
  "total_amount": "number",
  "status": "string",
  "payment_time": "string"
}
```

---

## 앱데이터 (AppData)

### GET /api/appdata
앱 데이터 조회

**응답:**
```json
{
  "data": {
    "settings": "object",
    "config": "object"
  }
}
```

---

## 관리자 (Admin)

### GET /api/admin/stats
통계 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

**응답:**
```json
{
  "stats": {
    "totalUsers": "number",
    "totalStores": "number",
    "totalProducts": "number"
  }
}
```

---

### GET /api/admin/rate-limit-status
Rate Limit 상태 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/receipts-per-minute
분당 영수증 수 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/metrics/system
시스템 메트릭 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/metrics/redis
Redis 메트릭 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/metrics/kafka
Kafka 메트릭 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/metrics/top-latency
최상위 레이턴시 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/metrics/top-count
최상위 카운트 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

---

### GET /api/admin/receipts
영수증 목록 조회

**헤더:**
- `Authorization: Bearer {token}` (Admin 권한)

**쿼리 파라미터:**
- `from`: 시작 날짜 (선택)
- `to`: 종료 날짜 (선택)
- `storeId`: 스토어 ID (선택)

**응답:**
```json
[
  {
    "id": "number",
    "orderNo": "string",
    "total_amount": "number",
    "payment_time": "string",
    "status": "string"
  }
]
```

---

## 헬스체크

### GET /health
서버 상태 확인

**응답:**
```json
{
  "status": "ok"
}
```

---

## 에러 응답 형식

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": "error_code_string",
  "message": "Human readable error message (optional)"
}
```

**공통 HTTP 상태 코드:**
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 인증 미들웨어

### verifyJwt
JWT 토큰 검증. 헤더에 `Authorization: Bearer {token}` 필요.

### isSuperAdmin
SuperAdmin 권한 검증. verifyJwt와 함께 사용.

---

## 파일 업로드

파일 업로드가 필요한 엔드포인트는 `multipart/form-data` 형식을 사용합니다.

**업로드된 파일 경로:**
- `/uploads` 또는 `/image`로 접근 가능
- 예: `http://localhost:3004/uploads/products/image.jpg`

---

## 로깅

모든 API 요청/응답은 `dev.log` 파일에 기록됩니다.
- 포맷: `[Backend][LEVEL][HH:MM:SS] message`
- 로그 모니터링: `tail -f dev.log`

---

## Redis 캐싱

### 캐싱 정책

다음 API들은 Redis 캐싱을 적용하여 성능을 향상시킵니다:

#### 1. 앱 데이터 (AppData)
- **엔드포인트**: `GET /api/appdata`
- **캐시 키**: 
  - `appdata:license:{license_key}` (license_key가 있는 경우)
  - `appdata:default` (license_key가 없는 경우)
- **TTL**: 300초 (5분)
- **설명**: 스토어, 카테고리, 상품 정보를 포함한 전체 앱 데이터

#### 2. 카테고리 (Categories)
- **엔드포인트**: 
  - `GET /api/categories` → 전체 카테고리 조회
  - `GET /api/categories/:id` → 특정 스토어의 카테고리 조회
- **캐시 키**:
  - `categories:all` (전체)
  - `categories:store:{storeId}` (스토어별)
- **TTL**: 300초 (5분)
- **무효화**: 카테고리 생성/수정/삭제 시

#### 3. 상품 (Products)
- **엔드포인트**: `GET /api/products`
- **캐시 키**:
  - `products:store:{storeId}` (storeId가 있는 경우)
  - `products:all` (전체 조회)
- **TTL**: 300초 (5분)
- **무효화**: 상품 생성/수정/삭제 시

#### 4. 스토어 (Stores)
- **엔드포인트**: 
  - `GET /api/stores` → 전체 스토어 조회
  - `GET /api/stores/:id` → 특정 스토어 조회
- **캐시 키**:
  - `stores:all` (전체)
  - `stores:id:{id}` (개별)
- **TTL**: 300초 (5분)
- **무효화**: 스토어 생성/수정 시

### 캐시 무효화 전략

캐시는 다음 경우에 자동으로 무효화되어야 합니다:
- **카테고리**: POST/PUT/DELETE 시 관련 캐시 삭제
- **상품**: POST/PUT/DELETE 시 관련 캐시 삭제
- **스토어**: POST/PUT 시 관련 캐시 삭제
- **앱 데이터**: 의존 데이터(스토어/카테고리/상품) 변경 시

### Redis 키 구조

Redis 키는 다음 형식을 따릅니다:
```
Kiosk:<domain>:<key>
```

예:
- `Kiosk:appdata:license:ABC123`
- `Kiosk:categories:store:1`
- `Kiosk:products:all`
- `Kiosk:stores:id:5`
- `Kiosk:session:user123`
- `Kiosk:ratelimit:192.168.1.1`
