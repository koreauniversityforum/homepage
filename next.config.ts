import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/recruitment/17th",
        destination:
          "https://docs.google.com/forms/d/e/1FAIpQLSf-xiY9-tbXXEXlM1GWrLvauC4hP8yNgTrU0_AeM1uLro1uGw/viewform",
        // Keep the printed QR URL stable while allowing its destination to change.
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
