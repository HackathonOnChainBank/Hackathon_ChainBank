import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
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
  address?: string;
  passwordHash: string;
  network: string;
  chainId: number;
  privateKey: string;
  mnemonic: string;
  userId?: string;
}

interface Program {
  id: number;
  name: string;
  amountPerPerson: string;
  remainingBudget: string;
  isActive: boolean;
}

export function DisasterReliefPage() {
  const [status, setStatus] = useState<string>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<any>(null);
  
  const CONTRACT_ADDRESS = "0xba163d8cfc4918c928970443cb78930b3c6ab1d6";

  const { getAllUsers } = useAuth();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
  };

  // ✅ 驗證成功後載入可用計劃
  async function loadAvailablePrograms(userAddress: string) {
    console.log('🔄 開始載入救助計劃, userAddress:', userAddress);
    setStatus('loading_programs');
    
    try {
      const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
      
      // ✅ 獲取當前登入用戶的錢包地址（加強錯誤處理）
      let currentUser: WalletInfo | null = null;
      try {
        const userData = localStorage.getItem('chainbank_current_user');
        console.log('📦 原始 userData:', userData);
        
        if (userData) {
          // ✅ 先驗證是否為有效的 JSON
          let shortUuid: string;
          try {
            // 嘗試解析，可能是字符串或 JSON 對象
            const parsed = JSON.parse(userData);
            shortUuid = typeof parsed === 'string' ? parsed : parsed.shortUuid || parsed;
            console.log('📝 解析後的 shortUuid:', shortUuid);
          } catch (parseError) {
            // 如果解析失敗，直接使用原始字符串（可能已經是純文本）
            shortUuid = userData.replace(/^["']|["']$/g, ''); // 移除可能的引號
            console.log('📝 直接使用的 shortUuid:', shortUuid);
          }
          
          const usersData = localStorage.getItem('chainbank_wallets');
          console.log('👥 原始 usersData:', usersData?.substring(0, 100) + '...');
          
          if (usersData) {
            try {
              const usersObj = JSON.parse(usersData);
              currentUser = usersObj[shortUuid];
              console.log('👤 找到的用戶:', currentUser);
            } catch (parseError) {
              console.error('❌ 解析 usersData 失敗:', parseError);
              console.error('原始數據:', usersData);
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ 無法讀取當前用戶資料:', err);
      }
      
      const checkAddress = currentUser?.walletAddress || currentUser?.address || userAddress;
      console.log('💼 檢查地址:', checkAddress);
      
      const { DISASTER_RELIEF_ABI } = await import('../config/DisasterRelief_ABI');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DISASTER_RELIEF_ABI, provider);
      
      const programCount = await contract.programCounter();
      console.log('📊 計劃總數:', programCount.toString());
      
      const programs: Program[] = [];
      const count = Number(programCount);
      
      for (let i = 0; i < count; i++) {
        console.log(`檢查計劃 ${i}...`);
        const info = await contract.getProgramInfo(i);
        const hasClaimed = await contract.hasClaimed(i, checkAddress);
        
        console.log(`計劃 ${i} 資訊:`, {
          name: info[0],
          totalBudget: ethers.formatUnits(info[1], 18),
          amountPerPerson: ethers.formatUnits(info[2], 18),
          isActive: info[6],
          hasClaimed: hasClaimed
        });
        
        if (info[6] && !hasClaimed) {
          programs.push({
            id: i,
            name: info[0],
            amountPerPerson: ethers.formatUnits(info[2], 18),
            remainingBudget: ethers.formatUnits(info[5], 18),
            isActive: info[6]
          });
          console.log(`✅ 計劃 ${i} 已加入可領取列表`);
        }
      }
      
      console.log('📋 可用計劃列表:', programs);
      setAvailablePrograms(programs);
      
      // 如果只有一個計劃，自動選擇
      if (programs.length === 1) {
        setSelectedProgram(programs[0]);
        setAmount(programs[0].amountPerPerson);
        console.log('🎯 自動選擇唯一計劃:', programs[0]);
      } else if (programs.length === 0) {
        console.warn('⚠️ 沒有可用的救助計劃');
      }
      
      setStatus('verified');
    } catch (error: any) {
      console.error('❌ 載入救助計劃失敗:', error);
      console.error('錯誤堆疊:', error.stack);
      setStatus('載入計劃失敗: ' + error.message);
    }
  }

  // ✅ Self Protocol 驗證
  async function verifyWithSelf() {
    setStatus('opening_self');

    try {
      const selfServiceUrl = import.meta.env.VITE_SELF_SERVICE_URL || 'http://localhost:3000';
      const popup = window.open(
        selfServiceUrl,
        'SelfVerification',
        'width=600,height=800,left=200,top=100'
      );

      if (!popup) {
        setStatus('Popup 被阻擋，請允許彈出視窗');
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      const handleMessage = async (event: MessageEvent) => {
        console.log('📩 Received message:', event.data);
        
        if (event.data && event.data.type === 'SELF_VERIFICATION_SUCCESS') {
          console.log('✓ Verification successful! Data:', event.data.data);
          
          const walletAddress = event.data.data.userIdentifier || '0x';
          console.log('💼 驗證成功，錢包地址:', walletAddress);
          
          // 查找對應用戶
          let users: any = {};
          let foundUser: WalletInfo | undefined = undefined;
          
          try {
            users = getAllUsers();
            const usersList = Object.values(users);
            foundUser = usersList.find((user: any) => 
              user.walletAddress?.toLowerCase() === walletAddress.toLowerCase() ||
              user.address?.toLowerCase() === walletAddress.toLowerCase()
            ) as WalletInfo | undefined;
            
            if (foundUser) {
              console.log('🎯 找到匹配用戶:', foundUser.shortUuid, foundUser.fullName);
            }
          } catch (error) {
            console.error('❌ 獲取用戶列表錯誤:', error);
          }
          
          const userId = foundUser?.shortUuid || foundUser?.userId || walletAddress;
          const displayName = foundUser ? `${foundUser.fullName} (${foundUser.shortUuid || foundUser.userId})` : walletAddress;
          
          setVerificationResult({
            verified: true,
            timestamp: event.data.data.timestamp,
            nullifier: event.data.data.nullifier || '0x' + '01'.repeat(32),
            userIdentifier: walletAddress,
            userId: userId,
            displayName: displayName,
            proof: event.data.data.proof || 'SELF_PROOF_FROM_SERVICE'
          });
          
          window.removeEventListener('message', handleMessage);
          
          console.log('🚀 驗證完成，開始載入可用計劃');
          
          // 驗證成功後載入計劃
          setTimeout(() => {
            loadAvailablePrograms(walletAddress);
          }, 500);
          
          alert(`✓ 身份驗證成功！已自動帶入您的用戶 ID: ${userId}`);
        }
      };

      window.addEventListener('message', handleMessage);

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', handleMessage);
          
          if (status === 'opening_self' && !verificationResult) {
            setStatus('verification_cancelled');
          }
        }
      }, 500);

    } catch (err) {
      const error = err as Error;
      setStatus('verify_failed: ' + error.message);
      console.error('❌ 驗證失敗:', error);
    }
  }

  // ✅ 領取救助金（使用當前登入用戶的 private key）
  async function requestPayout() {
    if (!verificationResult) {
      setStatus('請先完成身份驗證');
      return;
    }
    if (!selectedProgram) {
      setStatus('請選擇救助計劃');
      return;
    }

    setStatus('sending_tx');

    try {
      // ✅ 獲取當前登入用戶（加強錯誤處理）
      const currentUserShortUuid = localStorage.getItem('chainbank_current_user');
      console.log('📦 原始當前用戶 ID:', currentUserShortUuid);
      
      if (!currentUserShortUuid) {
        throw new Error('找不到登入用戶資料，請先登入');
      }

      const usersData = localStorage.getItem('chainbank_wallets');
      if (!usersData) {
        throw new Error('找不到用戶列表');
      }
      
      // ✅ 安全解析 JSON
      let usersObj: any;
      let currentUserData: string;
      
      try {
        usersObj = JSON.parse(usersData);
        console.log('👥 用戶列表鍵:', Object.keys(usersObj));
      } catch (parseError) {
        console.error('❌ 解析用戶列表失敗:', parseError);
        console.error('原始數據:', usersData.substring(0, 200));
        throw new Error('用戶列表數據格式錯誤');
      }
      
      try {
        const parsed = JSON.parse(currentUserShortUuid);
        currentUserData = typeof parsed === 'string' ? parsed : parsed.shortUuid || parsed;
        console.log('📝 解析後的用戶 ID:', currentUserData);
      } catch (parseError) {
        currentUserData = currentUserShortUuid.replace(/^["']|["']$/g, '');
        console.log('📝 直接使用的用戶 ID:', currentUserData);
      }
      
      const currentUser = usersObj[currentUserData] as WalletInfo;
      
      if (!currentUser) {
        console.error('❌ 找不到 shortUuid:', currentUserData);
        console.error('可用的鍵:', Object.keys(usersObj));
        throw new Error('找不到當前用戶資料');
      }
      
      console.log('👤 當前用戶:', currentUser.userId || currentUser.shortUuid, currentUser.fullName);
      
      if (!currentUser.privateKey) {
        throw new Error('用戶資料中沒有 Private Key');
      }

      console.log('🔑 準備使用 Private Key 簽署交易');
      
      const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
      const wallet = new ethers.Wallet(currentUser.privateKey, provider);

      const { DISASTER_RELIEF_ABI } = await import('../config/DisasterRelief_ABI');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DISASTER_RELIEF_ABI, wallet);

      const tx = await contract.claimRelief(
        selectedProgram.id,
        { gasLimit: 500000 }
      );

      setStatus('tx_submitted');
      setTxHash(tx.hash);
      setTxStatus('pending');
      console.log('✅ 交易已提交:', tx.hash);

      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        setTxStatus('confirmed');
        setStatus('tx_confirmed');
        console.log('✓ 交易已確認');
        alert(`✓ 成功領取救助金！\n\n交易哈希: ${tx.hash}\n\n救助金已發送到您的錢包。`);
        
        if (verificationResult?.userIdentifier) {
          await loadAvailablePrograms(verificationResult.userIdentifier);
        }
      } else {
        throw new Error('交易失敗');
      }
    } catch (err: any) {
      console.error('❌ 撥款錯誤:', err);
      console.error('錯誤詳情:', {
        message: err.message,
        stack: err.stack,
        code: err.code
      });
      setStatus('tx_failed: ' + (err.message || '未知錯誤'));
      setTxStatus('failed');
      alert(`❌ 領取失敗\n\n${err.message || '未知錯誤'}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span style={{ color: 'initial' }}>🌊</span>
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              災害救助
            </span>
          </h1>
          <p className="text-slate-400 text-lg">透過區塊鏈技術提供快速、透明的災難救助服務</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 justify-between text-xs font-mono"
                  onClick={copyToClipboard}
                >
                  <span className="truncate">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</span>
                  <Copy className="h-3 w-3 flex-shrink-0 ml-2" />
                </Button>
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

          {/* Right main area */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">當前狀態</div>
                    <div className="text-slate-200">{status}</div>
                  </div>
                </div>

                {/* 1. 身份驗證 */}
                <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20">
                      <CheckCircle2 className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-100 mb-2">1. 身分驗證</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        點擊下方按鈕開啟 Self 身份驗證視窗。完成驗證後即可申請撥款。
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                        onClick={verifyWithSelf}
                        disabled={status === 'opening_self'}
                      >
                        {verificationResult ? '已完成驗證' : '開始驗證'}
                      </Button>
                      {verificationResult && (
                        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <strong className="text-green-300">✓ 驗證成功</strong>
                          </div>
                          <div className="text-slate-400 text-sm">
                            用戶: {verificationResult.displayName}
                          </div>
                          <div className="text-slate-400 text-sm mt-1">
                            救助金將發送到您綁定的錢包地址
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 2. 選擇救助計劃 */}
                <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                      <AlertCircle className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-100 mb-4">2. 選擇救助計劃</h3>
                      
                      {status === 'loading_programs' && (
                        <div className="text-slate-400 text-sm p-3 bg-slate-800/50 rounded-lg">
                          ⏳ 正在載入可用計劃...
                        </div>
                      )}
                      
                      {availablePrograms.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {availablePrograms.map((program) => (
                            <div
                              key={program.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedProgram?.id === program.id
                                  ? 'border-green-500 bg-green-900/20'
                                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                              }`}
                              onClick={() => {
                                setSelectedProgram(program);
                                setAmount(program.amountPerPerson);
                              }}
                            >
                              <h4 className="text-slate-100 mb-2">{program.name}</h4>
                              <div className="text-sm text-slate-400">
                                <div>💰 可領取金額: <strong className="text-purple-400">{parseFloat(program.amountPerPerson).toFixed(2)} NTD</strong></div>
                                <div>📊 剩餘預算: {parseFloat(program.remainingBudget).toFixed(2)} NTD</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : verificationResult ? (
                        <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg mb-4">
                          ⚠️ 目前沒有可申請的救助計劃，或您已領取過所有計劃
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm p-3 bg-slate-800/50 rounded-lg mb-4">
                          ℹ️ 請先完成身份驗證
                        </div>
                      )}
                      
                      {selectedProgram && (
                        <div className="mb-4">
                          <label className="block text-slate-300 text-sm mb-2">
                            領取金額 <span className="text-slate-500">(NTD)</span>
                          </label>
                          <input
                            type="text"
                            value={amount}
                            disabled
                            className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 font-bold"
                          />
                        </div>
                      )}
                      
                      <Button
                        onClick={requestPayout}
                        disabled={!verificationResult || !selectedProgram || status === 'sending_tx'}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 py-6 text-lg disabled:opacity-50"
                      >
                        {status === 'sending_tx' ? '⏳ 處理中...' : '🎁 領取救助金'}
                      </Button>
                      
                      {txHash && (
                        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                          <div className="text-slate-300 text-sm mb-2">
                            <strong>交易資訊:</strong>
                          </div>
                          <div className="text-slate-400 text-xs mb-1">
                            撥款金額: {amount} NTD
                          </div>
                          <div className="text-slate-400 text-xs mb-1">
                            交易: <a 
                              href={`https://celo-alfajores.blockscout.com/tx/${txHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </a>
                          </div>
                          <div className="text-slate-400 text-xs">
                            狀態: <span className={txStatus === 'confirmed' ? 'text-green-400' : txStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'}>
                              {txStatus || 'unknown'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 注意事項 */}
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
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
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>每個救助計劃只能領取一次</span>
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