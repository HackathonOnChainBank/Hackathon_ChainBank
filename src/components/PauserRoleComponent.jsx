import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const PauserRoleComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');

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

  const handlePauserRole = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      const result = await contract.PAUSER_ROLE();
      setRole(result);
      setSuccess(`暫停角色: ${result}`);

    } catch (err) {
      console.error('PAUSER_ROLE 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pauser-role-container">
      <h2>PAUSER_ROLE 查詢</h2>
      
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
        onClick={handlePauserRole}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 PAUSER_ROLE'}
      </button>
      
      {role && (
        <p>角色: {role}</p>
      )}
    </div>
  );
};

export default PauserRoleComponent;
