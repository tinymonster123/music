// next.config.ts
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";
import path from "path";
import CompressionPlugin from "compression-webpack-plugin";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const zlib = require("zlib");

const withTM = transpileModules(["ssh2"]);

const nextConfig: NextConfig = withTM({
  output: "standalone",
  compress: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeServerReact: true,
    optimizeCss: true,
    turbo: {
      rules: {
        // 对于 ts、tsx、js、jsx 文件，默认使用 SWC 编译器的能力
        // 如果有特殊 loader 需求可以在这里配置，例如：
        "\\.(ts|tsx|js|jsx)$": {
          loaders: ["swc-loader"],
        },
        // 对于 SVG 文件，用 SVGR 处理
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
        "\\.css$": {
          loaders: ["style-loader", "css-loader", "postcss-loader"],
        },
      },
    },
  },
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/webp"],
  },
  productionBrowserSourceMaps: false,

  webpack(config: WebpackConfig, { dev, isServer }) {
    config.module = config.module ?? {};
    config.module.rules = config.module.rules ?? [];
    
    // Improved SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // 客户端配置
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          ssh2: false,
          stream: require.resolve("stream-browserify"),
        },
      };

      // 为所有 CSS 文件应用 postcss-loader，包括全局 CSS 和模块 CSS
      config.module.rules.push({
        test: /\.css$/i,
        use: [
          dev ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                auto: true, // 自动检测是否为 CSS 模块
                localIdentName: "[local]__[hash:base64:5]",
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js"),
              },
            },
          },
        ], 
      });

      // 添加 Plugin
      config.plugins = [
        ...(config.plugins || []),
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
          ignoreOrder: true,
        }),
        new CompressionPlugin({
          filename: "[path][base].br",
          algorithm: "brotliCompress",
          test: /\.(js|css|html|svg)$/,
          compressionOptions: {
            level: 11,
          },
          threshold: 10240,
          minRatio: 0.8,
          deleteOriginalAssets: false,
        }),
      ];

      // 添加 optimization
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } else {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "ssh2",
        "sharp",
        "canvas",
      ];
    }

    return config;
  },
});

export default nextConfig;
