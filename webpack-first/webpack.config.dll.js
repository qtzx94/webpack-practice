// webpack.config.dll.js配置文件专门用来编译动态链接库，这里我们将react和react-dom单独打包成一个动态链接库

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    react: ['react', 'react-dom']
  },
  mode: 'production',
  output: {
    filename: '[name].dll.[hash:6].js',
    path: path.resolve(__dirname, 'dist', 'dll'),
    library: '[name]_dll' // 暴露给外部使用
    // libraryTarget指定如何暴露内容，缺省时就是var
  },
  plugins: [
    // 使用DllPlugin（webpack内置模块）将不会频繁更新的库进行编译，当这些依赖的版本没有变化时，就不需要重新编译
    new webpack.DllPlugin({
      // name和library一致
      name: '[name]_dll',
      path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json') // 将动态链接库单独放在dll目录下，当使用CleanWebpackPlugin时，更方便的过滤动态链接库，manifest.json用于让DLLReferencePlugin映射到相关依赖上
    })
  ]
}
