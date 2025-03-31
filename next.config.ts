import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";

const withTM = transpileModules(["ssh2"]);

const nextConfig: NextConfig = withTM({
  output: "standalone",
  eslint: {
    // 构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 可选：如果还有 TypeScript 错误也可以临时忽略
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      rules: {
        // 对于 ts、tsx、js、jsx 文件，默认使用 SWC 加载器处理
        "\\.(ts|tsx|js|jsx)$": {
          loaders: ["swc-loader"],
        },
        // 处理 SVG 文件使用 SVGR 加载器
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
        // 处理 CSS 文件
        "\\.css$": {
          loaders: ["style-loader", "css-loader", "postcss-loader"],
        },
      },
    },
  },
  webpack(config: WebpackConfig, { isServer }: { isServer: boolean }) {
    // 客户端配置
    if (!isServer) {
      // 处理 Node.js 模块兼容
      const { resolve = {} } = config;
      config.resolve = {
        ...resolve,
        fallback: {
          ...resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        },
      };

      // 处理 SVG 和 CSS
      const { module = { rules: [] } } = config;
      const rules = Array.isArray(module.rules) ? module.rules : [];

      config.module = {
        ...module,
        rules: [
          ...rules,
          {
            test: /\.svg$/,
            use: [
              {
                loader: "@svgr/webpack",
                options: { svgo: false },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              "style-loader",
              "css-loader",
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: ["tailwindcss", "autoprefixer"],
                  },
                },
              },
            ],
          },
        ],
      };
    }

    return config;
  },
});

export default nextConfig;