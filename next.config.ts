import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      },
    },
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
          },
        },
      ],
    });

    return config;
  },
  // optimizeFonts:true,
};

export default nextConfig;
