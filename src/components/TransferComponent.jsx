import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const TransferComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    console.log('VITE_RPC_URL:', import.meta.env.VITE_RPC_URL);
    console.log('VITE_NTD_TOKEN_CONTRACT_ADDRESS:', import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS);
    console.log('VITE_PRIVATE_KEY_1:', import.meta.env.VITE_PRIVATE_KEY ? '已設定' : '未設定');
    const initContract = async () => {
      try {
        const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS;
        const rpcUrl = import.meta.env.VITE_RPC_URL;
        const privateKey = import.meta.env.VITE_PRIVATE_KEY_1;

        if (!contractAddress || !rpcUrl || !privateKey) {
          throw new Error("請設定環境變數 VITE_NTD_TOKEN_CONTRACT_ADDRESS, VITE_RPC_URL 和 VITE_PRIVATE_KEY_1");
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

  const handleTransfer = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!to || !amount) {
        throw new Error('請輸入接收地址和金額');
      }

      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('轉帳成功！');
        console.log('Transfer 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('Transfer 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-container">
      <h2>Transfer 轉帳</h2>
      
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
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="接收地址"
      />
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="金額"
      />
      
      <button 
        onClick={handleTransfer}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 Transfer'}
      </button>
    </div>
  );
};

export default TransferComponent;
