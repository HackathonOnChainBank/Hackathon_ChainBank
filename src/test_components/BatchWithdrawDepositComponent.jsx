import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const BatchWithdrawDepositComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState('');
  const [depositIds, setDepositIds] = useState('');

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

  const handleBatchWithdrawDeposit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!addresses || !depositIds) {
        throw new Error('請輸入地址和定存編號');
      }

      const addrArray = addresses.split(',');
      const idArray = depositIds.split(',').map(x => x.trim());
      const tx = await contract.batchWithdrawDeposit(addrArray, idArray);
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('批量領取成功！');
        console.log('BatchWithdrawDeposit 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('BatchWithdrawDeposit 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-withdraw-deposit-container">
      <h2>BatchWithdrawDeposit 批量領取</h2>
      
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
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
        placeholder="地址陣列（逗號分隔）"
      />
      <input
        type="text"
        value={depositIds}
        onChange={(e) => setDepositIds(e.target.value)}
        placeholder="定存編號陣列（逗號分隔）"
      />
      
      <button 
        onClick={handleBatchWithdrawDeposit}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 BatchWithdrawDeposit'}
      </button>
    </div>
  );
};

export default BatchWithdrawDepositComponent;
