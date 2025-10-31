import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle, RefreshCw, Send, AlertCircle } from "lucide-react";

export function TransferPage() {
  const { isAuthenticated, currentUser, getAllUsers } = useAuth();
  const { wallet, loadWallet, provider } = useWallet();

  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [ntdBalance, setNtdBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // 檢查是否已經有錢包載入
  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
      setStatus('✓ 錢包已自動載入');
      fetchBalance();
    }
  }, [wallet]);

  // 獲取餘額
  const fetchBalance = async () => {
    if (!wallet) return;

    setBalanceLoading(true);
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定');

      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, provider || ethers.getDefaultProvider());
      const balance = await contract.balanceOf(wallet.address);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setNtdBalance(formattedBalance);
    } catch (err) {
      console.error('獲取餘額失敗:', err);
      setNtdBalance('0');
    } finally {
      setBalanceLoading(false);
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
      await fetchBalance();
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    const allUsers = getAllUsers();
    const user = Object.values(allUsers).find((u: any) => u.shortUuid === value);
    if (user) {
      setRecipientName((user as any).fullName);
    } else {
      setRecipientName('');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    if (!wallet) {
      setStatus('⚠️ 請先載入您的錢包');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus('⚠️ 請輸入有效的轉帳金額（必須大於 0）');
      return;
    }

    if (!recipient) {
      setStatus('⚠️ 請選擇收款人');
      return;
    }

    if (ntdBalance && Number(amount) > Number(ntdBalance)) {
      setStatus('⚠️ 轉帳金額超過餘額');
      return;
    }

    setLoading(true);
    setStatus(`⏳ 正在轉帳...`);

    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定');

      const allUsers = getAllUsers();
      const recipientUser = Object.values(allUsers).find((u: any) => u.shortUuid === recipient);
      if (!recipientUser || !(recipientUser as any).walletAddress) {
        throw new Error('收款人錢包地址不存在');
      }

      const recipientAddress = (recipientUser as any).walletAddress;
      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, wallet);
      const decimals = await contract.decimals();
      const transferAmount = ethers.parseUnits(amount.toString(), decimals);

      const tx = await contract.transfer(recipientAddress, transferAmount);
      setStatus(`📤 轉帳中，交易雜湊: ${tx.hash.substring(0, 10)}...`);
      await tx.wait();
      setStatus(`✅ 轉帳成功！金額: ${amount} NTD，收款人: ${recipientName}`);

      // 清空表單並重新載入餘額
      setAmount('');
      setRecipient('');
      setRecipientName('');
      await fetchBalance();
    } catch (err) {
      console.error('轉帳錯誤:', err);
      setStatus('❌ 轉帳失敗: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
          <p className="text-slate-400 text-center">請先登入以使用轉帳服務</p>
        </Card>
      </div>
    );
  }

  const allUsers = getAllUsers();
  const userOptions = Object.values(allUsers)
    .filter((u: any) => u.shortUuid !== (currentUser as any)?.shortUuid)
    .map((u: any) => ({ value: u.shortUuid, label: `${u.fullName} (${u.shortUuid})` }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              💸 NTD 轉帳服務
            </span>
          </h1>
          <p className="text-slate-400 text-lg">安全快速的數位資產轉帳</p>
        </div>

        {showPasswordInput && !wallet && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6 mb-6">
            <h3 className="text-slate-100 mb-4">載入您的錢包</h3>
            <form onSubmit={handleLoadWallet} className="inline-form">
              <Input
                type="password"
                placeholder="輸入您的密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
              />
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0" type="submit" disabled={loading}>
                {loading ? '🔄 載入中...' : '🔓 載入錢包'}
              </Button>
            </form>
            <p className="text-slate-400 text-sm mt-4">💡 提示：請輸入您註冊時設定的密碼</p>
          </Card>
        )}

        {wallet && (
          <>
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6 mb-6">
              <h3 className="text-slate-100 mb-4">💰 帳戶餘額</h3>
              <p className="text-green-400 text-xl font-semibold">
                {balanceLoading ? '載入中...' : `${ntdBalance || '0.00'} NTD`}
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                onClick={fetchBalance}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新整理餘額
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-slate-100 mb-6">轉帳</h3>
              <form onSubmit={handleTransfer}>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">轉帳金額 (NTD)</Label>
                    <Input
                      type="number"
                      placeholder="請輸入轉帳金額"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      disabled={loading}
                      className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">收款人</Label>
                    <Select value={recipient} onValueChange={handleRecipientChange} disabled={loading}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                        <SelectValue placeholder="選擇收款人" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {userOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-slate-200 hover:bg-slate-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipientName && (
                      <p className="text-slate-400 text-sm mt-2">收款人: {recipientName}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                    disabled={loading || !amount || !recipient}
                  >
                    {loading ? '⏳ 處理中...' : '💸 確認轉帳'}
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}

        {status && (
          <div className={`mt-6 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-900/20 border border-green-500/30' : status.includes('❌') ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-800/50 border border-slate-600'}`}>
            <div className="flex items-center gap-2">
              {status.includes('✅') && <CheckCircle className="h-5 w-5 text-green-400" />}
              {status.includes('❌') && <AlertCircle className="h-5 w-5 text-red-400" />}
              <span className="text-slate-200">{status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}