import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const AllowanceComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [owner, setOwner] = useState('');
  const [spender, setSpender] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('');

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

  const handleAllowance = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!owner || !spender) {
        throw new Error('請輸入 owner 和 spender 地址');
      }

      const amount = await contract.allowance(owner, spender);
      const formattedAmount = ethers.formatUnits(amount, 18);
      setAllowanceAmount(formattedAmount);
      setSuccess(`允許額: ${formattedAmount}`);
      console.log('Allowance 回傳值:', amount);
      console.log('Allowance 結果 (格式化):', formattedAmount);

    } catch (err) {
      console.error('Allowance 調用錯誤:', err);
      let errorMsg = err.message;
      if (err.message.includes('user rejected')) {
        errorMsg = '使用者取消';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="allowance-container">
      <h2>Allowance 查詢</h2>
      
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
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        placeholder="輸入 owner 地址"
      />
      <input
        type="text"
        value={spender}
        onChange={(e) => setSpender(e.target.value)}
        placeholder="輸入 spender 地址"
      />
      
      <button 
        onClick={handleAllowance}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 Allowance'}
      </button>
      
      {allowanceAmount && (
        <p>允許額: {allowanceAmount}</p>
      )}
    </div>
  );
};

export default AllowanceComponent;
