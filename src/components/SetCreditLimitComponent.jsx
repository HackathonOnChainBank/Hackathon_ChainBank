import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/CreditCardProduct_ABI.js';

const SetCreditLimitComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS;
        const rpcUrl = import.meta.env.VITE_RPC_URL;
        const privateKey = import.meta.env.VITE_PRIVATE_KEY_1;

        if (!contractAddress || !rpcUrl || !privateKey) {
          throw new Error("請設定環境變數 VITE_CREDITCARD_CONTRACT_ADDRESS, VITE_RPC_URL 和 VITE_PRIVATE_KEY_1");
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

  const handleSetCreditLimit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!user || !limit) {
        throw new Error('請輸入用戶地址和信用額度');
      }

      const tx = await contract.setCreditLimit(user, limit);
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('設定成功！');
        console.log('SetCreditLimit 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('SetCreditLimit 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-credit-limit-container">
      <h2>SetCreditLimit 設定信用額度</h2>
      
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
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="信用額度（wei）"
      />
      
      <button 
        onClick={handleSetCreditLimit}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 SetCreditLimit'}
      </button>
    </div>
  );
};

export default SetCreditLimitComponent;
