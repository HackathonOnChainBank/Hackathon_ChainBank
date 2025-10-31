import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, currentUser, role, getAllUsers } = useAuth()
  const { wallet, loadWallet, provider, isLoading: walletLoading } = useWallet()
  const [ntdBalance, setNtdBalance] = useState('0')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [loadError, setLoadError] = useState('')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [transferHistory, setTransferHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  // 獲取轉帳記錄的函數
  const fetchTransferHistory = async () => {
    if (!wallet || !provider) return

    setHistoryLoading(true)
    try {
        const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
        if (!contractAddress) return

        const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, provider)
        
        // 從創世區塊開始搜尋所有歷史記錄
        const fromBlock = 0
        const currentBlock = await provider.getBlockNumber()
        
        console.log(`📊 搜尋轉帳記錄: 從區塊 ${fromBlock} 到 ${currentBlock}`)
        
        // 查詢該用戶發送或接收的 Transfer 事件
        const sentFilter = contract.filters.Transfer(wallet.address, null)
        const receivedFilter = contract.filters.Transfer(null, wallet.address)
        
        const [sentEvents, receivedEvents] = await Promise.all([
          contract.queryFilter(sentFilter, fromBlock, currentBlock),
          contract.queryFilter(receivedFilter, fromBlock, currentBlock)
        ])
        
        console.log(`✅ 找到 ${sentEvents.length} 筆轉出記錄, ${receivedEvents.length} 筆轉入記錄`)
        
        // 合併並排序事件
        const allEvents = [...sentEvents, ...receivedEvents]
        allEvents.sort((a, b) => b.blockNumber - a.blockNumber)
        
        // 格式化記錄並查找對方的姓名或ID
        const decimals = await contract.decimals()
        const allUsers = getAllUsers()
        
        const history = await Promise.all(
          allEvents.slice(0, 10).map(async (event) => {
            const block = await event.getBlock()
            const isSent = event.args[0].toLowerCase() === wallet.address.toLowerCase()
            const otherAddress = isSent ? event.args[1] : event.args[0]
            
            // 查找對方的用戶資料
            let otherUserName = null
            let otherUserId = null
            
            for (const [userId, userData] of Object.entries(allUsers)) {
              if (userData.walletAddress && userData.walletAddress.toLowerCase() === otherAddress.toLowerCase()) {
                otherUserName = userData.fullName
                otherUserId = userId
                break
              }
            }
            
            return {
              hash: event.transactionHash,
              from: event.args[0],
              to: event.args[1],
              amount: ethers.formatUnits(event.args[2], decimals),
              timestamp: new Date(block.timestamp * 1000),
              blockNumber: event.blockNumber,
              type: isSent ? 'sent' : 'received',
              otherUserName: otherUserName,
              otherUserId: otherUserId,
              otherAddress: otherAddress
            }
          })
        )
        
        console.log('📋 格式化後的轉帳記錄:', history)
        setTransferHistory(history)
        console.log('✅ 已更新 transferHistory state, 共', history.length, '筆記錄')
      } catch (err) {
        console.error('❌ 獲取轉帳記錄失敗:', err)
        console.error('錯誤堆疊:', err.stack)
      } finally {
        setHistoryLoading(false)
      }
  }

  // 在錢包載入後自動獲取轉帳記錄
  useEffect(() => {
    fetchTransferHistory()
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

  const handleRoleSelect = (role, action) => {
    login(role)
    if (role === 'user') {
      if (action === 'login') {
        navigate('/login')
      } else if (action === 'register') {
        navigate('/register')
      }
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
                  💵 一般存款
                </button>
                <button className="btn-action" onClick={() => navigate('/transfer')}>
                  ✅ 轉帳
                </button>
                <button className="btn-action" onClick={() => navigate('/creditcard')}>
                  💳 信用卡
                </button>
                <button className="btn-action" onClick={() => navigate('/disaster')}>
                  🆘 災難救助
                </button>
              </div>
            </div>

            <div className="transfer-history-section">
              <div className="history-header">
                <h3>💸 最近轉帳記錄 ({transferHistory.length})</h3>
                <button 
                  className="btn-refresh" 
                  onClick={fetchTransferHistory}
                  disabled={historyLoading}
                >
                  🔄 {historyLoading ? '載入中...' : '重新整理'}
                </button>
              </div>
              {console.log('🖥️ 前端顯示狀態:', { historyLoading, recordCount: transferHistory.length })}
              {historyLoading ? (
                <div className="loading-message">載入中...</div>
              ) : transferHistory.length === 0 ? (
                <div className="empty-message">暫無轉帳記錄</div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>類型</th>
                      <th>金額 (NTD)</th>
                      <th>對方</th>
                      <th>時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferHistory.map((record) => (
                      <tr key={record.hash}>
                        <td className={`type-cell ${record.type}`}>
                          {record.type === 'sent' ? '轉出' : '轉入'}
                        </td>
                        <td className="amount-cell">
                          {record.type === 'sent' ? '-' : '+'}{parseFloat(record.amount).toFixed(2)}
                        </td>
                        <td className="user-cell">
                          {record.otherUserName ? (
                            <div>
                              <div className="user-name">{record.otherUserName}</div>
                              {record.otherUserId && (
                                <div className="user-id-small">({record.otherUserId})</div>
                              )}
                            </div>
                          ) : record.otherUserId ? (
                            <div className="user-id-only">{record.otherUserId}</div>
                          ) : (
                            <div className="address-fallback">
                              {record.otherAddress.slice(0, 6)}...{record.otherAddress.slice(-4)}
                            </div>
                          )}
                        </td>
                        <td className="time-cell">
                          {record.timestamp.toLocaleString('zh-TW', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
          <div className="role-card">
            <div className="role-icon">👤</div>
            <h3>一般使用者</h3>
            <p style={{ marginBottom: '15px' }}>存款管理、KYC 驗證、信用卡服務</p>
            <div className="auth-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => handleRoleSelect('user', 'login')}>
                登入
              </button>
              <button className="btn-primary" onClick={() => handleRoleSelect('user', 'register')}>
                註冊
              </button>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon">⚙️</div>
            <h3>管理員</h3>
            <p style={{ marginBottom: '15px' }}>系統管理、審核與監控</p>
            <div className="auth-buttons">
              <button className="btn-primary" onClick={() => handleRoleSelect('admin')}>
                進入
              </button>
            </div>
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
