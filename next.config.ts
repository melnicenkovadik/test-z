import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import webpack from "webpack";

const withNextIntl = createNextIntlPlugin("./src/providers/i18n/request.ts");
// const withBundle = withBundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig: NextConfig = {
  output: "standalone",
  sassOptions: {
    includePaths: ["src"],
  },
  reactStrictMode: true,
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  productionBrowserSourceMaps: true,
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["src"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve("process/browser"),
      };
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve("process"),
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      vm: require.resolve("vm-browserify"),
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_ENVIRONMENT_ID,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
};
export default withNextIntl(nextConfig);
// export default withNextIntl(withBundle(nextConfig));
