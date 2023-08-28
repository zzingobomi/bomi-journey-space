const path = require("path");
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(appDirectory, "src/index.ts"),
  output: {
    filename: "js/bundle.js",
    clean: true,
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      console: false,
      assert: false,
      util: false,
    },
    alias: {},
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            //sourceMap: true,
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public/", to: "./" }],
    }),
    //new BundleAnalyzerPlugin()
  ],
  mode: "development",
};
