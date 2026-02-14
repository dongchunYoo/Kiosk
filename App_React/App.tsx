import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingScreen from './src/screens/LoadingScreen';
import './global.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LoadingScreen />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
