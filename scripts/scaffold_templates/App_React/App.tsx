import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { logInfo } from './src/utils/logger';

export default function App() {
	logInfo('App_React started');
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={{ padding: 24 }}>
				<Text style={{ fontSize: 24, fontWeight: '600' }}>App_React</Text>
				<Text style={{ marginTop: 8 }}>Expo + React Native scaffold</Text>
			</View>
		</SafeAreaView>
	);
}
