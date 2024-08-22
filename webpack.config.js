const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const {withAlias} = require('@expo/webpack-config/addons')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const webpack = require('webpack')

const GENERATE_STATS = process.env.EXPO_PUBLIC_GENERATE_STATS === '1'
const OPEN_ANALYZER = process.env.EXPO_PUBLIC_OPEN_ANALYZER === '1'

const reactNativeWebWebviewConfiguration = {
  test: /postMock.html$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
}

module.exports = async function (env, argv) {
  let config = await createExpoWebpackConfigAsync(env, argv)

  config = withAlias(config, {
    'react-native$': 'react-native-web',
    'react-native-webview': 'react-native-web-webview',
  })

  config.module.rules = [
    ...(config.module.rules || []),
    reactNativeWebWebviewConfiguration,
  ]

  // Add support for .cjs files
  config.module.rules.push({
    test: /\.cjs$/,
    type: 'javascript/auto',
    use: {
      loader: 'babel-loader',
      options: {
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    },
  })

  if (env.mode === 'development') {
    config.plugins.push(new ReactRefreshWebpackPlugin())
  }

  if (GENERATE_STATS || OPEN_ANALYZER) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        openAnalyzer: OPEN_ANALYZER,
        generateStatsFile: true,
        statsFilename: '../stats.json',
        analyzerMode: OPEN_ANALYZER ? 'server' : 'json',
        defaultSizes: 'parsed',
      }),
    )
  }

  // Force Webpack to treat bs58check as a CommonJS module
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    bs58check: require.resolve('bs58check'),
  }

  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
  }

  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
      // crypto: 'crypto-browserify',
    }),
  )

  return config
}
