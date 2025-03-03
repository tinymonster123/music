import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import transpileModules from "next-transpile-modules";

const withTM = transpileModules(["ssh2"]);

const nextConfig: NextConfig = withTM({
  experimental: {
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
  /* config options here */
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     use: [
  //       {
  //         loader: "@svgr/webpack",
  //         options: {
  //           svgo: false,
  //         },
  //       },
  //     ],
  //   });

  //   return config;
  // },
  webpack(config: WebpackConfig, { isServer }: { isServer: boolean }) {
    // 仅客户端配置
    if (!isServer) {
      // 配置 Node.js 模块兼容
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

      // 配置 SVG 处理
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
