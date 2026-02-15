import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, Text } from 'react-native';
import { getCachedImageUri } from '../utils/imageCache';
import { normalizeImageUrl } from '../utils/format';
import { logDebug, logError } from '../utils/logger';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: string | null | undefined;
  showLoader?: boolean;
  fallbackText?: string;
}

/**
 * 로컬 캐시를 활용하는 이미지 컴포넌트
 * - 이미지가 로컬에 있으면 즉시 표시
 * - 없으면 다운로드 후 캐시하고 표시
 * - 서버 트래픽을 대폭 절감
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  showLoader = true,
  fallbackText,
  style,
  ...restProps
}) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    loadImage();
  }, [source]);

  const loadImage = async () => {
    if (!source) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      // URL 정규화 (BACKEND_URL 붙이기)
      const normalizedUrl = normalizeImageUrl(source);
      
      if (!normalizedUrl) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      logDebug('[CachedImage] Loading image:', normalizedUrl);

      // 캐시에서 가져오기 (없으면 자동 다운로드)
      const cachedUri = await getCachedImageUri(normalizedUrl);
      
      if (cachedUri) {
        setLocalUri(cachedUri);
        logDebug('[CachedImage] Image loaded from cache:', cachedUri);
      } else {
        setHasError(true);
        logError('[CachedImage] Failed to load image:', normalizedUrl);
      }
    } catch (error) {
      logError('[CachedImage] Error loading image:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중
  if (isLoading && showLoader) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }]}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  // 에러 또는 이미지 없음
  if (hasError || !localUri) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' }]}>
        {fallbackText ? (
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>{fallbackText}</Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>No Image</Text>
        )}
      </View>
    );
  }

  // 캐시된 이미지 표시
  return (
    <Image
      {...restProps}
      source={{ uri: localUri }}
      style={style}
      onError={(error) => {
        logError('[CachedImage] Image render error:', error.nativeEvent.error);
        setHasError(true);
      }}
    />
  );
};

export default CachedImage;
