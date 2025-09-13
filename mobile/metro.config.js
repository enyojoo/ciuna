const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for workspace packages
config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths,
  '../../node_modules',
];

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
