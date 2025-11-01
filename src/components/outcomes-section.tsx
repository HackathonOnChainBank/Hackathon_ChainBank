import { Card } from "./ui/card";
import { Eye, Zap, Shield } from "lucide-react";

const outcomes = [
  {
    icon: Eye,
    title: "交易透明",
    description: "所有紀錄公開可查",
    metric: "100%",
    metricLabel: "可驗證"
  },
  {
    icon: Zap,
    title: "利息自動化",
    description: "智能合約自動派息",
    metric: "24/7",
    metricLabel: "不間斷"
  },
  {
    icon: Shield,
    title: "轉帳零誤差",
    description: "映射帳號系統防止錯帳",
    metric: "0",
    metricLabel: "失誤率"
  }
];

export function OutcomesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              實際成果
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            以區塊鏈技術帶來的核心優勢
          </p>
        </div>
        
        {/* Outcomes grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {outcomes.map((outcome, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 hover:border-purple-500/50 transition-all duration-300 group"
            >
              {/* Gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <outcome.icon className="h-8 w-8 text-purple-300" />
                </div>
                
                {/* Metric */}
                <div className="mb-4">
                  <div className="text-5xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1">
                    {outcome.metric}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {outcome.metricLabel}
                  </div>
                </div>
                
                {/* Title and description */}
                <h3 className="mb-2 text-slate-100">{outcome.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {outcome.description}
                </p>
              </div>
              
              {/* Metallic shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
