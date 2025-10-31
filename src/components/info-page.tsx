import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ethers } from 'ethers';
import { getPrivateKey } from '../utils/walletStorage';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';

export function InfoPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role, currentUser, getAllUsers } = useAuth();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [ntdBalance, setNtdBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // 檢查是否需要顯示密碼提示
  useEffect(() => {
    if (isAuthenticated && role === 'user' && !wallet) {
      setShowPasswordPrompt(true);
    }
  }, [isAuthenticated, role, wallet]);

  // 載入錢包
  const handleLoadWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadError('');
    setWalletLoading(true);

    try {
      if (!(currentUser as any)) throw new Error('用戶資料不存在');

      const privateKey = getPrivateKey((currentUser as any).shortUuid, password);
      if (!privateKey) throw new Error('密碼錯誤或私鑰不存在');

      const walletInstance = new ethers.Wallet(privateKey);
      setWallet(walletInstance);
      setShowPasswordPrompt(false);

      // 載入餘額
      await fetchBalance(walletInstance);

      // 載入轉帳記錄
      await fetchTransferHistory();

    } catch (err) {
      const error = err as Error;
      setLoadError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  // 獲取餘額
  const fetchBalance = async (walletInstance: ethers.Wallet) => {
    setBalanceLoading(true);
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        console.error('❌ NTD_TOKEN 合約地址未設定');
        setNtdBalance('0');
        return;
      }

      const rpcUrl = import.meta.env.VITE_RPC_URL;
      if (!rpcUrl) {
        console.error('❌ RPC URL 未設定');
        setNtdBalance('0');
        return;
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, provider);
      
      // 獲取餘額（原始值）
      const balance = await contract.balanceOf(walletInstance.address);
      
      // 獲取 decimals
      const decimals = await contract.decimals();
      
      // 格式化餘額
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      setNtdBalance(formattedBalance);
    } catch (error) {
      console.error('獲取餘額失敗:', error);
      setNtdBalance('0');
    } finally {
      setBalanceLoading(false);
    }
  };

  // 獲取轉帳記錄
  const fetchTransferHistory = async () => {
    if (!wallet) return;

    setHistoryLoading(true);
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.error('❌ NTD_TOKEN 合約地址未設定');
        setTransferHistory([]);
        return;
      }

      const rpcUrl = import.meta.env.VITE_RPC_URL;
      if (!rpcUrl) {
        console.error('❌ RPC URL 未設定');
        setTransferHistory([]);
        return;
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, provider);

      // 從創世區塊開始搜尋所有歷史記錄
      const fromBlock = 0;
      const currentBlock = await provider.getBlockNumber();

      console.log(`📊 搜尋轉帳記錄: 從區塊 ${fromBlock} 到 ${currentBlock}`);

      // 查詢該用戶發送或接收的 Transfer 事件
      const sentFilter = contract.filters.Transfer(wallet.address, null);
      const receivedFilter = contract.filters.Transfer(null, wallet.address);

      const [sentEvents, receivedEvents] = await Promise.all([
        contract.queryFilter(sentFilter, fromBlock, currentBlock),
        contract.queryFilter(receivedFilter, fromBlock, currentBlock)
      ]);

      console.log(`✅ 找到 ${sentEvents.length} 筆轉出記錄, ${receivedEvents.length} 筆轉入記錄`);

      // 合併並排序事件
      const allEvents = [...sentEvents, ...receivedEvents];
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      // 格式化記錄並查找對方的姓名或ID
      const decimals = await contract.decimals();
      const allUsers = getAllUsers();

      const history = await Promise.all(
        allEvents.slice(0, 10).map(async (event) => {
          const block = await event.getBlock();
          const isSent = event.args[0].toLowerCase() === wallet.address.toLowerCase();
          const otherAddress = isSent ? event.args[1] : event.args[0];

          // 查找對方的用戶資料
          let otherUserName = null;
          let otherUserId = null;

          for (const [userId, userData] of Object.entries(allUsers)) {
            if (userData.walletAddress && userData.walletAddress.toLowerCase() === otherAddress.toLowerCase()) {
              otherUserName = userData.fullName;
              otherUserId = userId;
              break;
            }
          }

          return {
            hash: event.transactionHash,
            from: event.args[0],
            to: event.args[1],
            amount: ethers.formatUnits(event.args[2], decimals),
            timestamp: new Date(block.timestamp * 1000),
            blockNumber: event.blockNumber,
            type: isSent ? 'sent' : 'received',
            otherUserName: otherUserName,
            otherUserId: otherUserId,
            otherAddress: otherAddress
          };
        })
      );

      console.log('📋 格式化後的轉帳記錄:', history);
      setTransferHistory(history);
      console.log('✅ 已更新 transferHistory state, 共', history.length, '筆記錄');
    } catch (error) {
      console.error('❌ 獲取轉帳記錄失敗:', error);
      console.error('錯誤堆疊:', error.stack);
      setTransferHistory([]);
    } finally {
      setHistoryLoading(false);
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

  // 如果尚未登入，顯示登入提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-12 max-w-md">
          <p className="text-slate-400 text-center text-xl">請先登入以查看資訊頁面</p>
        </Card>
      </div>
    );
  }

  // 如果是已登入的使用者，顯示錢包資訊
  if (isAuthenticated && role === 'user') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl mb-4">
              <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
                歡迎回來，{(currentUser as any)?.fullName || '使用者'}！
              </span>
            </h1>
            <p className="text-slate-400 text-lg">您的數位資產管理中心</p>
          </div>

          {showPasswordPrompt && !wallet ? (
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
              <div className="text-center">
                <h3 className="text-slate-100 mb-4">🔐 載入您的錢包</h3>
                <p className="text-slate-400 mb-6">請輸入密碼以載入您的錢包進行交易</p>
                <form onSubmit={handleLoadWallet} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">密碼</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="輸入您的密碼"
                      disabled={walletLoading}
                      autoFocus
                      className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                  {loadError && (
                    <div className="text-red-400 text-sm">{loadError}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                    disabled={walletLoading}
                  >
                    {walletLoading ? '載入中...' : '載入錢包'}
                  </Button>
                </form>
              </div>
            </Card>
          ) : wallet ? (
            <div className="space-y-6">
              {/* Wallet Info Section */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
                <h3 className="text-slate-100 mb-6">💰 帳戶資訊</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">帳號 ID:</span>
                    <code className="text-purple-300 bg-slate-800 px-2 py-1 rounded">{(currentUser as any).shortUuid}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">NTD 餘額:</span>
                    <span className="text-green-400 font-semibold">
                      {balanceLoading ? '載入中...' : ntdBalance ? `${parseFloat(ntdBalance).toFixed(2)} NTD` : '0.00 NTD'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
                <h3 className="text-slate-100 mb-6">快速功能</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600"
                    onClick={() => navigate('/deposit')}
                  >
                    💵 一般存款
                  </Button>
                  <Button
                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600"
                    onClick={() => navigate('/transfer')}
                  >
                    ✅ 轉帳
                  </Button>
                  <Button
                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600"
                    onClick={() => navigate('/credit-card-spending')}
                  >
                    💳 信用卡
                  </Button>
                  <Button
                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600"
                    onClick={() => navigate('/disaster-relief')}
                  >
                    🆘 災難救助
                  </Button>
                </div>
              </Card>

              {/* Transfer History Section */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-100">💸 最近轉帳記錄 ({transferHistory.length})</h3>
                  <Button
                    variant="outline"
                    onClick={fetchTransferHistory}
                    disabled={historyLoading}
                    className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  >
                    🔄 {historyLoading ? '載入中...' : '重新整理'}
                  </Button>
                </div>
                {historyLoading ? (
                  <div className="text-slate-400 text-center py-8">載入中...</div>
                ) : transferHistory.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">暫無轉帳記錄</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2">類型</th>
                          <th className="text-left py-2">金額 (NTD)</th>
                          <th className="text-left py-2">對方</th>
                          <th className="text-left py-2">時間</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.map((record) => (
                          <tr key={record.hash} className="border-b border-slate-800">
                            <td className={`py-2 ${record.type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                              {record.type === 'sent' ? '轉出' : '轉入'}
                            </td>
                            <td className="py-2">
                              {record.type === 'sent' ? '-' : '+'}{parseFloat(record.amount).toFixed(2)}
                            </td>
                            <td className="py-2">
                              {record.otherUserName ? (
                                <div>
                                  <div className="font-semibold">{record.otherUserName}</div>
                                  {record.otherUserId && (
                                    <div className="text-sm text-slate-500">({record.otherUserId})</div>
                                  )}
                                </div>
                              ) : record.otherUserId ? (
                                <div className="text-slate-500">{record.otherUserId}</div>
                              ) : (
                                <div className="text-slate-500">
                                  {record.otherAddress.slice(0, 6)}...{record.otherAddress.slice(-4)}
                                </div>
                              )}
                            </td>
                            <td className="py-2">
                              {record.timestamp.toLocaleString('zh-TW', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          ) : null}

          {/* Status Message */}
          {status && (
            <div className={`mt-6 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-900/20 border border-green-500/30' : status.includes('❌') ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-800/50 border border-slate-600'}`}>
              <div className="flex items-center gap-2">
                {renderStatus(status)}
              </div>
            </div>
          )}

          {/* Features Section */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mt-8">
            <h2 className="text-slate-100 mb-6 text-center">平台特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-slate-100 mb-2">安全可靠</h3>
                <p className="text-slate-400 text-sm">私鑰加密存儲，區塊鏈技術保障</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-slate-100 mb-2">無需外部錢包</h3>
                <p className="text-slate-400 text-sm">系統自動管理交易，無需 MetaMask</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-slate-100 mb-2">透明監控</h3>
                <p className="text-slate-400 text-sm">全程可追蹤的交易記錄</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-slate-100 mb-2">全球接軌</h3>
                <p className="text-slate-400 text-sm">符合國際標準的數位資產</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 如果未登入或角色不匹配，返回 null 或其他內容
  return null;
}