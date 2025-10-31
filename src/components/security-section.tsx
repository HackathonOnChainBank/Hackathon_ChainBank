import { Card } from "./ui/card";
import { Shield, Lock, Database } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "智能合約公開",
    description: "所有合約於 Celo Blockscout 公開驗證"
  },
  {
    icon: Lock,
    title: "完整合規驗證",
    description: "支援 KYC / OFAC / AML 驗證機制"
  },
  {
    icon: Database,
    title: "加密資料儲存",
    description: "資料儲存於 Walrus 加密層，確保隱私"
  }
];

export function SecuritySection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 mb-6">
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              安全與合規
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            企業級安全標準，符合國際金融監管要求
          </p>
        </div>
        
        {/* Security features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-700/50 backdrop-blur-sm p-8 group hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <feature.icon className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="mb-3 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-400" />
            </div>
            <span>ISO 27001 認證</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <span>SOC 2 Type II</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Database className="h-4 w-4 text-purple-400" />
            </div>
            <span>GDPR 合規</span>
          </div>
        </div>
      </div>
    </section>
  );
}
