import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { getPrivateKey } from '../utils/walletStorage';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, getUserByShortUuid } = useAuth();
  const [shortUuid, setShortUuid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hash 密碼（與註冊時相同的方法）
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 驗證錢包地址格式
  const isValidAddress = (address) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  // 處理登入
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 驗證輸入
      if (!shortUuid.trim()) {
        throw new Error('請輸入您的帳號 ID');
      }

      if (!password) {
        throw new Error('請輸入密碼');
      }

      // 查找用戶
      const userData = getUserByShortUuid(shortUuid.trim());
      
      if (!userData) {
        throw new Error('找不到此帳號，請確認輸入正確或先進行註冊');
      }

      // 驗證密碼
      const passwordHash = await hashPassword(password);
      if (userData.passwordHash !== passwordHash) {
        throw new Error('密碼錯誤');
      }

      // 驗證資料完整性
      if (!userData.walletAddress || !isValidAddress(userData.walletAddress)) {
        throw new Error('錢包資料異常，請聯繫客服');
      }

      // 驗證私鑰可以正確解密
      const privateKey = getPrivateKey(shortUuid.trim(), password);
      if (!privateKey) {
        throw new Error('無法獲取私鑰，請確認密碼是否正確');
      }

      // 使用私鑰創建錢包實例驗證
      const wallet = new ethers.Wallet(privateKey);
      if (wallet.address.toLowerCase() !== userData.walletAddress.toLowerCase()) {
        throw new Error('錢包地址驗證失敗');
      }

      console.log('✓ 錢包已成功載入:', wallet.address);

      // 執行登入
      login(shortUuid.trim());
      
      // 自動導航到首頁
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1>ChainBank 登入</h1>
          <p>使用您的帳號 ID 和密碼登入</p>
        </div>

        {/* Login Form */}
        <div className="login-form-section">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="shortUuid">帳號 ID *</label>
              <input
                type="text"
                id="shortUuid"
                value={shortUuid}
                onChange={(e) => setShortUuid(e.target.value)}
                placeholder="請輸入您的帳號 ID"
                disabled={isLoading}
                autoFocus
              />
              <small>註冊時系統生成的唯一識別碼</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">密碼 *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入您的密碼"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-info">
              <h3>💡 無法登入？</h3>
              <ul>
                <li>請確認您輸入的帳號 ID 與註冊時相同</li>
                <li>密碼區分大小寫，請檢查是否正確</li>
                <li>如果您是第一次使用，請先<a href="/register">註冊新帳戶</a></li>
                <li>忘記帳號 ID 或密碼請聯繫客服協助找回</li>
              </ul>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={isLoading}
            >
              {isLoading ? '登入中...' : '登入'}
            </button>

            <div className="register-link">
              <p>還沒有帳戶？</p>
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/register')}
              >
                立即註冊
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
