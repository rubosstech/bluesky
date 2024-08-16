// Learn more https://docs.expo.io/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config')
const cfg = getDefaultConfig(__dirname)

cfg.resolver.sourceExts = process.env.RN_SRC_EXT
  ? process.env.RN_SRC_EXT.split(',').concat(cfg.resolver.sourceExts)
  : cfg.resolver.sourceExts

cfg.resolver.sourceExts.push('cjs')

cfg.resolver.assetExts = cfg.resolver.assetExts.filter(e => e !== 'cjs')

cfg.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
    nonInlinedRequires: [
      // We can remove this option and rely on the default after
      // https://github.com/facebook/metro/pull/1126 is released.
      'React',
      'react',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'react-native',
    ],
  },
})

cfg.resolver.extraNodeModules = require('node-libs-react-native')

console.log(cfg)

module.exports = cfg
