import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "免費開戶",
    price: "0",
    period: "永久免費",
    description: "開始體驗區塊鏈金融服務",
    features: [
      "基本 NTD Token 轉帳",
      "虛擬信用卡核發（1 張）",
      "標準 gas 費用",
      "基礎客服支援",
      "交易紀錄查詢"
    ],
    cta: "免費開始",
    popular: false
  },
  {
    name: "高級用戶",
    price: "299",
    period: "每月",
    description: "進階功能與更低手續費",
    features: [
      "所有免費功能",
      "低 gas 優先處理",
      "自動化財務報表",
      "無限制虛擬信用卡",
      "定存利率加碼 +0.5%",
      "24/7 優先客服",
      "API 串接支援"
    ],
    cta: "升級至高級",
    popular: true
  }
];

export function PricingSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              選擇您的方案
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            從免費開戶開始，隨時升級至高級功能
          </p>
        </div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 scale-105' 
                  : 'bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50'
              } backdrop-blur-sm`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm">
                    <Sparkles className="h-3 w-3" />
                    <span>最受歡迎</span>
                  </div>
                </div>
              )}
              
              {/* Plan header */}
              <div className="mb-8">
                <h3 className="text-2xl text-slate-100 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    NT$ {plan.price}
                  </span>
                  <span className="text-slate-500">/ {plan.period}</span>
                </div>
                <p className="text-slate-400">{plan.description}</p>
              </div>
              
              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                        <Check className="h-3 w-3 text-purple-300" />
                      </div>
                    </div>
                    <span className="text-slate-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA button */}
              <Button 
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0'
                    : 'bg-white/5 hover:bg-white/10 border border-slate-600'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
              
              {/* Shine effect */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shine"></div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
