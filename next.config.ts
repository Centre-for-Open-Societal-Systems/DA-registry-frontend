import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // The default bottom-left indicator sits on top of the sidebar's role switcher.
  devIndicators: {
    position: "bottom-right",
  },
  // Knowledge Base video covers are YouTube thumbnails.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
};

export default nextConfig;
