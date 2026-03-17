const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force socket.io-client to use CJS build (ESM not supported by Metro)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'socket.io-client') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/socket.io-client/build/cjs/index.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
