import { Platform, Alert, Linking } from 'react-native';
import { BACKEND_URL } from '../config/constants';
import { logDebug, logError } from './logger';

/**
 * VAN App package names for Android
 */
const VAN_PACKAGES = {
  KICC: 'kr.co.kicc.easycarda',
  KIC: 'kr.co.kisvan.andagent.inapp',
} as const;

/**
 * VAN APK download paths (relative to backend server)
 */
const VAN_APK_PATHS = {
  KICC: 'vanApk/EasyCard-A_v1.0.3.8.apk',
  KIC: 'vanApk/KIS-ANDAGT_V1057.apk',
} as const;

type VanType = keyof typeof VAN_PACKAGES;

/**
 * Check if a specific Android app is installed
 * Note: React Native doesn't have built-in app detection like Flutter's DeviceApps
 * This is a placeholder that always returns false in RN
 * For production, you'd need a native module or third-party library
 * 
 * @param packageName - Android package name
 * @returns Always false (native module required for real detection)
 */
const isAppInstalled = async (packageName: string): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  // TODO: Implement native module for app detection
  // For now, we'll always prompt to install
  logDebug('App installation check not implemented (requires native module):', packageName);
  return false;
};

/**
 * Open APK download URL
 * On Android, this will typically trigger browser download or direct install prompt
 * 
 * @param apkRelativePath - Relative path to APK file on backend server
 */
const openApkUrl = async (apkRelativePath: string): Promise<void> => {
  const normalizedBackend = BACKEND_URL.replace(/\/$/, '');
  const url = `${normalizedBackend}/${apkRelativePath}`;
  
  logDebug('Opening APK URL:', url);

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      logError('Cannot open APK URL:', url);
      Alert.alert('오류', 'APK 다운로드 URL을 열 수 없습니다');
    }
  } catch (error) {
    logError('Failed to open APK URL:', error);
    Alert.alert('오류', 'APK 다운로드에 실패했습니다');
  }
};

/**
 * Ensure VAN app is installed based on vanType from server
 * If not installed and running on Android, prompt user to download APK
 * 
 * @param vanType - VAN type from server ('KICC' or 'KIC')
 */
export const ensureVanAppInstalled = async (vanType: string | null | undefined): Promise<void> => {
  if (!vanType) {
    logDebug('No VAN type specified, skipping VAN app check');
    return;
  }

  const normalizedVanType = vanType.trim().toUpperCase() as VanType;

  if (!VAN_PACKAGES[normalizedVanType]) {
    logError('Unrecognized VAN type:', vanType);
    return;
  }

  if (Platform.OS !== 'android') {
    logDebug('Not Android platform, skipping VAN app installation');
    return;
  }

  const packageName = VAN_PACKAGES[normalizedVanType];
  const apkPath = VAN_APK_PATHS[normalizedVanType];

  logDebug(`Checking VAN app installation: ${normalizedVanType} (${packageName})`);

  const installed = await isAppInstalled(packageName);

  if (installed) {
    logDebug('VAN app already installed:', packageName);
    return;
  }

  // Not installed - prompt user to download
  logDebug('VAN app not installed, prompting download:', packageName);

  Alert.alert(
    'VAN 앱 설치 필요',
    `결제를 위해 ${normalizedVanType} VAN 앱 설치가 필요합니다.\n\n지금 다운로드하시겠습니까?`,
    [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '다운로드',
        onPress: async () => {
          await openApkUrl(apkPath);
        },
      },
    ]
  );
};

/**
 * Get VAN package name for a given VAN type
 * Useful for launching VAN app or checking installation
 */
export const getVanPackageName = (vanType: string | null | undefined): string | null => {
  if (!vanType) return null;
  const normalized = vanType.trim().toUpperCase() as VanType;
  return VAN_PACKAGES[normalized] || null;
};
