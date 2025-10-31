import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';
import { ABI as DEPOSIT_PRODUCT_ABI } from '../config/DepositProduct_ABI';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle, RefreshCw, PiggyBank, Lightbulb, AlertCircle } from "lucide-react";

export function DepositPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const { wallet, loadWallet, provider } = useWallet();

  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('30'); // 預設 30 天
  const [interestRate, setInterestRate] = useState('3'); // 預設 3%
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [userDeposits, setUserDeposits] = useState<any[]>([]);

  // 利率對照表：天數 -> 利率(%)
  const interestRateMap = {
    '30': '3',
    '90': '4',
    '180': '5.5',
    '365': '6'
  };

  // 當期限改變時，自動設定對應的利率
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const rate = interestRateMap[newPeriod as keyof typeof interestRateMap] || '3'; // 預設 3%
    setInterestRate(rate);
  };

  // 檢查是否已經有錢包載入
  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
      setStatus('✓ 錢包已自動載入');
      checkAllowanceStatus();
      loadUserDeposits();
    }
  }, [wallet]);

  // 檢查用戶是否已被 allowAccount 授權
  const checkAllowanceStatus = async () => {
    if (!wallet) return;

    setCheckingAllowance(true);
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定');

      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, wallet);
      const allowed = await contract.isUserAllowed(wallet.address);

      setIsAllowed(allowed);
      if (allowed) {
        setStatus('✅ 您的帳戶已授權，可以使用定存服務');
      } else {
        setStatus('⚠️ 您的帳戶尚未授權，請聯繫管理員進行 allowAccount 授權');
      }
    } catch (err) {
      console.error('檢查授權狀態錯誤:', err);
      setStatus('❌ 無法檢查授權狀態: ' + (err as Error).message);
    } finally {
      setCheckingAllowance(false);
    }
  };

  // 載入用戶的定存記錄
  const loadUserDeposits = async () => {
    if (!wallet) return;

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
      if (!depositContractAddress) {
        console.log('DepositProduct 合約地址未設定');
        return;
      }

      console.log('正在載入定存記錄...');
      console.log('合約地址:', depositContractAddress);
      console.log('用戶地址:', wallet.address);

      // 使用管理員私鑰建立合約實例來查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x' + adminPk, providerAdmin);

      const contract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, adminSigner);
      const deposits = await contract.getUserDeposits(wallet.address);

      console.log('原始定存資料:', deposits);
      console.log('定存數量:', deposits.length);

      const formattedDeposits = deposits.map((d: any, index: number) => ({
        id: index,
        amount: ethers.formatUnits(d.amount, 18),
        startTime: new Date(Number(d.startTime) * 1000).toLocaleString('zh-TW'),
        period: Number(d.period),
        interestRate: Number(d.interestRate),
        withdrawn: d.withdrawn
      }));

      console.log('格式化後的定存:', formattedDeposits);
      setUserDeposits(formattedDeposits);
    } catch (err) {
      console.error('載入定存記錄錯誤:', err);
      setStatus('❌ 載入定存記錄失敗: ' + (err as Error).message);
    }
  };

  const handleLoadWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    if (!password) {
      setStatus('⚠️ 請輸入密碼以載入私鑰');
      return;
    }
    setLoading(true);
    try {
      await loadWallet(password);
      setStatus('✅ 錢包已成功載入！');
      setPassword('');
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    if (!wallet) {
      setStatus('⚠️ 請先載入您的錢包');
      return;
    }

    if (!isAllowed) {
      setStatus('⚠️ 您的帳戶尚未授權，無法建立定存');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus('⚠️ 請輸入有效的定存金額（必須大於 0）');
      return;
    }

    if (!period || isNaN(Number(period)) || Number(period) <= 0) {
      setStatus('⚠️ 請輸入有效的定存期限（天數，必須大於 0）');
      return;
    }

    if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) < 0) {
      setStatus('⚠️ 請輸入有效的利率（%，必須大於等於 0）');
      return;
    }

    setLoading(true);
    setStatus(`⏳ 正在建立定存...`);

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
      if (!depositContractAddress) throw new Error('DepositProduct 合約地址未設定');

      const ntdContractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!ntdContractAddress) throw new Error('NTD_TOKEN 合約地址未設定');

      // 先檢查並 approve DepositProduct 合約
      const ntdContract = new ethers.Contract(ntdContractAddress, NTD_TOKEN_ABI, wallet);
      const decimals = await ntdContract.decimals();
      const depositAmount = ethers.parseUnits(amount.toString(), decimals);

      setStatus(`⏳ 正在授權 DepositProduct 合約使用您的 NTD...`);
      const approveTx = await ntdContract.approve(depositContractAddress, depositAmount);
      await approveTx.wait();

      // 建立定存 - 使用管理員私鑰調用合約
      setStatus(`⏳ 正在建立定存記錄...`);

      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x' + adminPk, providerAdmin);

      // 使用管理員私鑰創建合約實例
      const depositContract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, adminSigner);

      // createDeposit(address user, uint256 amount, uint256 period, uint256 interestRate)
      // user 參數使用當前用戶的地址
      // 金額已經用 parseUnits 轉換成 wei (乘以 10^18)
      // period 直接從天換成秒數
      const periodInSeconds = Number(period) * 86400;
      // interestRate 以基點表示（例如 500 = 5%）
      const rateInBasisPoints = Math.floor(Number(interestRate) * 100);

      const tx = await depositContract.createDeposit(
        wallet.address,  // 使用當前用戶的地址
        depositAmount,
        periodInSeconds,
        rateInBasisPoints
      );

      setStatus(`📤 定存建立中，交易雜湊: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setStatus(`✅ 定存建立成功！金額: ${amount} NTD，期限: ${period} 天，利率: ${interestRate}%`);

      // 清空表單並重新載入定存記錄
      setAmount('');
      setPeriod('');
      setInterestRate('');
      await loadUserDeposits();
    } catch (err) {
      console.error('建立定存錯誤:', err);
      setStatus('❌ 建立定存失敗: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (depositId: number) => {
    if (!wallet) return;

    setLoading(true);
    setStatus(`⏳ 正在提領定存 #${depositId}...`);

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
      if (!depositContractAddress) throw new Error('DepositProduct 合約地址未設定');

      // 使用管理員私鑰建立合約實例來提領
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x' + adminPk, providerAdmin);

      const contract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, adminSigner);
      const tx = await contract.withdrawDeposit(wallet.address, depositId);

      setStatus(`📤 提領中，交易雜湊: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setStatus(`✅ 定存 #${depositId} 提領成功！`);

      // 重新載入定存記錄
      await loadUserDeposits();
    } catch (err: any) {
      console.error('提領定存錯誤:', err);
      if (err.reason === 'Not yet due') {
        setStatus('❌ 提領失敗: 尚未到期');
      } else {
        setStatus('❌ 提領失敗: ' + (err.message || err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <p className="text-slate-400 text-center">請先登入以使用定存服務</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              💰 NTD 定存服務
            </span>
          </h1>
          <p className="text-slate-400 text-lg">穩健理財，讓您的資產增值</p>
        </div>

        {/* Password Input for Wallet Loading */}
        {showPasswordInput && !wallet && (
          <Card className="mt-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <h3 className="text-slate-100 mb-4">載入您的錢包</h3>
            <form onSubmit={handleLoadWallet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                disabled={loading}
              >
                {loading ? '🔄 載入中...' : '🔓 載入錢包'}
              </Button>
            </form>
            <p className="text-slate-400 text-sm mt-4">💡 提示：請輸入您註冊時設定的密碼</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authorization Status */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <h2 className="text-xl text-slate-100">授權狀態</h2>
            </div>
            {checkingAllowance ? (
              <p className="text-slate-300">⏳ 檢查授權狀態中...</p>
            ) : (
              <>
                {isAllowed ? (
                  <div className="text-green-400 mb-4">
                    ✅ 已授權 - 可以使用定存服務
                  </div>
                ) : (
                  <div className="text-yellow-400 mb-4">
                    ⚠️ 未授權 - 請聯繫管理員進行 allowAccount 授權
                  </div>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                  onClick={checkAllowanceStatus}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新檢查授權狀態
                </Button>
              </>
            )}
          </Card>

          {/* Create New Deposit */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <PiggyBank className="h-6 w-6 text-purple-300" />
              <h2 className="text-xl text-slate-100">建立新定存</h2>
            </div>

            <form onSubmit={handleCreateDeposit} className="space-y-4">
              {/* Deposit Amount */}
              <div className="space-y-2">
                <Label htmlFor="depositAmount" className="text-slate-300">定存金額 (NTD)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="請輸入定存金額"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  disabled={loading || !isAllowed}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Deposit Term and Rate */}
              <div className="space-y-2">
                <Label className="text-slate-300">定存期限與利率</Label>
                <Select value={period} onValueChange={handlePeriodChange} disabled={loading || !isAllowed}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem className="text-slate-200 hover:bg-slate-700" value="30">30 天 (1個月) - 目前利率：3% 年利率</SelectItem>
                    <SelectItem className="text-slate-200 hover:bg-slate-700" value="90">90 天 (3個月) - 目前利率：4% 年利率</SelectItem>
                    <SelectItem className="text-slate-200 hover:bg-slate-700" value="180">180 天 (6個月) - 目前利率：5.5% 年利率</SelectItem>
                    <SelectItem className="text-slate-200 hover:bg-slate-700" value="365">365 天 (1年) - 目前利率：6% 年利率</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rate-info">
                <span className="text-slate-300">目前利率：</span>
                <strong className="text-purple-300">{interestRate}% 年利率</strong>
              </div>
              {amount && period && interestRate && (
                <div className="deposit-preview bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="text-slate-100 mb-2">預估收益</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">本金：</span>
                      <strong className="text-slate-200">{amount} NTD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">期限：</span>
                      <span className="text-slate-200">{period} 天</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">年利率：</span>
                      <span className="text-slate-200">{interestRate}%</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-1">
                      <span className="text-slate-400">預估利息：</span>
                      <strong className="text-green-400">
                        {(Number(amount) * Number(interestRate) / 100 * Number(period) / 365).toFixed(2)} NTD
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">到期總額：</span>
                      <strong className="text-green-400">
                        {(Number(amount) + Number(amount) * Number(interestRate) / 100 * Number(period) / 365).toFixed(2)} NTD
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                disabled={loading || !wallet || !isAllowed || !amount || !period || !interestRate}
              >
                {loading ? '⏳ 處理中...' : '💰 建立定存'}
              </Button>
            </form>
          </Card>

          {/* My Deposit Records */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <h2 className="text-xl text-slate-100 mb-4">我的定存記錄</h2>
            {userDeposits.length === 0 ? (
              <p className="text-slate-400 text-center py-8">目前沒有定存記錄</p>
            ) : (
              <div className="space-y-4">
                {userDeposits.map((deposit) => (
                  <div key={deposit.id} className={`p-4 rounded-lg border ${deposit.withdrawn ? 'bg-slate-800/30 border-slate-600' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-slate-200 font-semibold">定存 #{deposit.id}</span>
                      <span className={`px-2 py-1 rounded text-xs ${deposit.withdrawn ? 'bg-slate-600 text-slate-400' : 'bg-green-600 text-green-200'}`}>
                        {deposit.withdrawn ? '已提領' : '進行中'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">金額：</span>
                        <strong className="text-slate-200">{deposit.amount} NTD</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">開始時間：</span>
                        <span className="text-slate-200">{deposit.startTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">期限：</span>
                        <span className="text-slate-200">{deposit.period} 天</span>
                      </div>
                      <div>
                        <span className="text-slate-400">年利率：</span>
                        <span className="text-slate-200">{(deposit.interestRate / 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    {!deposit.withdrawn && (
                      <Button
                        className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0"
                        onClick={() => handleWithdraw(deposit.id)}
                        disabled={loading}
                      >
                        💸 提領定存
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Deposit Tips */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl text-slate-100">💡 定存小提示：</h2>
            </div>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>定存期間資金將被鎖定，無法提前解約</li>
              <li>到期後可隨時提領本金加利息</li>
              <li>利息將根據實際天數計算</li>
              <li>建議選擇適合自己的定存期限</li>
            </ul>
          </Card>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mt-6 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-900/20 border border-green-500/30' : status.includes('❌') ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-800/50 border border-slate-600'}`}>
            <div className="flex items-center gap-2">
              {status.includes('✅') && <CheckCircle className="h-5 w-5 text-green-400" />}
              {status.includes('❌') && <AlertCircle className="h-5 w-5 text-red-400" />}
              <span className="text-slate-200">{status}</span>
            </div>
          </div>
        )}

        {/* Deposit info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
            <h3 className="text-slate-100 mb-2">5% 年利率</h3>
            <p className="text-slate-400 text-sm">固定利率保障，穩定收益</p>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 p-6">
            <h3 className="text-slate-100 mb-2">智能合約</h3>
            <p className="text-slate-400 text-sm">自動派息，安全可靠</p>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 p-6">
            <h3 className="text-slate-100 mb-2">彈性提領</h3>
            <p className="text-slate-400 text-sm">隨時提領，無手續費</p>
          </Card>
        </div>
        
      </div>
    </div>
  );
}