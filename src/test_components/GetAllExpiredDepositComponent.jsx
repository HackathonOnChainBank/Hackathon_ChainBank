import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const GetAllExpiredDepositComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expiredDeposits, setExpiredDeposits] = useState('');

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

  const handleGetAllExpiredDeposit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      const [addresses, depositIds] = await contract.getAllExpiredDeposits();
      const result = { addresses, depositIds };
      setExpiredDeposits(JSON.stringify(result));
      setSuccess(`到期未領定存: ${JSON.stringify(result)}`);

    } catch (err) {
      console.error('GetAllExpiredDeposit 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-all-expired-deposit-container">
      <h2>GetAllExpiredDeposit 查詢</h2>
      
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
        onClick={handleGetAllExpiredDeposit}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 GetAllExpiredDeposit'}
      </button>
      
      {expiredDeposits && (
        <p>定存: {expiredDeposits}</p>
      )}
    </div>
  );
};

export default GetAllExpiredDepositComponent;
