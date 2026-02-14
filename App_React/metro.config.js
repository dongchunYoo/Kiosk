// Metro configuration for Expo
//
// Fixes resolution of packages that rely on package.json "exports" conditions
// (e.g. axios) by enabling package exports and adding the "react-native"
// condition for native platforms.
// Also configures NativeWind v4 CSS transformer.

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

// Prefer React Native entry points when available.
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Enable and configure "exports" condition resolution.
config.resolver.unstable_enablePackageExports = true;

config.resolver.unstable_conditionsByPlatform = {
  ...(config.resolver.unstable_conditionsByPlatform || {}),
  android: ['react-native'],
  ios: ['react-native'],
  native: ['react-native'],
};

module.exports = withNativeWind(config, { input: './global.css' });
