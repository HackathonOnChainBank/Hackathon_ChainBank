import { Card } from "./ui/card";
import { Coins, CreditCard, ArrowLeftRight, PiggyBank } from "lucide-react";

const services = [
  {
    icon: Coins,
    title: "NTD Token",
    description: "ERC20 新台幣代幣，支援全鏈轉帳。",
    gradient: "from-purple-500/20 to-blue-500/20"
  },
  {
    icon: CreditCard,
    title: "虛擬信用卡",
    description: "即時核發、鏈上紀錄、低 gas 確認。",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: ArrowLeftRight,
    title: "鏈上轉帳",
    description: "支援約定/常用帳戶，一鍵 MetaMask 操作。",
    gradient: "from-cyan-500/20 to-purple-500/20"
  },
  {
    icon: PiggyBank,
    title: "定存合約",
    description: "5% 固定利率，可續存或自動返息。",
    gradient: "from-purple-500/20 to-pink-500/20"
  }
];

export function ServicesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              核心服務
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            完整的鏈上金融基礎設施，讓傳統銀行服務無縫接軌 Web3
          </p>
        </div>
        
        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 p-6"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
                  <service.icon className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="mb-2 text-slate-100">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
