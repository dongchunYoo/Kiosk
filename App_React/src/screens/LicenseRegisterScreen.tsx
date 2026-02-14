import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { storage } from '../utils/storage';
import { apiService } from '../services/api';
import { logError, logInfo } from '../utils/logger';

interface LicenseRegisterScreenProps {
  onRegistered: (licenseKey: string) => void;
}

const LicenseRegisterScreen: React.FC<LicenseRegisterScreenProps> = ({ onRegistered }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedKey = licenseKey.trim();
    if (!trimmedKey) {
      Alert.alert('오류', '라이선스 키를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Use license-auth/login endpoint (matches Flutter implementation)
      const result = await apiService.loginWithLicense(trimmedKey);
      
      if (result.success && result.token) {
        // Save both license key and JWT token
        await storage.setLicenseKey(trimmedKey);
        await storage.setToken(result.token);
        
        logInfo('License authentication successful, token received');
        Alert.alert('성공', '라이선스 인증 및 토큰 발급 완료');
        
        onRegistered(trimmedKey);
      } else {
        Alert.alert('오류', '라이선스 인증에 실패했습니다');
      }
    } catch (error) {
      logError('License authentication error:', error);
      Alert.alert('오류', '라이선스를 확인해주세요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="mb-8 text-2xl font-bold text-gray-800">라이선스 등록</Text>
      
      <TextInput
        className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
        placeholder="라이선스 키를 입력하세요"
        value={licenseKey}
        onChangeText={setLicenseKey}
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        className={`w-full rounded-lg py-3 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-center text-base font-semibold text-white">
          {loading ? '확인 중...' : '등록'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LicenseRegisterScreen;
