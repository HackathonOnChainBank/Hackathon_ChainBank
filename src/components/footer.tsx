import { Wallet } from "lucide-react";

const footerLinks = {
  product: {
    title: "產品",
    links: [
      { name: "NTD Token", href: "#" },
      { name: "虛擬信用卡", href: "#" },
      { name: "鏈上轉帳", href: "#" },
      { name: "定存服務", href: "#" }
    ]
  },
  resources: {
    title: "資源",
    links: [
      { name: "技術文件", href: "#" },
      { name: "API 文件", href: "#" },
      { name: "智能合約", href: "#" },
      { name: "安全公告", href: "#" }
    ]
  },
  company: {
    title: "公司",
    links: [
      { name: "關於我們", href: "#" },
      { name: "聯絡方式", href: "#" },
      { name: "職涯機會", href: "#" },
      { name: "新聞中心", href: "#" }
    ]
  },
  legal: {
    title: "法律",
    links: [
      { name: "服務條款", href: "#" },
      { name: "隱私政策", href: "#" },
      { name: "Cookie 政策", href: "#" },
      { name: "合規聲明", href: "#" }
    ]
  }
};

const wallets = [
  { name: "MetaMask", icon: "🦊" },
  { name: "Rabby", icon: "🐰" },
  { name: "OKX Wallet", icon: "⭕" }
];

export function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-slate-800">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
                RWA Bank
              </span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              將傳統金融服務搬上區塊鏈，讓新台幣無縫接軌 Web3 世界。
            </p>
            
            {/* Wallet support */}
            <div className="space-y-3">
              <p className="text-slate-500 text-sm">支援錢包</p>
              <div className="flex flex-wrap gap-2">
                {wallets.map((wallet, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-400"
                  >
                    <span>{wallet.icon}</span>
                    <span>{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-slate-300 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-slate-500 hover:text-purple-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom bar */}
        <div className="py-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 RWA Bank. 版權所有。
            </p>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-purple-400 transition-colors">
                Celo Blockscout
              </a>
              <span>•</span>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Walrus Storage
              </a>
              <span>•</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>系統正常運作</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
