const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env) {
  const config = await createExpoWebpackConfigAsync(env);

  // Try to get mode from env or default to 'production'
  const mode = (env && env.mode) || 'production';

  if (mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
      },
    };
  }

  return config;
};
