import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';
import { ABI as WALRUS_STORAGE_ABI } from '../config/WalrusStorage_ABI';
import { ABI as CREDIT_CARD_ABI } from '../config/CreditCard_ABI';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CreditCard, AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

// 圖片載入組件（帶 fallback）
function ImageWithFallback({ blobId, alt = 'Card Style' }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  
  const walrusUrls = [
    `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
    `https://aggregator.testnet.walrus.mirai.cloud/${blobId}`,
    `https://aggregator.walrus-testnet.walrus.space/${blobId}`
  ];

  const handleError = () => {
    if (currentUrlIndex < walrusUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      setShowError(true);
    }
  };

  if (showError) {
    return (
      <div style={{
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#999'
      }}>
        無法載入卡片樣式
      </div>
    );
  }

  return (
    <img 
      src={walrusUrls[currentUrlIndex]} 
      alt={alt}
      style={{
        width: '100%',
        aspectRatio: '1.586',
        objectFit: 'cover',
        borderRadius: '12px'
      }}
      onError={handleError}
    />
  );
}

export function CreditCardApplyPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { wallet, loadWallet, provider } = useWallet();

  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 卡片樣式相關
  const [cardStyles, setCardStyles] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);

  // 信用額度相關
  const [ntdBalance, setNtdBalance] = useState('0');
  const [creditLimit, setCreditLimit] = useState('0');
  const [calculatingLimit, setCalculatingLimit] = useState(false);

  // 申請記錄
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // 申請表單
  const [userId, setUserId] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
      setStatus('✓ 錢包已載入');
      loadCardStyles();
      loadNTDBalance();
      loadUserApplications();
    }
  }, [wallet]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setUserId((currentUser as any)?.shortUuid || '');
    }
  }, [isAuthenticated, currentUser]);

  // 載入錢包
  const handleLoadWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setStatus('⚠️ 請輸入密碼');
      return;
    }
    setLoading(true);
    try {
      await loadWallet(password);
      setStatus('✅ 錢包載入成功！');
      setPassword('');
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 載入 NTD 餘額並計算信用額度
  const loadNTDBalance = async () => {
    if (!wallet) {
      console.log('錢包未載入，跳過');
      return;
    }

    console.log('開始載入 NTD 餘額，錢包地址:', wallet.address);
    setCalculatingLimit(true);
    try {
      const ntdAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!ntdAddress) {
        throw new Error('NTD_TOKEN 合約地址未設定');
      }
      console.log('NTD 合約地址:', ntdAddress);

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) {
        throw new Error('管理員私鑰未設定');
      }

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      console.log('RPC URL:', rpcUrl);
      
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      console.log('查詢 NTD 餘額...');
      const ntdContract = new ethers.Contract(ntdAddress, NTD_TOKEN_ABI, adminSigner);
      const balance = await ntdContract.balanceOf(wallet.address);
      const decimals = await ntdContract.decimals();
      
      const balanceFormatted = ethers.formatUnits(balance, decimals);
      console.log('NTD 餘額:', balanceFormatted);
      setNtdBalance(balanceFormatted);

      // 計算信用額度
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (creditCardAddress) {
        console.log('計算信用額度，合約地址:', creditCardAddress);
        const creditCardContract = new ethers.Contract(
          creditCardAddress,
          CREDIT_CARD_ABI,
          adminSigner
        );
        const limit = await creditCardContract.calculateCreditLimit(wallet.address);
        const limitFormatted = ethers.formatUnits(limit, decimals);
        console.log('信用額度:', limitFormatted);
        setCreditLimit(limitFormatted);
      } else {
        console.warn('CreditCard 合約地址未設定');
        setStatus('⚠️ CreditCard 合約地址未設定');
      }
    } catch (err) {
      console.error('載入 NTD 餘額錯誤:', err);
      setStatus('❌ 載入餘額失敗: ' + (err as Error).message);
      // 設定預設值避免顯示 NaN
      setNtdBalance('0');
      setCreditLimit('0');
    } finally {
      setCalculatingLimit(false);
      console.log('載入完成');
    }
  };

  // 從 Walrus 載入卡片樣式
  const loadCardStyles = async () => {
    console.log('開始載入卡片樣式');
    setLoadingStyles(true);
    try {
      const walrusStorageAddress = import.meta.env.VITE_WALRUS_STORAGE_ADDRESS;
      if (!walrusStorageAddress) {
        console.warn('Walrus Storage 合約地址未設定');
        setCardStyles([]);
        return;
      }
      console.log('Walrus Storage 地址:', walrusStorageAddress);

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const walrusContract = new ethers.Contract(
        walrusStorageAddress,
        WALRUS_STORAGE_ABI,
        adminSigner
      );

      // 假設管理員地址上傳了卡片樣式
      const adminAddress = adminSigner.address;
      const files = await walrusContract.getAllFiles(adminAddress);
      
      console.log('管理員上傳的檔案:', files);
      
      // 過濾出圖片類型
      const imageFiles = files.filter((f: any) => f.fileType.startsWith('image/'));
      setCardStyles(imageFiles);
      
      if (imageFiles.length > 0) {
        setSelectedStyle(imageFiles[0].dataId);
      }
    } catch (err) {
      console.error('載入卡片樣式錯誤:', err);
      setStatus('❌ 載入卡片樣式失敗: ' + (err as Error).message);
    } finally {
      setLoadingStyles(false);
    }
  };

  // 載入用戶的申請記錄
  const loadUserApplications = async () => {
    if (!wallet) {
      console.log('錢包未載入，跳過申請記錄查詢');
      return;
    }

    console.log('開始載入申請記錄');
    setLoadingApplications(true);
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (!creditCardAddress) {
        console.warn('CreditCard 合約地址未設定');
        setApplications([]);
        return;
      }
      console.log('查詢申請記錄，合約地址:', creditCardAddress);

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const creditCardContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      );

      const apps = await creditCardContract.getUserApplications(wallet.address);
      
      const formattedApps = apps.map((app: any, index: number) => ({
        index,
        userId: app.userId,
        creditLimit: ethers.formatUnits(app.creditLimit, 18),
        cardStyle: app.cardStyle,
        applicationTime: new Date(Number(app.applicationTime) * 1000).toLocaleString('zh-TW'),
        approved: app.approved,
        approvedTime: app.approved ? new Date(Number(app.approvedTime) * 1000).toLocaleString('zh-TW') : null
      }));

      setApplications(formattedApps);
    } catch (err) {
      console.error('載入申請記錄錯誤:', err);
      setStatus('❌ 載入申請記錄失敗: ' + (err as Error).message);
    } finally {
      setLoadingApplications(false);
    }
  };

  // 申請信用卡
  const handleApplyCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) {
      setStatus('⚠️ 請先載入錢包');
      return;
    }

    if (!userId) {
      setStatus('⚠️ 用戶 ID 未抓取，請重新載入頁面');
      return;
    }

    if (!selectedStyle) {
      setStatus('⚠️ 請選擇卡片樣式');
      return;
    }

    if (parseFloat(creditLimit) <= 0) {
      setStatus('⚠️ 您的 NTD 餘額不足，無法申請信用卡（最低需 1000 NTD）');
      return;
    }

    setApplying(true);
    setStatus('⏳ 正在提交申請...');

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (!creditCardAddress) throw new Error('CreditCard 合約地址未設定');

      // 使用用戶的錢包提交申請
      const creditCardContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        wallet
      );

      console.log('提交申請參數:', { userId, selectedStyle });
      const tx = await creditCardContract.applyForCard(userId, selectedStyle);
      console.log('交易提交成功:', tx.hash);
      setStatus(`📤 申請已提交，交易雜湊: ${tx.hash.substring(0, 10)}...`);
      
      await tx.wait();
      console.log('交易確認成功');
      setStatus('✅ 信用卡申請成功！已自動審核通過，您現在可以使用信用卡服務');
      
      // 重新載入申請記錄
      await loadUserApplications();
    } catch (err: any) {
      console.error('申請信用卡錯誤:', err);
      if (err.code === 'ACTION_REJECTED') {
        setStatus('❌ 用戶拒絕交易');
      } else if (err.reason) {
        setStatus('❌ 申請失敗: ' + err.reason);
      } else {
        setStatus('❌ 申請失敗: ' + (err.message || '未知錯誤'));
      }
    } finally {
      setApplying(false);
    }
  };

  // 渲染狀態訊息，確保 emoji 不被染色
  const renderStatus = (status: string) => {
    const emojiMatch = status.match(/^([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*(.*)$/u);
    if (emojiMatch) {
      return (
        <>
          <span style={{ color: 'initial' }}>{emojiMatch[1]}</span>
          <span className="text-slate-200">{emojiMatch[2]}</span>
        </>
      );
    }
    return <span className="text-slate-200">{status}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
          <p className="text-slate-400 text-center">請先登入以申請信用卡</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
              <span style={{ color: 'initial' }}>💳</span> 信用卡申請
            </span>
          </h1>
          <p className="text-slate-400 text-lg">根據您的 NTD 餘額申請專屬信用卡</p>
        </div>

        {showPasswordInput && !wallet ? (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
            <h3 className="text-slate-100 mb-6 text-lg font-bold">載入您的錢包</h3>
            <form onSubmit={handleLoadWallet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                disabled={loading}
              >
                {loading ? '🔄 載入中...' : '🔓 載入錢包'}
              </Button>
              <p className="text-slate-400 text-sm">💡 提示：請輸入您註冊時設定的密碼</p>
            </form>
          </Card>
        ) : wallet ? (
          <>
            {/* NTD 餘額與信用額度 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
              <h3 className="text-slate-100 mb-6">💰 您的資產與信用額度</h3>
              {calculatingLimit ? (
                <div className="text-center py-8">
                  <p className="text-slate-300 text-lg mb-4">⏳ 正在載入您的資產資訊...</p>
                  <p className="text-slate-400 text-sm">請稍候</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">NTD 餘額</div>
                    <div className="text-green-400 text-2xl font-bold">
                      {parseFloat(ntdBalance).toLocaleString()} NTD
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">可申請額度</div>
                    <div className="text-purple-400 text-2xl font-bold">
                      {parseFloat(creditLimit).toLocaleString()} NTD
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">額度倍數</div>
                    <div className="text-blue-400 text-2xl font-bold">
                      {parseFloat(ntdBalance) > 0 
                        ? (parseFloat(creditLimit) / parseFloat(ntdBalance)).toFixed(2)
                        : '0.00'} 倍
                    </div>
                  </div>
                </div>
              )}
              <div className="text-center mt-6">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                  onClick={loadNTDBalance}
                  disabled={calculatingLimit}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新計算額度
                </Button>
              </div>
            </Card>

            {/* 卡片樣式選擇 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-100">🎨 選擇卡片樣式</h3>
                <Button
                  variant="outline"
                  onClick={loadCardStyles}
                  disabled={loadingStyles}
                  className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loadingStyles ? '載入中...' : '重新載入'}
                </Button>
              </div>
              {loadingStyles ? (
                <p className="text-slate-400 text-center py-8">⏳ 正在從 Walrus 載入卡片樣式...</p>
              ) : cardStyles.length === 0 ? (
                <p className="text-slate-400 text-center py-8">目前沒有可用的卡片樣式</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardStyles.map((style: any, index: number) => (
                    <div 
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedStyle === style.dataId 
                          ? 'border-purple-400 shadow-lg shadow-purple-400/20' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedStyle(style.dataId)}
                    >
                      <ImageWithFallback blobId={style.dataId} alt={`Card Style ${index + 1}`} />
                      {selectedStyle === style.dataId && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">✓ 已選擇</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 申請表單 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
              <h3 className="text-slate-100 mb-6">📝 提交申請</h3>
              <form onSubmit={handleApplyCard}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId" className="text-slate-300">用戶 ID</Label>
                    <Input
                      id="userId"
                      type="text"
                      value={userId}
                      disabled
                      className="bg-slate-800/50 border-slate-600 text-slate-200"
                    />
                    <p className="text-slate-400 text-sm mt-1">自動抓取您的用戶 ID</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="text-slate-100 mb-3">申請預覽</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">用戶 ID:</span>
                        <strong className="text-slate-200">{userId || '(未抓取)'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">核准額度:</span>
                        <strong className="text-slate-200">{parseFloat(creditLimit).toLocaleString()} NTD</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">卡片樣式:</span>
                        <strong className="text-slate-200">{selectedStyle ? '已選擇' : '(未選擇)'}</strong>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                    disabled={applying || !userId || !selectedStyle || parseFloat(creditLimit) <= 0}
                  >
                    {applying ? '⏳ 提交中...' : '💳 提交申請'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* 申請記錄 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-100">📋 我的申請記錄 ({applications.length})</h3>
                <Button
                  variant="outline"
                  onClick={loadUserApplications}
                  disabled={loadingApplications}
                  className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loadingApplications ? '載入中...' : '重新整理'}
                </Button>
              </div>
              {loadingApplications ? (
                <div className="text-slate-400 text-center py-8">⏳ 載入中...</div>
              ) : applications.length === 0 ? (
                <div className="text-slate-400 text-center py-8">目前沒有申請記錄</div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.index} className={`p-4 rounded-lg border ${app.approved ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-800/50 border-slate-600'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-slate-200 font-semibold">申請 #{app.index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs ${app.approved ? 'bg-green-600 text-green-200' : 'bg-yellow-600 text-yellow-200'}`}>
                          {app.approved ? '✅ 已核准' : '⏳ 待審核'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">用戶 ID:</span>
                          <strong className="text-slate-200 ml-2">{app.userId}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">信用額度:</span>
                          <strong className="text-slate-200 ml-2">{parseFloat(app.creditLimit).toLocaleString()} NTD</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">申請時間:</span>
                          <span className="text-slate-200 ml-2">{app.applicationTime}</span>
                        </div>
                        {app.approved && (
                          <div>
                            <span className="text-slate-400">核准時間:</span>
                            <span className="text-slate-200 ml-2">{app.approvedTime}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <ImageWithFallback blobId={app.cardStyle} alt="Card Style" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        ) : null}

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
              </div>
            </div>
          </div>
        </Card>

        {/* Status Message */}
        {status && (
          <div className={`mt-6 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-900/20 border border-green-500/30' : status.includes('❌') ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-800/50 border border-slate-600'}`}>
            <div className="flex items-center gap-2">
              {renderStatus(status)}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-8 text-center">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h4 className="text-slate-100 mb-4">💡 申請須知：</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>信用額度根據您的 NTD 餘額自動計算</li>
              <li>最低申請門檻為 1,000 NTD 餘額</li>
              <li>提交申請後會自動審核通過</li>
              <li>審核通過後即可使用信用卡服務</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}