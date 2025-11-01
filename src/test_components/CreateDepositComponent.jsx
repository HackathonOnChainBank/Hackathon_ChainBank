import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/DepositProduct_ABI.js';

const CreateDepositComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');

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

  const handleCreateDeposit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!user || !amount || !period || !interestRate) {
        throw new Error('請輸入所有參數');
      }

      const tx = await contract.createDeposit(user, ethers.parseUnits(amount, 18), period, interestRate);
      setSuccess(`交易已送出: ${tx.hash}`);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setSuccess('創建定存成功！');
        console.log('CreateDeposit 成功，回傳收據:', receipt);
      }

    } catch (err) {
      console.error('CreateDeposit 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-deposit-container">
      <h2>CreateDeposit 創建定存</h2>
      
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
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="金額"
      />
      <input
        type="text"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        placeholder="期數（秒）"
      />
      <input
        type="text"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
        placeholder="利率（萬分比）"
      />
      
      <button 
        onClick={handleCreateDeposit}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '執行 CreateDeposit'}
      </button>
    </div>
  );
};

export default CreateDepositComponent;
