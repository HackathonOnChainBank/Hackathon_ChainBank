import { Card } from "./ui/card";
import { Quote } from "lucide-react";

export function SocialProofSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              合作夥伴信賴
            </span>
          </h2>
        </div>
        
        {/* Testimonial */}
        <Card className="max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-12">
          {/* Quote icon background */}
          <div className="absolute top-8 right-8 opacity-10">
            <Quote className="h-32 w-32 text-purple-400" />
          </div>
          
          <div className="relative z-10">
            {/* Quote icon */}
            <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Quote className="h-6 w-6 text-purple-300" />
            </div>
            
            {/* Testimonial text */}
            <blockquote className="text-2xl sm:text-3xl text-slate-200 mb-8 leading-relaxed">
              「RWA Bank 讓我們在 30 秒內完成上鏈轉帳」
            </blockquote>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
              <div>
                <div className="text-slate-300">Web3 金融開發者</div>
                <div className="text-slate-500 text-sm">區塊鏈金融服務專家</div>
              </div>
            </div>
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shine"></div>
        </Card>
        
        {/* Partner logos */}
        <div className="mt-16">
          <p className="text-center text-slate-500 mb-8">受到領先機構的信賴</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-32 h-16 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center"
              >
                <div className="text-slate-600">PARTNER</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
