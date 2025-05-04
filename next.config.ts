import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";
import path from "path";

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
    // Ensure config.module and config.module.rules exist
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // SVG 处理配置
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // 客户端配置
    if (!isServer) {
      // 添加 resolve fallbacks
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

      // CSS 文件处理配置
      config.module.rules.push({
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["tailwindcss", "autoprefixer"],
              },
            },
          },
        ],
      });
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
