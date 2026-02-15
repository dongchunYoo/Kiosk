import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingScreen from './src/screens/LoadingScreen';
import { initImageCache } from './src/utils/imageCache';
import './global.css';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // 앱 시작 시 이미지 캐시 디렉터리 초기화
    initImageCache();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LoadingScreen />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
