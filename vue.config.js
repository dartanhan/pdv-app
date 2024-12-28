 const { defineConfig } = require('@vue/cli-service')
 const path = require('path');
 
 module.exports = defineConfig({
   transpileDependencies: true,
   configureWebpack: {
    resolve: {
      fallback: {
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "zlib": require.resolve("browserify-zlib"),
      }
    }
  }
 });
