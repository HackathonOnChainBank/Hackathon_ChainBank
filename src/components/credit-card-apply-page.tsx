import image_550763c6bd405bb0e462640703893cfcc371a345 from 'figma:asset/550763c6bd405bb0e462640703893cfcc371a345.png';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CreditCard, QrCode, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function CreditCardApplyPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
              RWA 信用卡 遨遊世界
            </span>
          </h1>
          <p className="text-slate-400 text-lg">區塊鏈支付的全新體驗，讓您的消費更自由</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Login Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <CreditCard className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">登入申請信用卡</h2>
            </div>

            <div className="space-y-6">
              {/* Account input */}
              <div className="space-y-2">
                <Label htmlFor="card-account" className="text-slate-300">帳號</Label>
                <Input
                  id="card-account"
                  type="text"
                  placeholder="請輸入您的帳號"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="card-password" className="text-slate-300">密碼</Label>
                <Input
                  id="card-password"
                  type="password"
                  placeholder="請輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <a href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  忘記密碼？
                </a>
              </div>

              {/* Login button */}
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                size="lg"
              >
                登入並申請
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-slate-400">或</span>
                </div>
              </div>

              {/* Alternative login info */}
              <div className="text-center text-slate-400 text-sm">
                使用 QR Code 快速登入 →
              </div>
            </div>
          </Card>

          {/* QR Code Card */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <QrCode className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-slate-100">掃描 QR Code</h3>
              <p className="text-slate-400 text-sm">使用手機快速登入</p>
              
              {/* QR Code placeholder */}
              <div className="w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border-2 border-purple-500/30 bg-slate-800">
                <ImageWithFallback
                  src={image_550763c6bd405bb0e462640703893cfcc371a345}
                  alt="QR Code"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-slate-500 text-xs">
                QR Code 每 60 秒更新一次
              </p>
            </div>
          </Card>
        </div>

        {/* Card benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
            <h3 className="text-slate-100 mb-2">全球通用</h3>
            <p className="text-slate-400 text-sm">支援全球商家，隨處消費</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6">
            <h3 className="text-slate-100 mb-2">即時核發</h3>
            <p className="text-slate-400 text-sm">申請後立即取得虛擬卡</p>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 p-6">
            <h3 className="text-slate-100 mb-2">低手續費</h3>
            <p className="text-slate-400 text-sm">優惠的交易手續費率</p>
          </Card>
        </div>

        {/* Risk Warning Card */}
        <Card className="mt-8 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 backdrop-blur-sm p-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-100 mb-3">信用卡風險提醒</h3>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>• <strong>負責任消費：</strong>請根據您的還款能力合理使用信用卡，避免過度消費。</p>
                <p>• <strong>準時還款：</strong>延遲還款將產生利息費用，並可能影響您的信用評分。</p>
                <p>• <strong>保護卡片資訊：</strong>請妥善保管您的信用卡號、CVV 碼及相關密碼，避免洩露給他人。</p>
                <p>• <strong>注意詐騙：</strong>如遇可疑交易或詐騙情況，請立即聯繫客服並凍結卡片。</p>
                <p>• <strong>了解費用：</strong>使用前請詳閱信用卡條款，了解相關手續費、利率及其他費用。</p>
                <p>• <strong>智能合約風險：</strong>雖然我們的智能合約已經過審計，但仍存在技術風險，請謹慎使用。</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
