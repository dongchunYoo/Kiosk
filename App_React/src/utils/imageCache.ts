import * as FileSystem from 'expo-file-system';
import { logDebug, logError } from './logger';

// 이미지 캐시 디렉터리
const CACHE_DIR = `${FileSystem.cacheDirectory}images/`;

/**
 * 이미지 캐시 디렉터리 초기화
 */
export const initImageCache = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      logDebug('[ImageCache] Cache directory created:', CACHE_DIR);
    }
  } catch (error) {
    logError('[ImageCache] Failed to create cache directory:', error);
  }
};

/**
 * URL에서 파일명 추출 (해시 기반)
 */
const getFileNameFromUrl = (url: string): string => {
  // URL을 간단한 해시로 변환 (충돌 방지)
  const hash = url.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // 파일 확장자 추출
  const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
  
  return `${Math.abs(hash)}.${extension}`;
};

/**
 * 이미지가 로컬 캐시에 존재하는지 확인
 */
export const isCached = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const fileName = getFileNameFromUrl(url);
    const filePath = `${CACHE_DIR}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
  } catch (error) {
    logError('[ImageCache] Failed to check cache:', error);
    return false;
  }
};

/**
 * 이미지 다운로드 및 로컬 캐시에 저장
 */
export const downloadAndCache = async (url: string): Promise<string | null> => {
  if (!url) return null;
  
  try {
    await initImageCache();
    
    const fileName = getFileNameFromUrl(url);
    const filePath = `${CACHE_DIR}${fileName}`;
    
    // 이미 캐시되어 있으면 로컬 경로 반환
    if (await isCached(url)) {
      logDebug('[ImageCache] Using cached image:', fileName);
      return filePath;
    }
    
    // 다운로드
    logDebug('[ImageCache] Downloading image:', url);
    const downloadResult = await FileSystem.downloadAsync(url, filePath);
    
    if (downloadResult.status === 200) {
      logDebug('[ImageCache] Image downloaded successfully:', fileName);
      return filePath;
    } else {
      logError('[ImageCache] Download failed with status:', downloadResult.status);
      return null;
    }
  } catch (error) {
    logError('[ImageCache] Failed to download image:', error);
    return null;
  }
};

/**
 * 로컬 캐시에서 이미지 경로 가져오기 (없으면 다운로드)
 */
export const getCachedImageUri = async (url: string | null | undefined): Promise<string | null> => {
  if (!url) return null;
  
  try {
    const fileName = getFileNameFromUrl(url);
    const filePath = `${CACHE_DIR}${fileName}`;
    
    // 캐시 확인
    if (await isCached(url)) {
      return filePath;
    }
    
    // 캐시에 없으면 다운로드
    return await downloadAndCache(url);
  } catch (error) {
    logError('[ImageCache] Failed to get cached image:', error);
    return null;
  }
};

/**
 * 캐시 전체 삭제 (앱 초기화나 용량 관리용)
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      logDebug('[ImageCache] Cache cleared');
      await initImageCache();
    }
  } catch (error) {
    logError('[ImageCache] Failed to clear cache:', error);
  }
};

/**
 * 캐시 크기 확인 (MB 단위)
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize / (1024 * 1024); // MB로 변환
  } catch (error) {
    logError('[ImageCache] Failed to get cache size:', error);
    return 0;
  }
};

/**
 * 특정 URL의 캐시 삭제
 */
export const removeCachedImage = async (url: string): Promise<void> => {
  if (!url) return;
  
  try {
    const fileName = getFileNameFromUrl(url);
    const filePath = `${CACHE_DIR}${fileName}`;
    
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      logDebug('[ImageCache] Removed cached image:', fileName);
    }
  } catch (error) {
    logError('[ImageCache] Failed to remove cached image:', error);
  }
};
