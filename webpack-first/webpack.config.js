const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const config = require('./public/config')[isDev ? 'dev' : 'build']
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
/**
 * mini-css-extract-plugin和extract-text-webpack-plugin相比：
 * 1、异步加载
 * 2、不会重复编译（性能更好）
 * 3、更容易使用
 * 4、只适用CSS
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩css
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
/**
 * 按需加载使用import()语法，需要@babel/plugin-syntax-dynamic-import插件支持，@babel/preset-env预设中已经包含@babel/plugin-syntax-dynamic-import，所以不需要单独安装配置
 * 原理：
 * webpack遇到import(****)语法时：
 * 1、以****为入口新生成一个Chunk
 * 2、当代码执行到import所在的语句时，才会加载该Chunk所对应的文件
 */

const apiMocker = require('mocker-api')

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

const Happypack = require('happypack')

/**
 * HardSourceWebpackPlugin为模块提供中间缓存，缓存默认存放路径为node_modules/.cache/hard-source
 * 配置HardSourceWebpackPlugin，首次构建时间没有太大变化，第二次开始，构建时间节约80%
 */
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash:6].js',
    publicPath: '/' // 通常是CDN地址
  },
  devServer: {
    before(app) {
      // app.get('/user', (rep, res) => {
      //   res.json({ name: 'qtzx94' })
      // })
      apiMocker(app, path.resolve('./mock/mocker.js'))
    },
    // 解决跨域问题
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:4000',
    //     pathRewrite: {
    //       '/api': ''
    //     }
    //   }
    // },
    hot: true,
    port: '3003',
    quiet: false,
    inline: true,
    // stats: 'errors-only', // 终端仅打印error
    overlay: false,
    clientLogLevel: 'silent', // 日志等级
    compress: true // 是否启用gzip压缩
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheep-module-eval-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        use: 'Happypack/loader?id=js',
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets: ['@babel/preset-env'],
        //     // cacheDirectory用来缓存loader执行的结果，默认缓存目录：node_modules/.cache/babel-loader
        //     cacheDirectory: true,
        //     plugins: [
        //       [
        //         '@babel/plugin-transform-runtime',
        //         {
        //           corejs: 3
        //         }
        //       ]
        //     ]
        //   }
        // },
        exclude: /node_modules/
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          // 'style-loader', // style-loader动态创建style标签，将css插入到head中
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader', // css-loader负责处理@import等语句
          {
            loader: 'postcss-loader', // postcss-loader 和 autoprefixer自动生成浏览器兼容性前缀
            options: {
              plugins: function () {
                return [require('autoprefixer')()]
              }
            }
          },
          'less-loader' // 负责处理编译.less文件，将其转为css
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 10k 设置limit的值大小为10240，即资源大小小于10k时，将资源转换为base64，超过10K，将图片拷贝到dist目录（将资源转换为base64可以减少网络请求次数，但是base64数据骄傲，如果太多资源是base64，会导致加载变慢）
              esModule: false,
              name: '[name]_[hash:6].[ext]',
              outputPath: 'assets'
            }
          }
        ],
        exclude: /node_modules/
      }
      // {
      //   test: /.html$/,
      //   use: 'html-withimg-loader'
      // }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html', // 打包后的文件名
      config: config.template,
      minify: {
        removeAttributeQuotes: false, // 是否删除属性的双引号
        collapseWhitespace: false // 是否折叠空白
      }
      // hash: true // 是否加上hash, 默认是false
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] // 不删除dll目录下的文件
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: 'public/js/*.js',
    //       to: path.resolve(__dirname, 'dist', 'js'),
    //       flatten: true, // flatten设置为true，只会拷贝文件，不会把文件夹路径都拷贝上
    //       globOptions: {
    //         ignore: ['other.js'] // 无效
    //       }
    //     }
    //   ]
    // }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      publicPath: '../'
    }),
    new OptimizeCssPlugin(),
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
    new Happypack({
      id: 'js', // 和rule中的id=js对应
      use: ['babel-loader'] // 将之前rule中的loader在此配置
    }),
    new HardSourceWebpackPlugin(),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')
    })
  ],
  // 抽离公共代码，如果多个页面引入了一些公共模块，可以把这些模块抽离出来，单独打包，公共代码只需要一次下载就缓存起来了，避免重复下载
  optimization: {
    splitChunks: {
      // 分割代码块
      cacheGroups: {
        // 第三方依赖
        vendor: {
          priority: 1, // 设置优先级，首先抽离第三方模块
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          minSize: 0,
          minChunks: 1 // 最少引入了1次
        },
        // 缓存组
        common: {
          // 公共模块
          chunks: 'initial',
          name: 'common',
          minSize: 100, // 大小超过100个字节
          minChunks: 3 //最少引入了3次
        }
      }
    }
  }
}
