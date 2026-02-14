module.exports = function (api) {
  api.cache(true);

  // NativeWind v4's `nativewind/babel` currently re-exports
  // `react-native-css-interop/babel`, which is a *preset* (returns { plugins: [...] }).
  // If used under `plugins`, Babel throws: ".plugins is not a valid Plugin property".
  //
  // So we:
  // 1) Keep the Metro RN preset as base
  // 2) Disable Metro preset's built-in JSX transform
  // 3) Add css-interop's plugin + our own JSX transform with importSource
  // 4) Keep reanimated plugin last
  const cssInteropPluginModule = require('react-native-css-interop/dist/babel-plugin');
  const cssInteropPlugin = cssInteropPluginModule.default || cssInteropPluginModule;

  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        {
          useTransformReactJSXExperimental: true,
        },
      ],
    ],
    plugins: [
      cssInteropPlugin,
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: 'react-native-css-interop',
        },
      ],
      // Some deps (e.g. @tanstack/query-core) ship modern private fields/methods.
      // Ensure Metro/Babel can transform them for the target runtime.
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      'react-native-reanimated/plugin',
    ],
  };
};