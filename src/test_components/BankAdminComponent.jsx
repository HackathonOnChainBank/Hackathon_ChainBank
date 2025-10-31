import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const BankAdminComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admin, setAdmin] = useState('');

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

  const handleBankAdmin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      const result = await contract.bankAdmin();
      setAdmin(result);
      setSuccess(`銀行管理員: ${result}`);

    } catch (err) {
      console.error('BankAdmin 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-admin-container">
      <h2>BankAdmin 查詢</h2>
      
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

      <button 
        onClick={handleBankAdmin}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 BankAdmin'}
      </button>
      
      {admin && (
        <p>管理員: {admin}</p>
      )}
    </div>
  );
};

export default BankAdminComponent;
