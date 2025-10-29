import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const WithdrawDepositsComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState('');
  const [depositId, setDepositId] = useState('');

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
        const rpcUrl = import.meta.env.VITE_RPC_URL;
        const privateKey = import.meta.env.VITE_PRIVATE_KEY_1;

        if (!contractAddress || !rpcUrl || !privateKey) {
          throw new Error("請設定環境變數 VITE_DEPOSIT_CONTRACT_ADDRESS, VITE_RPC_URL 和 VITE_PRIVATE_KEY_1");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractInstance = new ethers.Contract(contractAddress, ABI, wallet);
        setContract(contractInstance);
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(err.message);
      }
    };
    
    initContract();
  }, []);

  const handleWithdrawDeposits = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!user || !depositId) {
        throw new Error('請輸入用戶地址和定存編號');
      }

      const tx = await contract.withdrawDeposit(user, depositId);
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('領取定存成功！');
        console.log('WithdrawDeposits 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('WithdrawDeposits 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-deposits-container">
      <h2>WithdrawDeposits 領取定存</h2>
      
      {error && (
        <div className="error-message">
          錯誤：{error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <input
        type="text"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        placeholder="用戶地址"
      />
      <input
        type="text"
        value={depositId}
        onChange={(e) => setDepositId(e.target.value)}
        placeholder="定存編號"
      />
      
      <button 
        onClick={handleWithdrawDeposits}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 WithdrawDeposits'}
      </button>
    </div>
  );
};

export default WithdrawDepositsComponent;
