import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "RWA 銀行系統",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, sepolia],
  ssr: false,
  transports: {
    [mainnet.id]: http(), // 使用公共 RPC
    [sepolia.id]: http(), // 使用公共 RPC
  },
});
