import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI } from '../config/NTD_TOKEN_ABI.js';

const GetRoleAdminComponent = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [admin, setAdmin] = useState('');

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

  const handleGetRoleAdmin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!contract) {
        throw new Error('合約未初始化');
      }

      if (!roleInput) {
        throw new Error('請輸入角色');
      }

      const result = await contract.getRoleAdmin(roleInput);
      setAdmin(result);
      setSuccess(`角色管理員: ${result}`);

    } catch (err) {
      console.error('GetRoleAdmin 調用錯誤:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-role-admin-container">
      <h2>GetRoleAdmin 查詢</h2>
      
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
        value={roleInput}
        onChange={(e) => setRoleInput(e.target.value)}
        placeholder="輸入角色 (bytes32 hex)"
      />
      
      <button 
        onClick={handleGetRoleAdmin}
        disabled={loading || !contract}
      >
        {loading ? '處理中...' : '查詢 GetRoleAdmin'}
      </button>
      
      {admin && (
        <p>管理員: {admin}</p>
      )}
    </div>
  );
};

export default GetRoleAdminComponent;
