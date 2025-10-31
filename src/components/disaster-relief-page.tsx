import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

export function DisasterReliefPage() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const contractAddress = "0x37ACE2979C7d6c395AF0D3f400a878fA858b724a";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              災難救助申請
            </span>
          </h1>
          <p className="text-slate-400 text-lg">透過區塊鏈技術提供快速、透明的災難救助服務</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - 25% */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6 sticky top-24">
              <h3 className="text-slate-100 mb-4">申請條件</h3>
              
              <ul className="space-y-3 mb-6">
                {[
                  '年滿 18 歲',
                  '非聯邦制裁地居民',
                  '通過 Self Protocol 認證',
                  '每個身分只能驗證一次'
                ].map((condition, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-700 pt-4 mb-4">
                <h4 className="text-slate-100 text-sm mb-2">合約地址</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 justify-between text-xs font-mono"
                    onClick={copyToClipboard}
                  >
                    <span className="truncate">{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</span>
                    <Copy className="h-3 w-3 flex-shrink-0 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-slate-100 text-sm mb-2">網路</h4>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Celo Sepolia Testnet</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right main area - 75% */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
              <div className="space-y-6">
                {/* Status indicator */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">當前狀態</div>
                    <div className="text-slate-200 capitalize">{status}</div>
                  </div>
                </div>

                {/* Identity verification card */}
                <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20">
                      <CheckCircle2 className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-100 mb-2">身分驗證</h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        使用 Self Protocol 進行去中心化身分驗證，確保您的隱私安全。驗證過程完全在鏈上進行，無需提供敏感個人資料。
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                        onClick={() => setStatus('verifying')}
                        disabled={status === 'verified'}
                      >
                        {status === 'verified' ? '已完成驗證' : '開始驗證'}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Relief plan selection card */}
                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                      <AlertCircle className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-100 mb-2">選擇救助計畫</h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        根據您的需求選擇合適的救助計畫。每個計畫都有不同的額度和使用條件，請仔細閱讀說明後選擇。
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button 
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                          disabled={status !== 'verified'}
                        >
                          緊急救助 (最高 NT$ 10,000)
                        </Button>
                        <Button 
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                          disabled={status !== 'verified'}
                        >
                          生活補助 (最高 NT$ 30,000)
                        </Button>
                        <Button 
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                          disabled={status !== 'verified'}
                        >
                          醫療補助 (最高 NT$ 50,000)
                        </Button>
                        <Button 
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
                          disabled={status !== 'verified'}
                        >
                          住房重建 (最高 NT$ 100,000)
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Important notices */}
                <div className="mt-8 p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <h4 className="text-slate-100">注意事項</h4>
                  </div>
                  <ul className="space-y-3 text-slate-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>請確保已連接錢包並切換到 Celo Sepolia 網路</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>驗證過程需要使用 Self Protocol App</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>救助金將直接發送到您連接的錢包地址</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>請妥善保管您的錢包私鑰</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>交易需要支付少量 gas fee（CELO）</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
