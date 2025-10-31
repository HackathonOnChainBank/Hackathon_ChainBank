import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';

// 定義 WalletInfo 接口
interface WalletInfo {
  fullName: string;
  country: string;
  dateOfBirth: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
  uuid: string;
  shortUuid: string;
  walletAddress: string;
  passwordHash: string;
  network: string;
  chainId: number;
  privateKey: string;
  mnemonic: string;
}

export function DisasterReliefPage() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'opening_self' | 'verification_cancelled' | 'sending_tx' | string>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const contractAddress = "0x37ACE2979C7d6c395AF0D3f400a878fA858b724a";

  const { getAllUsers } = useAuth();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
  };

  // 從 DisasterReliefUI.jsx 整合的驗證邏輯
  async function verifyWithSelf() {
    setStatus('opening_self');

    try {
      const selfServiceUrl = (import.meta as any).env.VITE_SELF_SERVICE_URL || 'http://localhost:3000'; // 類型斷言以修復 'env' 錯誤
      const popup = window.open(
        selfServiceUrl,
        'SelfVerification',
        'width=600,height=800,left=200,top=100'
      );

      if (!popup) {
        setStatus('Popup 被阻擋，請允許彈出視窗');
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      const handleMessage = (event: MessageEvent) => { // 添加類型註解
        console.log('Received message:', event.data);
        
        if (event.data && event.data.type === 'SELF_VERIFICATION_SUCCESS') {
          console.log('✓ Verification successful! Data:', event.data.data);
          
          const walletAddress = event.data.data.userIdentifier || '0x'; // 假設有地址
          console.log('💼 驗證成功');
          
          // 從 localStorage 查找對應的用戶 ID
          let users = [];
          let matchedUser: WalletInfo | undefined = undefined;
          try {
            users = (getAllUsers as any)(); // 類型斷言以修復 'never' 錯誤
            console.log('👥 All Users:', users);
            matchedUser = Object.values(users).find((user: any) => user.walletAddress?.toLowerCase() === walletAddress.toLowerCase()) as WalletInfo | undefined; // 類型斷言
            console.log('🎯 Matched User:', matchedUser);
          } catch (error) {
            console.error('Error getting users:', error);
          }
          
          const userId = matchedUser ? matchedUser.shortUuid : walletAddress;
          const displayName = matchedUser ? `${matchedUser.fullName} (${matchedUser.shortUuid})` : userId;
          
          console.log('📝 User ID:', userId, 'Display Name:', displayName);
          
          setVerificationResult({
            verified: true,
            timestamp: event.data.data.timestamp,
            nullifier: event.data.data.nullifier || '0x' + '01'.repeat(32),
            userIdentifier: walletAddress,
            userId: userId,
            displayName: displayName,
            proof: event.data.data.proof || 'SELF_PROOF_FROM_SERVICE'
          });
          
          setStatus('verified');
          window.removeEventListener('message', handleMessage);
          
          console.log('🚀 驗證完成');
          alert(`✓ 身份驗證成功！已自動帶入您的用戶 ID: ${userId}`);
        }
      };

      window.addEventListener('message', handleMessage);
      console.log('Message listener added, waiting for verification...');

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          console.log('Popup closed');
          
          if (status === 'opening_self' && !verificationResult) {
            setStatus('verification_cancelled');
          }
        }
      }, 500);

    } catch (err) {
      const error = err as Error; // 類型斷言
      setStatus('verify_failed: ' + error.message);
    }
  };

  // 領取救助金
  const requestPayout = async () => {
    if (!selectedProgram || !verificationResult) return;
    
    setStatus('sending_tx');
    try {
      // 模擬領取過程（實際應用中應連接到區塊鏈合約）
      console.log(`正在領取 ${selectedProgram}...`);
      
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✓ 成功領取 ${selectedProgram}！救助金已發送到您的錢包。`);
      setSelectedProgram('');
      setStatus('verified');
    } catch (error) {
      console.error('領取失敗:', error);
      alert('領取失敗，請重試。');
      setStatus('verified');
    }
  };

  const programs = [
    { value: '緊急救助 (最高 NT$ 10,000)', label: '緊急救助 (最高 NT$ 10,000)' },
    { value: '生活補助 (最高 NT$ 30,000)', label: '生活補助 (最高 NT$ 30,000)' },
    { value: '醫療補助 (最高 NT$ 50,000)', label: '醫療補助 (最高 NT$ 50,000)' },
    { value: '住房重建 (最高 NT$ 100,000)', label: '住房重建 (最高 NT$ 100,000)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              <span style={{ color: 'initial' }}>🌊</span> 災害救助
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
                        onClick={verifyWithSelf}
                        disabled={status === 'verified'}
                      >
                        {status === 'verified' ? '已完成驗證' : '開始驗證'}
                      </Button>
                      {verificationResult && (
                        <div className="verified-box" style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '8px' }}>
                          <strong>✓ 驗證成功</strong>
                          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
                            救助金將發送到您綁定的錢包地址
                          </div>
                        </div>
                      )}
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
                      <button
                        onClick={requestPayout}
                        disabled={!verificationResult || !selectedProgram || status === 'sending_tx'}
                        style={{ marginTop: '15px' }}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {status === 'sending_tx' ? '處理中...' : '領取救助金'}
                      </button>
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
                      <span>驗證過程需要使用 Self Protocol App</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>救助金將直接發送到您的帳戶</span>
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