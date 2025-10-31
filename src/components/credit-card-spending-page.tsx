import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';
import { ABI as CREDIT_CARD_ABI } from '../config/CreditCard_ABI';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CreditCard, RefreshCw, Plus, CheckCircle, AlertCircle, TrendingUp, Coins, Shield } from "lucide-react";

export function CreditCardSpendingPage() {
  const { isAuthenticated, currentUser, getUserByShortUuid } = useAuth();
  const { wallet, loadWallet } = useWallet();

  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 信用卡資訊
  const [creditInfo, setCreditInfo] = useState({
    limit: '0',
    balance: '0',
    available: '0'
  });
  const [loadingCredit, setLoadingCredit] = useState(false);

  // 消費記錄
  const [spendRecords, setSpendRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // 商家列表
  const [merchantList, setMerchantList] = useState([]);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchantAccount, setNewMerchantAccount] = useState('');
  const [newMerchantName, setNewMerchantName] = useState('');

  // 消費表單
  const [selectedMerchantAccount, setSelectedMerchantAccount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spending, setSpending] = useState(false);

  // 還款表單
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);

  // 載入商家列表
  useEffect(() => {
    const savedMerchants = localStorage.getItem('chainbank_merchants');
    if (savedMerchants) {
      try {
        const merchants = JSON.parse(savedMerchants);
        setMerchantList(merchants);
      } catch (err) {
        console.error('載入商家列表失敗:', err);
        setMerchantList([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
      setStatus('✓ 錢包已載入');
      loadCreditInfo();
      loadSpendRecords();
    }
  }, [wallet]);

  // 根據帳號查找商家地址
  const getAddressFromAccount = (account: string) => {
    const merchant = merchantList.find((m: any) => m.account === account);
    return merchant?.address;
  };

  // 根據地址查找商家名稱
  const getMerchantName = (address: string) => {
    const merchant = merchantList.find((m: any) => m.address.toLowerCase() === address.toLowerCase());
    if (merchant) {
      return (merchant as any).name;
    }
    // 如果找不到，顯示地址縮寫
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 新增商家
  const handleAddMerchant = () => {
    if (!newMerchantAccount.trim()) {
      setStatus('⚠️ 請輸入商家帳號');
      return;
    }
    if (!newMerchantName.trim()) {
      setStatus('⚠️ 請輸入商家名稱');
      return;
    }

    // 檢查商家名稱是否重複
    const nameExists = merchantList.some((m: any) => m.name.toLowerCase() === newMerchantName.trim().toLowerCase());
    if (nameExists) {
      setStatus('⚠️ 此商家名稱已存在，請使用不同的名稱');
      return;
    }

    // 檢查商家帳號是否已存在
    const accountExists = merchantList.some((m: any) => m.account === newMerchantAccount.trim());
    if (accountExists) {
      setStatus('⚠️ 此商家帳號已存在，請使用不同的帳號');
      return;
    }

    // 從 storage 抓取商家地址
    const merchantUserData = (getUserByShortUuid as any)(newMerchantAccount.trim());
    if (!merchantUserData) {
      setStatus('⚠️ 找不到此商家帳號，請確認輸入正確');
      return;
    }
    if (!merchantUserData.walletAddress || !ethers.isAddress(merchantUserData.walletAddress)) {
      setStatus('⚠️ 商家資料異常');
      return;
    }

    const merchant = {
      account: newMerchantAccount.trim(),
      address: merchantUserData.walletAddress,
      name: newMerchantName.trim()
    };

    const updatedList = [...merchantList, merchant];
    setMerchantList(updatedList);
    localStorage.setItem('chainbank_merchants', JSON.stringify(updatedList));

    setSelectedMerchantAccount(newMerchantAccount.trim());
    setNewMerchantAccount('');
    setNewMerchantName('');
    setShowAddMerchant(false);
    setStatus('✅ 商家新增成功！');
  };

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
    } catch (err: any) {
      setStatus('❌ 載入錢包失敗: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // 載入信用卡資訊
  const loadCreditInfo = async () => {
    if (!wallet) return;

    setLoadingCredit(true);
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定');

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      );

      const info = await creditContract.credits(wallet.address);
      const limit = ethers.formatUnits(info.limit, 18);
      const balance = ethers.formatUnits(info.balance, 18);
      const available = (parseFloat(limit) - parseFloat(balance)).toFixed(2);

      setCreditInfo({
        limit,
        balance,
        available
      });
    } catch (err: any) {
      console.error('載入信用卡資訊錯誤:', err);
      setStatus('❌ 載入信用卡資訊失敗: ' + (err.message || err));
    } finally {
      setLoadingCredit(false);
    }
  };

  // 載入消費記錄
  const loadSpendRecords = async () => {
    if (!wallet) return;

    setLoadingRecords(true);
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定');

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      );

      const records = await creditContract.getSpendRecords(wallet.address);

      const formattedRecords = records.map((record: any, index: number) => ({
        index,
        merchant: record.merchant,
        amount: ethers.formatUnits(record.amount, 18),
        timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString('zh-TW')
      }));

      setSpendRecords(formattedRecords);
    } catch (err: any) {
      console.error('載入消費記錄錯誤:', err);
      setStatus('❌ 載入消費記錄失敗: ' + (err.message || err));
    } finally {
      setLoadingRecords(false);
    }
  };

  // 信用卡消費
  const handleSpend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setStatus('⚠️ 請先載入錢包');
      return;
    }

    const merchantAddress = getAddressFromAccount(selectedMerchantAccount);
    if (!merchantAddress || !ethers.isAddress(merchantAddress)) {
      setStatus('⚠️ 請選擇有效的商家');
      return;
    }

    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      setStatus('⚠️ 請輸入有效的消費金額');
      return;
    }

    if (parseFloat(spendAmount) > parseFloat(creditInfo.available)) {
      setStatus('⚠️ 消費金額超過可用額度');
      return;
    }

    setSpending(true);
    setStatus('⏳ 正在處理消費...');

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定');

      // 使用管理員私鑰執行消費
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      );

      const amount = ethers.parseUnits(spendAmount, 18);
      const tx = await creditContract.spend(wallet.address, merchantAddress, amount);
      setStatus(`📤 消費處理中，交易雜湊: ${tx.hash.substring(0, 10)}...`);

      await tx.wait();
      setStatus('✅ 消費成功！');

      // 清空表單並重新載入資訊
      setSelectedMerchantAccount('');
      setSpendAmount('');
      await loadCreditInfo();
      await loadSpendRecords();
    } catch (err: any) {
      console.error('消費錯誤:', err);
      setStatus('❌ 消費失敗: ' + (err.message || err));
    } finally {
      setSpending(false);
    }
  };

  // 還款
  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setStatus('⚠️ 請先載入錢包');
      return;
    }

    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setStatus('⚠️ 請輸入有效的還款金額');
      return;
    }

    if (parseFloat(repayAmount) > parseFloat(creditInfo.balance)) {
      setStatus('⚠️ 還款金額超過欠款餘額');
      return;
    }

    setRepaying(true);
    setStatus('⏳ 正在處理還款...');

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
      const ntdAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!creditCardAddress || !ntdAddress) throw new Error('合約地址未設定');

      // 先用用戶錢包 approve NTD_TOKEN
      const ntdContract = new ethers.Contract(ntdAddress, NTD_TOKEN_ABI, wallet);
      const amount = ethers.parseUnits(repayAmount, 18);

      setStatus('⏳ 正在授權 NTD 轉帳...');
      const approveTx = await ntdContract.approve(creditCardAddress, amount);
      await approveTx.wait();

      // 使用管理員私鑰執行還款
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1;
      if (!adminPk) throw new Error('管理員私鑰未設定');

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl);
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      );

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      );

      setStatus('⏳ 正在執行還款...');
      const tx = await creditContract.repay(wallet.address, amount);
      setStatus(`📤 還款處理中，交易雜湊: ${tx.hash.substring(0, 10)}...`);

      await tx.wait();
      setStatus('✅ 還款成功！');

      // 清空表單並重新載入資訊
      setRepayAmount('');
      await loadCreditInfo();
    } catch (err: any) {
      console.error('還款錯誤:', err);
      setStatus('❌ 還款失敗: ' + (err.message || err));
    } finally {
      setRepaying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
          <p className="text-slate-400 text-center">請先登入以使用信用卡消費服務</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
              <span style={{ color: 'initial' }}>💳</span> 信用卡消費與還款
            </span>
          </h1>
          <p className="text-slate-400 text-lg">使用您的信用卡進行消費，並隨時還款</p>
        </div>

        {showPasswordInput && !wallet && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <CreditCard className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">載入您的錢包</h2>
            </div>
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
            </form>
            <p className="text-slate-400 text-sm mt-4">💡 提示：請輸入您註冊時設定的密碼</p>
          </Card>
        )}

        {wallet && (
          <>
            {/* 信用額度資訊 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-100">💰 您的資產與信用額度</h3>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                  onClick={loadCreditInfo}
                  disabled={loadingCredit}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新整理
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-slate-400 text-sm mb-2">信用額度</div>
                  <div className="text-purple-400 text-2xl font-bold">
                    {loadingCredit ? '載入中...' : `${parseFloat(creditInfo.limit).toLocaleString()} NTD`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-sm mb-2">已使用額度</div>
                  <div className="text-red-400 text-2xl font-bold">
                    {loadingCredit ? '載入中...' : `${parseFloat(creditInfo.balance).toLocaleString()} NTD`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-sm mb-2">可用額度</div>
                  <div className="text-green-400 text-2xl font-bold">
                    {loadingCredit ? '載入中...' : `${parseFloat(creditInfo.available).toLocaleString()} NTD`}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 消費表單 */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
                <h3 className="text-slate-100 mb-6">💸 信用卡消費</h3>
                <form onSubmit={handleSpend}>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">商家</Label>
                      {!showAddMerchant ? (
                        <Select value={selectedMerchantAccount} onValueChange={(value) => {
                          if (value === 'ADD_NEW') {
                            setShowAddMerchant(true);
                          } else {
                            setSelectedMerchantAccount(value);
                          }
                        }} disabled={spending || parseFloat(creditInfo.limit) === 0}>
                          <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-slate-200">
                            <SelectValue placeholder="-- 請選擇商家 --" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {merchantList.map((merchant: any, index: number) => (
                              <SelectItem key={index} value={merchant.account} className="text-slate-200 hover:bg-slate-700">
                                {merchant.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="ADD_NEW" className="text-slate-200 hover:bg-slate-700">
                              ➕ 新增商家
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="space-y-3">
                          <Input
                            type="text"
                            placeholder="商家帳號"
                            value={newMerchantAccount}
                            onChange={(e) => setNewMerchantAccount(e.target.value)}
                            className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                          />
                          <Input
                            type="text"
                            placeholder="商家名稱 (例: 統一超商)"
                            value={newMerchantName}
                            onChange={(e) => setNewMerchantName(e.target.value)}
                            className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleAddMerchant}
                              className="flex-1 bg-green-600 hover:bg-green-500"
                            >
                              ✓ 確認新增
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setShowAddMerchant(false);
                                setNewMerchantAccount('');
                                setNewMerchantName('');
                              }}
                              className="flex-1 bg-gray-600 hover:bg-gray-500"
                            >
                              ✕ 取消
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-300">消費金額 (NTD)</Label>
                      <Input
                        type="number"
                        placeholder="請輸入消費金額"
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                        step="1"
                        min="0"
                        disabled={spending || parseFloat(creditInfo.limit) === 0}
                        className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                      />
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-slate-400 text-sm">可用額度: </span>
                      <span className="text-green-400 font-semibold">{parseFloat(creditInfo.available).toLocaleString()} NTD</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                      disabled={spending || !selectedMerchantAccount || !spendAmount || parseFloat(creditInfo.limit) === 0}
                    >
                      {spending ? '⏳ 處理中...' : '💳 確認消費'}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 還款表單 */}
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
                <h3 className="text-slate-100 mb-6">💰 信用卡還款</h3>
                <form onSubmit={handleRepay}>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">還款金額 (NTD)</Label>
                      <Input
                        type="number"
                        placeholder="請輸入還款金額"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        disabled={repaying || parseFloat(creditInfo.balance) === 0}
                        className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                      />
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-slate-400 text-sm">當前欠款: </span>
                      <span className="text-red-400 font-semibold">{parseFloat(creditInfo.balance).toLocaleString()} NTD</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setRepayAmount(creditInfo.balance)}
                        disabled={repaying || parseFloat(creditInfo.balance) === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-500"
                      >
                        全額還款
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setRepayAmount((parseFloat(creditInfo.balance) / 2).toFixed(2))}
                        disabled={repaying || parseFloat(creditInfo.balance) === 0}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                      >
                        50%
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0"
                      disabled={repaying || !repayAmount || parseFloat(creditInfo.balance) === 0}
                    >
                      {repaying ? '⏳ 處理中...' : '💰 確認還款'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* 消費記錄 */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-100">📋 消費記錄 ({spendRecords.length})</h3>
                <Button
                  variant="outline"
                  onClick={loadSpendRecords}
                  disabled={loadingRecords}
                  className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loadingRecords ? '載入中...' : '重新整理'}
                </Button>
              </div>
              {loadingRecords ? (
                <div className="text-slate-400 text-center py-8">⏳ 載入中...</div>
              ) : spendRecords.length === 0 ? (
                <div className="text-slate-400 text-center py-8">目前沒有消費記錄</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3">序號</th>
                        <th className="text-left py-3">商家名稱</th>
                        <th className="text-left py-3">消費金額</th>
                        <th className="text-left py-3">消費時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spendRecords.map((record: any) => (
                        <tr key={record.index} className="border-b border-slate-800">
                          <td className="py-3">#{record.index + 1}</td>
                          <td className="py-3">
                            <span className="font-semibold">{getMerchantName(record.merchant)}</span>
                          </td>
                          <td className="py-3 text-green-400">
                            {parseFloat(record.amount).toLocaleString()} NTD
                          </td>
                          <td className="py-3">{record.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

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

        {/* Note */}
        <div className="mt-8 text-center">
          <div className="bg-slate-800/50 p-6 rounded-lg">
            <h4 className="text-slate-100 mb-4">💡 使用說明：</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>💳 <strong>消費：</strong>使用信用卡向商家付款，由合約代墊金額</li>
              <li>💰 <strong>還款：</strong>使用您的 NTD_TOKEN 還款，減少欠款餘額</li>
              <li>📊 消費金額不能超過可用額度</li>
              <li>🔄 還款後可用額度會立即恢復</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}