import image_550763c6bd405bb0e462640703893cfcc371a345 from 'figma:asset/550763c6bd405bb0e462640703893cfcc371a345.png';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Coins, QrCode, TrendingUp } from "lucide-react";
import { useState } from "react";

export function CreditCardSpendingPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
              NTD 幣本位 信用卡消費
            </span>
          </h1>
          <p className="text-slate-400 text-lg">以 NTD Token 為基礎的創新消費體驗</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Login Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Coins className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">登入查看消費紀錄</h2>
            </div>

            <div className="space-y-6">
              {/* Account input */}
              <div className="space-y-2">
                <Label htmlFor="spending-account" className="text-slate-300">帳號</Label>
                <Input
                  id="spending-account"
                  type="text"
                  placeholder="請輸入您的帳號"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="spending-password" className="text-slate-300">密碼</Label>
                <Input
                  id="spending-password"
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
                登入查看
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

        {/* Features info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h3 className="text-slate-100">即時追蹤</h3>
            </div>
            <p className="text-slate-400 text-sm">查看所有消費紀錄與餘額</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Coins className="h-5 w-5 text-blue-400" />
              <h3 className="text-slate-100">NTD 計價</h3>
            </div>
            <p className="text-slate-400 text-sm">以穩定的 NTD Token 消費</p>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-400"></div>
              <h3 className="text-slate-100">鏈上驗證</h3>
            </div>
            <p className="text-slate-400 text-sm">所有交易可於區塊鏈驗證</p>
          </Card>
        </div>

        {/* Spending overview placeholder */}
        <Card className="mt-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
          <h3 className="text-slate-100 mb-6">消費概覽</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">本月消費總額</p>
              <p className="text-3xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NT$ ---
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">可用額度</p>
              <p className="text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                NT$ ---
              </p>
            </div>
          </div>
          <div className="mt-8 p-6 rounded-xl bg-slate-800/30 border border-slate-700 text-center">
            <p className="text-slate-400">請登入查看完整消費紀錄與分析</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
