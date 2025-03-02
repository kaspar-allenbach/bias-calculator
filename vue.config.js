module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/my-vue-app/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: true
  }
};