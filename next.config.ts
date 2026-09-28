import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // The default bottom-left indicator sits on top of the sidebar's role switcher.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
