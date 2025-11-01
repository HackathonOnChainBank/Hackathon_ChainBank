import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const BalanceOfComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    const initContract = async () => {
      try {
        const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
        const rpcUrl = import.meta.env.VITE_RPC_URL;

        if (!contractAddress || !rpcUrl) {
          throw new Error("請設定環境變數 VITE_NTD_TOKEN_CONTRACT_ADDRESS 和 VITE_RPC_URL");
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

  const handleBalanceOf = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!address) {
        throw new Error('請輸入地址');
      }

      const balanceAmount = await contract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balanceAmount, 18);
      setBalance(formattedBalance);
      setSuccess(`餘額: ${formattedBalance}`);
      console.log('Balance 回傳值:', balanceAmount);
      console.log('Balance 結果 (格式化):', formattedBalance);

    } catch (err) {
      console.error('BalanceOf 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-container">
      <h2>BalanceOf 查詢</h2>
      
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
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="輸入地址"
      />
      
      <button 
        onClick={handleBalanceOf}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 BalanceOf'}
      </button>
      
      {balance && (
        <p>餘額: {balance}</p>
      )}
    </div>
  );
};

export default BalanceOfComponent;
