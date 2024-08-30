// Learn more https://docs.expo.dev/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config')
const path = require('path')

const cfg = getDefaultConfig(__dirname)

// Append custom source extensions from environment variable if provided
cfg.resolver.sourceExts = process.env.RN_SRC_EXT
  ? process.env.RN_SRC_EXT.split(',').concat(cfg.resolver.sourceExts)
  : cfg.resolver.sourceExts

// Ensure .cjs is handled as a JavaScript file and not as an asset
cfg.resolver.sourceExts.push('cjs')

// Remove .cjs from asset extensions if present
cfg.resolver.assetExts = cfg.resolver.assetExts.filter(ext => ext !== 'cjs')

// Explicitly define extraNodeModules for bn.js and others
cfg.resolver.extraNodeModules = {
  ...cfg.resolver.extraNodeModules,
  'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
  crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  assert: path.resolve(__dirname, 'node_modules/assert/'),
  ...require('node-libs-react-native'), // Maintain node compatibility
}

cfg.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
    nonInlinedRequires: [
      'React',
      'react',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'react-native',
    ],
  },
})

module.exports = cfg
