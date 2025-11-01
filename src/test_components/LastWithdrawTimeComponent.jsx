import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const LastWithdrawTimeComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState('');
  const [lastTime, setLastTime] = useState('');

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS;
        const rpcUrl = import.meta.env.VITE_RPC_URL;

        if (!contractAddress || !rpcUrl) {
          throw new Error("請設定環境變數 VITE_DEPOSIT_CONTRACT_ADDRESS 和 VITE_RPC_URL");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contractInstance = new ethers.Contract(contractAddress, ABI, provider);
        setContract(contractInstance);
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(err.message);
      }
    };
    
    initContract();
  }, []);

  const handleLastWithdrawTime = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!user) {
        throw new Error('請輸入用戶地址');
      }

      const result = await contract.lastWithdrawTime(user);
      setLastTime(result.toString());
      setSuccess(`最後領取時間: ${result.toString()}`);

    } catch (err) {
      console.error('LastWithdrawTime 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="last-withdraw-time-container">
      <h2>LastWithdrawTime 查詢</h2>
      
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
        placeholder="輸入用戶地址"
      />
      
      <button 
        onClick={handleLastWithdrawTime}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 LastWithdrawTime'}
      </button>
      
      {lastTime && (
        <p>時間: {lastTime}</p>
      )}
    </div>
  );
};

export default LastWithdrawTimeComponent;
