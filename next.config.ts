// next.config.ts
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";
import path from "path";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const withTM = transpileModules(["ssh2"]);

const nextConfig: NextConfig = withTM({
  output: "standalone",
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
  },
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/webp"],
  },
  productionBrowserSourceMaps: false,

  webpack(config: WebpackConfig, { dev, isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
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
      ];
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