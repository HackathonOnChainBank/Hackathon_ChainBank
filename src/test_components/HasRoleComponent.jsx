import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const HasRoleComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [account, setAccount] = useState('');
  const [hasRole, setHasRole] = useState('');

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

  const handleHasRole = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!role || !account) {
        throw new Error('請輸入角色和地址');
      }

      const result = await contract.hasRole(role, account);
      setHasRole(result.toString());
      setSuccess(`HasRole: ${result}`);

    } catch (err) {
      console.error('HasRole 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="has-role-container">
      <h2>HasRole 查詢</h2>
      
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
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="輸入角色 (bytes32 hex)"
      />
      <input
        type="text"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        placeholder="輸入地址"
      />
      
      <button 
        onClick={handleHasRole}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 HasRole'}
      </button>
      
      {hasRole && (
        <p>HasRole: {hasRole}</p>
      )}
    </div>
  );
};

export default HasRoleComponent;
