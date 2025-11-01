import { Button } from "./ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient with metallic effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      </div>
      
      {/* Animated metallic waves */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl tracking-tight">
            <span className="block bg-gradient-to-r from-slate-200 via-purple-200 to-slate-200 bg-clip-text text-transparent">
              讓新台幣上鏈
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
            發卡、轉帳、定存，一站完成的 RWA 銀行
          </p>
          
          <p className="text-slate-400 text-lg mb-8">
            <span style={{ color: 'initial' }}>💰</span> 安全、透明、去中心化的銀行服務
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
              onClick={() => navigate('/register')}>
              <Wallet className="mr-2 h-5 w-5" />
              立即開通 NTD 錢包
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="pt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Celo 區塊鏈</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>智能合約驗證</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>KYC 認證</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
