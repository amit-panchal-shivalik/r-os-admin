module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add @ alias support
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
      return webpackConfig;
    },
  },
};
