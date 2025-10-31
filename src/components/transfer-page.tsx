import image_550763c6bd405bb0e462640703893cfcc371a345 from 'figma:asset/550763c6bd405bb0e462640703893cfcc371a345.png';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Lock, QrCode, Users, Star, ArrowRight } from "lucide-react";
import { useState } from "react";

export function TransferPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              NTD 轉帳服務
            </span>
          </h1>
          <p className="text-slate-400 text-lg">快速、安全的鏈上轉帳體驗</p>
        </div>

        <div className="space-y-6">
          {/* Card 1: Login */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <Lock className="h-6 w-6 text-purple-300" />
                </div>
                <h2 className="text-2xl text-slate-100">登入您的帳戶</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account input */}
                  <div className="space-y-2">
                    <Label htmlFor="transfer-account" className="text-slate-300">帳號</Label>
                    <Input
                      id="transfer-account"
                      type="text"
                      placeholder="請輸入您的帳號"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>

                  {/* Password input */}
                  <div className="space-y-2">
                    <Label htmlFor="transfer-password" className="text-slate-300">密碼</Label>
                    <Input
                      id="transfer-password"
                      type="password"
                      placeholder="請輸入您的密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
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
                  登入
                </Button>
              </div>
            </Card>

            {/* QR Code Card */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <QrCode className="h-6 w-6 text-purple-300" />
                </div>
                <h3 className="text-slate-100">掃描 QR Code</h3>
                <p className="text-slate-400 text-sm">快速登入</p>
                
                {/* QR Code placeholder */}
                <div className="w-full aspect-square max-w-[180px] rounded-xl overflow-hidden border-2 border-purple-500/30 bg-slate-800">
                  <ImageWithFallback
                    src={image_550763c6bd405bb0e462640703893cfcc371a345}
                    alt="QR Code"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Card 2: Select/Enter Recipient */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Users className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">選擇或輸入接收者</h2>
            </div>

            <div className="space-y-6">
              {/* Recipient input */}
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-slate-300">接收者帳號 ID</Label>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="請輸入接收者的帳號 ID"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Quick access buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 hover:bg-purple-900/30"
                >
                  <Star className="mr-2 h-4 w-4" />
                  約定轉帳帳戶
                </Button>
                <Button 
                  variant="outline"
                  className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:bg-blue-900/30"
                >
                  <Users className="mr-2 h-4 w-4" />
                  常用轉帳名單
                </Button>
              </div>

              {/* Recent recipients */}
              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-3">最近轉帳對象</p>
                <div className="space-y-2">
                  {['王小明 (ID: 0x1234...5678)', '李大華 (ID: 0xabcd...ef01)', '陳美麗 (ID: 0x9876...4321)'].map((contact, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                      onClick={() => setRecipient(contact.split('(ID: ')[1].replace(')', ''))}
                    >
                      <span className="text-slate-300 text-sm">{contact}</span>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Confirm Transfer Amount */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <ArrowRight className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">確認轉帳金額</h2>
            </div>

            <div className="space-y-6">
              {/* Amount input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">轉帳金額 (NTD)</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500 text-2xl pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">NTD</span>
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>

              {/* Transfer summary */}
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">手續費</span>
                  <span className="text-slate-300">NT$ 0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">預計到達時間</span>
                  <span className="text-slate-300">即時</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-slate-100">實際轉出金額</span>
                  <span className="text-slate-100">NT$ {amount || '0.00'}</span>
                </div>
              </div>

              {/* Confirm button */}
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                size="lg"
                disabled={!recipient || !amount}
              >
                確認轉帳
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
