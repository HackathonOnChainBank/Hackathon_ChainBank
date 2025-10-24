import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia, celo } from "wagmi/chains";
import { defineChain } from "viem";

// 自定義 Celo Sepolia 測試鏈
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia Testnet",
  network: "celo-sepolia",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    public: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" },
  },
});

// 建立 wagmi 設定
export const config = getDefaultConfig({
  appName: "RWA 銀行系統",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  ssr: false,
  chains: [mainnet, sepolia, celo, celoSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [celo.id]: http("https://forno.celo.org"),
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
  },
});
