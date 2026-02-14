import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { storage } from '../utils/storage';
import { apiService } from '../services/api';
import { ensureVanAppInstalled } from '../utils/vanInstaller';
import { logError, logDebug } from '../utils/logger';
import LicenseRegisterScreen from './LicenseRegisterScreen';
import MainScreen from './MainScreen';
import type { AppDataResponse } from '../types';

const LoadingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<AppDataResponse | null>(null);

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    try {
      const jwt = await storage.getToken();
      const key = await storage.getLicenseKey();

      // Simulate loading effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (jwt && key) {
        // Fetch store data from server
        try {
          const data = await apiService.getAppData(key);
          // Debug log the raw response for diagnostics
          logDebug('[LoadingScreen] appdata response:', data);

          // Validate response shape before setting storeData to avoid runtime errors
          const hasProducts = data && Array.isArray((data as any).products);
          const hasCategories = data && Array.isArray((data as any).categories);
          const hasStore = data && (data as any).store;
          if (!hasProducts || !hasCategories || !hasStore) {
            logError('[LoadingScreen] Invalid /appdata response shape, skipping setStoreData', data);
          } else {
            setStoreData(data);
            await storage.setStoreData(JSON.stringify(data));
          }
          
          
          // Check and prompt VAN app installation if needed
          if (data.store?.van_type) {
            logDebug('Checking VAN app installation:', data.store.van_type);
            await ensureVanAppInstalled(data.store.van_type);
          }
        } catch (error) {
          logError('Failed to fetch store data:', error);
        }
      }

      setLicenseKey(key);
    } catch (error) {
      logError('Error checking license:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-6 text-base text-gray-700">로딩 중...</Text>
      </View>
    );
  }

  if (!licenseKey) {
    return <LicenseRegisterScreen onRegistered={(key) => {
      setLicenseKey(key);
      checkLicense();
    }} />;
  }

  if (!storeData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-red-600">데이터를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return <MainScreen storeData={storeData} />;
};

export default LoadingScreen;
