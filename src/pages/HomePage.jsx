import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, currentUser, role } = useAuth()
  const { wallet, loadWallet, provider, isLoading: walletLoading } = useWallet()
  const [ntdBalance, setNtdBalance] = useState('0')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [loadError, setLoadError] = useState('')
  const [balanceLoading, setBalanceLoading] = useState(false)

  // 載入錢包餘額
  useEffect(() => {
    if (isAuthenticated && currentUser && role === 'user' && !wallet) {
      // 使用者登入後，顯示密碼輸入提示來載入錢包
      setShowPasswordPrompt(true)
    }
  }, [isAuthenticated, currentUser, role, wallet])

  // 當錢包載入後，獲取 NTD_TOKEN 餘額
  useEffect(() => {
    const fetchNTDBalance = async () => {
      // 確保錢包和 provider 都存在
      if (!wallet || !provider) {
        console.log('等待錢包或 provider 載入...')
        return
      }

      setBalanceLoading(true)
      try {
        const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
        
        console.log('=== 開始查詢 NTD_TOKEN 餘額 ===')
        console.log('錢包地址:', wallet.address)
        console.log('合約地址:', contractAddress)
        
        if (!contractAddress) {
          console.error('❌ NTD_TOKEN 合約地址未設定')
          setNtdBalance('0')
          return
        }

        // 創建合約實例
        const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, provider)
        console.log('✓ 合約實例已創建')
        
        // 獲取餘額（原始值）
        const balance = await contract.balanceOf(wallet.address)
        console.log('原始餘額 (wei):', balance.toString())
        
        // 獲取 decimals
        const decimals = await contract.decimals()
        console.log('Decimals:', decimals)
        
        // 格式化餘額
        const formattedBalance = ethers.formatUnits(balance, decimals)
        console.log('格式化餘額:', formattedBalance)
        
        setNtdBalance(formattedBalance)
        console.log('✓ NTD_TOKEN 餘額已更新:', formattedBalance, 'NTD')
        console.log('===========================')
      } catch (err) {
        console.error('❌ 獲取 NTD_TOKEN 餘額失敗:', err)
        console.error('錯誤詳情:', err.message)
        setNtdBalance('0')
      } finally {
        setBalanceLoading(false)
      }
    }

    // 使用 try-catch 包裹整個函數調用
    try {
      fetchNTDBalance()
    } catch (err) {
      console.error('fetchNTDBalance 執行失敗:', err)
      setNtdBalance('0')
      setBalanceLoading(false)
    }
  }, [wallet, provider])

  const handleLoadWallet = async (e) => {
    e.preventDefault()
    setLoadError('')
    
    console.log('開始載入錢包...')
    console.log('當前用戶:', currentUser)
    
    try {
      const result = await loadWallet(password)
      console.log('錢包載入結果:', result)
      
      if (result) {
        setShowPasswordPrompt(false)
        setPassword('')
        console.log('✓ 錢包載入成功')
      } else {
        throw new Error('錢包載入失敗，請檢查密碼')
      }
    } catch (err) {
      console.error('❌ 載入錢包錯誤:', err)
      setLoadError(err.message || '載入錢包失敗')
    }
  }

  const handleRoleSelect = (role) => {
    login(role)
    if (role === 'user') {
      navigate('/deposit')
    } else {
      navigate('/admin')
    }
  }

  // 如果是已登入的使用者，顯示錢包資訊
  if (isAuthenticated && role === 'user') {
    return (
      <div className="home-page">
        <div className="hero-section">
          <h1>歡迎回來，{currentUser?.fullName || '使用者'}！</h1>
          <p>您的數位資產管理中心</p>
        </div>

        {showPasswordPrompt && !wallet ? (
          <div className="wallet-load-section">
            <div className="load-card">
              <h3>🔐 載入您的錢包</h3>
              <p>請輸入密碼以載入您的錢包進行交易</p>
              <form onSubmit={handleLoadWallet}>
                <div className="form-group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="輸入您的密碼"
                    disabled={walletLoading}
                    autoFocus
                  />
                </div>
                {loadError && <div className="error-message">{loadError}</div>}
                <button type="submit" className="btn-primary" disabled={walletLoading}>
                  {walletLoading ? '載入中...' : '載入錢包'}
                </button>
              </form>
            </div>
          </div>
        ) : wallet ? (
          <div className="wallet-info-section">
            <div className="wallet-card">
              <h3>💰 帳戶資訊</h3>
              <div className="info-row">
                <span className="label">帳號 ID:</span>
                <code className="user-id">{currentUser.shortUuid}</code>
              </div>
              <div className="info-row">
                <span className="label">NTD 餘額:</span>
                <span className="balance">
                  {balanceLoading ? '載入中...' : ntdBalance ? `${parseFloat(ntdBalance).toFixed(2)} NTD` : '0.00 NTD'}
                </span>
              </div>
            </div>

            <div className="quick-actions">
              <h3>快速功能</h3>
              <div className="action-buttons">
                <button className="btn-action" onClick={() => navigate('/deposit')}>
                  💵 存款
                </button>
                <button className="btn-action" onClick={() => navigate('/kyc')}>
                  ✅ KYC 驗證
                </button>
                <button className="btn-action" onClick={() => navigate('/creditcard')}>
                  💳 信用卡
                </button>
                <button className="btn-action" onClick={() => navigate('/disaster')}>
                  🆘 災難救助
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="features-section">
          <h2>平台特色</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>安全可靠</h3>
              <p>私鑰加密存儲，區塊鏈技術保障</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>無需外部錢包</h3>
              <p>系統自動管理交易，無需 MetaMask</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>透明監控</h3>
              <p>全程可追蹤的交易記錄</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌐</div>
              <h3>全球接軌</h3>
              <p>符合國際標準的數位資產</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 未登入或 admin 用戶顯示原本的頁面
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>歡迎來到 RWA 銀行系統</h1>
        <p>Real World Asset 數位化資產管理平台</p>
      </div>

      <div className="role-selection">
        <h2>選擇您的身份</h2>
        <div className="role-cards">
          <div className="role-card" onClick={() => handleRoleSelect('user')}>
            <div className="role-icon">👤</div>
            <h3>一般使用者</h3>
            <p>存款管理、KYC 驗證、信用卡服務</p>
            <button className="btn-primary">進入</button>
          </div>

          <div className="role-card" onClick={() => handleRoleSelect('admin')}>
            <div className="role-icon">⚙️</div>
            <h3>管理員</h3>
            <p>系統管理、審核與監控</p>
            <button className="btn-primary">進入</button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>平台特色</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>安全可靠</h3>
            <p>區塊鏈技術保障資產安全</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>即時交易</h3>
            <p>快速完成資產交易流程</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>透明監控</h3>
            <p>全程可追蹤的交易記錄</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>全球接軌</h3>
            <p>符合國際標準的數位資產</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
