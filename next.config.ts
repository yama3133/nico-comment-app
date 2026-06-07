import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 親ディレクトリの lockfile を誤検出しないよう、このプロジェクトをルートに固定
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
