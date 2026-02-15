# 이미지 로컬 캐싱 시스템

## 개요
서버 트래픽과 비용을 절감하기 위해 이미지를 로컬에 다운로드하여 캐싱하는 시스템입니다.

## 주요 기능

### 1. 자동 캐싱
- 이미지를 최초 1회만 다운로드
- 이후 요청 시 로컬 캐시에서 즉시 로드
- 네트워크 트래픽 대폭 절감

### 2. 투명한 사용
- 기존 `Image` 컴포넌트와 동일한 API
- URL만 전달하면 자동으로 캐싱 처리
- 개발자가 캐싱 로직을 신경 쓸 필요 없음

### 3. 로딩 상태 표시
- 다운로드 중 로딩 인디케이터 표시
- 에러 발생 시 폴백 UI 제공
- 사용자 경험 최적화

## 사용 방법

### 기본 사용
```tsx
import { CachedImage } from '../components/CachedImage';

<CachedImage
  source={product.image_url}
  className="h-32 w-full"
  resizeMode="cover"
/>
```

### 옵션 사용
```tsx
<CachedImage
  source={imageUrl}
  className="h-32 w-full"
  resizeMode="cover"
  showLoader={true}           // 로딩 인디케이터 표시 (기본: true)
  fallbackText="이미지 없음"   // 에러 시 표시할 텍스트
/>
```

## 파일 구조

```
App_React/
├── src/
│   ├── components/
│   │   └── CachedImage.tsx          # 캐싱 이미지 컴포넌트
│   ├── utils/
│   │   └── imageCache.ts            # 캐시 관리 유틸리티
│   └── screens/
│       └── MainScreen.tsx           # 사용 예제
└── App.tsx                          # 캐시 초기화
```

## 캐시 관리 API

### `initImageCache()`
앱 시작 시 캐시 디렉터리 생성
```tsx
import { initImageCache } from './src/utils/imageCache';

useEffect(() => {
  initImageCache();
}, []);
```

### `getCachedImageUri(url)`
이미지 URL을 받아 로컬 캐시 경로 반환 (없으면 자동 다운로드)
```tsx
const localPath = await getCachedImageUri(imageUrl);
```

### `clearImageCache()`
캐시 전체 삭제 (용량 관리)
```tsx
import { clearImageCache } from './src/utils/imageCache';

await clearImageCache();
```

### `getCacheSize()`
현재 캐시 크기 확인 (MB 단위)
```tsx
import { getCacheSize } from './src/utils/imageCache';

const sizeMB = await getCacheSize();
console.log(`캐시 크기: ${sizeMB.toFixed(2)} MB`);
```

### `removeCachedImage(url)`
특정 이미지만 캐시에서 삭제
```tsx
import { removeCachedImage } from './src/utils/imageCache';

await removeCachedImage(imageUrl);
```

## 성능 개선 효과

### Before (캐싱 없음)
- 이미지 로드: 매번 서버 요청
- 네트워크 트래픽: 높음
- 로딩 시간: 네트워크 상태에 따라 가변
- 서버 비용: 높음

### After (캐싱 적용)
- 이미지 로드: 최초 1회만 서버 요청
- 네트워크 트래픽: **90% 이상 감소**
- 로딩 시간: **즉시 표시 (캐시 히트 시)**
- 서버 비용: **대폭 절감**

## 예상 절감 효과

### 시나리오: 상품 이미지 100개, 하루 1000명 방문
- **Before**: 100,000회 이미지 요청 (100 × 1000)
- **After**: 100회 이미지 요청 (최초 1회만)
- **절감률**: 99.9%

### 비용 계산 (예시)
- 이미지당 평균 크기: 100KB
- Before: 100,000 × 100KB = **10GB/day**
- After: 100 × 100KB = **10MB/day**
- **트래픽 절감**: 9.99GB/day

## 캐시 저장 위치
- iOS: `{App}/Library/Caches/images/`
- Android: `{App}/cache/images/`

## 주의사항

1. **캐시 용량 관리**
   - 정기적으로 `getCacheSize()`로 확인
   - 필요시 `clearImageCache()`로 정리

2. **이미지 업데이트**
   - 서버에서 이미지가 변경되어도 URL이 같으면 캐시 사용
   - URL에 버전 쿼리 추가 권장: `image.jpg?v=2`

3. **앱 재설치**
   - 캐시는 앱 삭제 시 함께 삭제됨
   - 재설치 후 이미지 재다운로드 필요

## 추가 최적화 옵션

### 1. 프리로딩 (앱 시작 시)
```tsx
import { downloadAndCache } from './src/utils/imageCache';

useEffect(() => {
  // 주요 이미지 미리 다운로드
  const preloadImages = async () => {
    const urls = products.map(p => p.image_url).filter(Boolean);
    await Promise.all(urls.map(url => downloadAndCache(url)));
  };
  
  preloadImages();
}, [products]);
```

### 2. 자동 캐시 정리 (용량 제한)
```tsx
import { getCacheSize, clearImageCache } from './src/utils/imageCache';

const manageCacheSize = async () => {
  const sizeMB = await getCacheSize();
  
  if (sizeMB > 100) { // 100MB 초과 시
    await clearImageCache();
  }
};
```

### 3. 백그라운드 다운로드
```tsx
// 화면에 보이지 않는 이미지도 미리 다운로드
useEffect(() => {
  allProducts.forEach(product => {
    if (product.image_url) {
      downloadAndCache(normalizeImageUrl(product.image_url));
    }
  });
}, [allProducts]);
```

## 문제 해결

### 이미지가 표시되지 않는 경우
1. 네트워크 연결 확인
2. 이미지 URL 유효성 확인
3. 캐시 디렉터리 권한 확인
4. 로그 확인: `[ImageCache]` 태그로 필터링

### 캐시가 작동하지 않는 경우
1. `initImageCache()` 호출 확인
2. FileSystem 권한 확인
3. 디스크 공간 확인
4. 캐시 디렉터리 존재 여부 확인

## 라이센스
MIT
