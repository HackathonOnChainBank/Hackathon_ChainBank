import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { getPrivateKey } from '../utils/walletStorage';

/**
 * 使用用戶錢包的 Hook
 * 自動從加密存儲中載入私鑰並創建錢包實例
 */
export const useWallet = () => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 載入錢包
  const loadWallet = async (password) => {
    if (!currentUser?.shortUuid) {
      setError('用戶未登入');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 從加密存儲中獲取私鑰
      const privateKey = getPrivateKey(currentUser.shortUuid, password);
      
      if (!privateKey) {
        throw new Error('無法獲取私鑰，請確認密碼是否正確');
      }

      // 創建 provider（使用環境變數或默認 RPC）
      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      console.log('使用 RPC URL:', rpcUrl)
      
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);

      // 創建錢包實例
      const walletInstance = new ethers.Wallet(privateKey, rpcProvider);

      // 驗證地址
      if (walletInstance.address.toLowerCase() !== currentUser.walletAddress.toLowerCase()) {
        throw new Error('錢包地址驗證失敗');
      }

      setWallet(walletInstance);
      setProvider(rpcProvider);
      setSigner(walletInstance);

      console.log('✓ 錢包已成功載入:', walletInstance.address);
      return walletInstance;

    } catch (err) {
      console.error('載入錢包失敗:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 清除錢包
  const clearWallet = () => {
    setWallet(null);
    setProvider(null);
    setSigner(null);
    setError(null);
  };

  // 獲取餘額
  const getBalance = async () => {
    if (!wallet || !provider) {
      throw new Error('錢包未載入');
    }

    try {
      const balance = await provider.getBalance(wallet.address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('獲取餘額失敗:', err);
      throw err;
    }
  };

  // 發送交易
  const sendTransaction = async (to, amount) => {
    if (!wallet) {
      throw new Error('錢包未載入');
    }

    try {
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString())
      });

      console.log('交易已發送:', tx.hash);
      const receipt = await tx.wait();
      console.log('交易已確認:', receipt);

      return receipt;
    } catch (err) {
      console.error('發送交易失敗:', err);
      throw err;
    }
  };

  // 簽署訊息
  const signMessage = async (message) => {
    if (!wallet) {
      throw new Error('錢包未載入');
    }

    try {
      const signature = await wallet.signMessage(message);
      return signature;
    } catch (err) {
      console.error('簽署訊息失敗:', err);
      throw err;
    }
  };

  return {
    wallet,
    provider,
    signer,
    isLoading,
    error,
    loadWallet,
    clearWallet,
    getBalance,
    sendTransaction,
    signMessage,
    address: wallet?.address || null,
    isConnected: !!wallet
  };
};
