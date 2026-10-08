import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 同一ネットワーク内の別PCから開発サーバーを開けるようにする（社内LANのプライベートIP）
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
};

export default nextConfig;
