import { Wallet, FileCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    step: "1",
    title: "連結錢包",
    description: "自動完成 KYC（SELF 資料驗證）"
  },
  {
    icon: FileCheck,
    step: "2",
    title: "選擇服務",
    description: "填寫基本資料並送出交易"
  },
  {
    icon: CheckCircle2,
    step: "3",
    title: "鏈上確認",
    description: "即時顯示交易紀錄與合約地址"
  }
];

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              如何運作
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            三步驟完成上鏈，簡單快速
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
              )}
              
              <div className="relative text-center">
                {/* Icon container with metallic effect */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-50"></div>
                  <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                    <step.icon className="relative z-10 h-12 w-12 text-purple-300" />
                  </div>
                  {/* Step number */}
                  <div className="absolute -bottom-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-slate-900">
                    <span className="text-white">{step.step}</span>
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="mb-3 text-slate-100">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
