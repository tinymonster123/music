import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";

const withTM = transpileModules(["ssh2"]);

const nextConfig: NextConfig = withTM({
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 添加以下配置
  compiler: {
    // 启用 CSS 优化
    minify: true,
    // 确保 React 删除属性正确应用
    removeConsole: process.env.NODE_ENV === "production",
  },
  // 可选：更改 PostCSS 配置
  postcssLoaderOptions: {
    implementation: require("postcss"),
    postcssOptions: {
      plugins: ["tailwindcss", "autoprefixer"],
    },
  },
  // 确保 CSS 模块支持全局样式
  cssModules: {
    auto: true,
  },
  experimental: {
    turbo: {
      rules: {
        "\\.(ts|tsx|js|jsx)$": {
          loaders: ["swc-loader"],
        },
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
          ssh2: false,
        },
      };

      // SVG 和 CSS 处理
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
    } else {
      // 服务器端配置 - 关键修改在这里

      // 服务器端配置
      // @ts-ignore - 忽略 webpack externals 类型问题
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "ssh2",
      ];
      // 添加处理 .node 文件的 loader
      const { module = { rules: [] } } = config;
      const rules = Array.isArray(module.rules) ? module.rules : [];

      config.module = {
        ...module,
        rules: [
          ...rules,
          {
            test: /\.node$/,
            use: "node-loader",
          },
        ],
      };
    }

    return config;
  },
});

export default nextConfig;
