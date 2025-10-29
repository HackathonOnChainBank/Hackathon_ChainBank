import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const SendInterestBatchComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState('');
  const [amounts, setAmounts] = useState('');

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

  const handleSendInterestBatch = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!addresses || !amounts) {
        throw new Error('請輸入地址和金額');
      }

      const addrArray = addresses.split(',');
      const amtArray = amounts.split(',').map(x => x.trim());
      const tx = await contract.sendInterestBatch(addrArray, amtArray);
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('批量發放利息成功！');
        console.log('SendInterestBatch 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('SendInterestBatch 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-interest-batch-container">
      <h2>SendInterestBatch 批量發放利息</h2>
      
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
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
        placeholder="金額陣列（逗號分隔）"
      />
      
      <button 
        onClick={handleSendInterestBatch}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 SendInterestBatch'}
      </button>
    </div>
  );
};

export default SendInterestBatchComponent;
