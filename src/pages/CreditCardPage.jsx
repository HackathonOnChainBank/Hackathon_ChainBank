import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import { ABI as WALRUS_STORAGE_ABI } from '../config/WalrusStorage_ABI'
import { ABI as CREDIT_CARD_ABI } from '../config/CreditCard_ABI'
import './CreditCardPage.css'

// 圖片載入組件（帶 fallback）
function ImageWithFallback({ blobId, alt = 'Card Style', onImageLoadError }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const walrusUrls = [
    `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`,
    `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
    `https://wal-aggregator.staketab.org/v1/${blobId}`,
    `https://publisher.walrus-testnet.walrus.space/v1/${blobId}`
  ]

  const handleError = () => {
    if (currentUrlIndex < walrusUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1)
      setIsLoading(true)
    } else {
      setShowError(true)
      setIsLoading(false)
      // 通知父組件圖片載入失敗
      if (onImageLoadError) {
        onImageLoadError(blobId)
      }
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (showError) {
    return null // 不顯示失敗的圖片
  }

  return (
    <>
      {isLoading && (
        <div style={{
          width: '100%',
          height: '200px',
          background: '#f5f5f5',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}>
          ⏳ 載入中...
        </div>
      )}
      <img 
        src={walrusUrls[currentUrlIndex]} 
        alt={alt}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '12px',
          display: isLoading ? 'none' : 'block'
        }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  )
}

function CreditCardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  const { wallet, loadWallet, provider } = useWallet()

  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // 卡片樣式相關
  const [cardStyles, setCardStyles] = useState([])
  const [loadingStyles, setLoadingStyles] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [failedImages, setFailedImages] = useState(new Set())

  // 信用額度相關
  const [ntdBalance, setNtdBalance] = useState('0')
  const [creditLimit, setCreditLimit] = useState('0')
  const [calculatingLimit, setCalculatingLimit] = useState(false)

  // 申請記錄
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  // 申請表單
  const [userId, setUserId] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true)
    } else {
      setShowPasswordInput(false)
      setStatus('✓ 錢包已載入')
      loadCardStyles()
      loadNTDBalance()
      loadUserApplications()
    }
  }, [wallet])

  // 載入錢包
  const handleLoadWallet = async (e) => {
    e.preventDefault()
    if (!password) {
      setStatus('⚠️ 請輸入密碼')
      return
    }
    setLoading(true)
    try {
      await loadWallet(password)
      setStatus('✅ 錢包載入成功！')
      setPassword('')
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  // 載入 NTD 餘額並計算信用額度
  const loadNTDBalance = async () => {
    if (!wallet) {
      console.log('錢包未載入，跳過')
      return
    }

    console.log('開始載入 NTD 餘額，錢包地址:', wallet.address)
    setCalculatingLimit(true)
    try {
      const ntdAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!ntdAddress) {
        throw new Error('NTD_TOKEN 合約地址未設定')
      }
      console.log('NTD 合約地址:', ntdAddress)

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) {
        throw new Error('管理員私鑰未設定')
      }

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      console.log('RPC URL:', rpcUrl)
      
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      console.log('查詢 NTD 餘額...')
      const ntdContract = new ethers.Contract(ntdAddress, NTD_TOKEN_ABI, adminSigner)
      const balance = await ntdContract.balanceOf(wallet.address)
      const decimals = await ntdContract.decimals()
      
      const balanceFormatted = ethers.formatUnits(balance, decimals)
      console.log('NTD 餘額:', balanceFormatted)
      setNtdBalance(balanceFormatted)

      // 計算信用額度
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (creditCardAddress) {
        console.log('計算信用額度，合約地址:', creditCardAddress)
        const creditCardContract = new ethers.Contract(
          creditCardAddress,
          CREDIT_CARD_ABI,
          adminSigner
        )
        const limit = await creditCardContract.calculateCreditLimit(wallet.address)
        const limitFormatted = ethers.formatUnits(limit, decimals)
        console.log('信用額度:', limitFormatted)
        setCreditLimit(limitFormatted)
      } else {
        console.warn('CreditCard 合約地址未設定')
        setStatus('⚠️ CreditCard 合約地址未設定')
      }
    } catch (err) {
      console.error('載入 NTD 餘額錯誤:', err)
      setStatus('❌ 載入餘額失敗: ' + (err.message || err))
      // 設定預設值避免顯示 NaN
      setNtdBalance('0')
      setCreditLimit('0')
    } finally {
      setCalculatingLimit(false)
      console.log('載入完成')
    }
  }

  // 處理圖片載入失敗
  const handleImageLoadError = (blobId) => {
    console.log('圖片載入失敗:', blobId)
    setFailedImages(prev => new Set([...prev, blobId]))
    
    // 如果當前選中的樣式無法載入，自動選擇下一個可用的
    if (selectedStyle === blobId) {
      const availableStyles = cardStyles.filter(s => !failedImages.has(s.dataId) && s.dataId !== blobId)
      if (availableStyles.length > 0) {
        setSelectedStyle(availableStyles[0].dataId)
      } else {
        setSelectedStyle(null)
      }
    }
  }

  // 從 Walrus 載入卡片樣式
  const loadCardStyles = async () => {
    console.log('開始載入卡片樣式')
    setLoadingStyles(true)
    setFailedImages(new Set()) // 重置失敗記錄
    try {
      const walrusStorageAddress = import.meta.env.VITE_WALRUS_STORAGE_ADDRESS
      if (!walrusStorageAddress) {
        console.warn('Walrus Storage 合約地址未設定')
        setCardStyles([])
        return
      }
      console.log('Walrus Storage 地址:', walrusStorageAddress)

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const walrusContract = new ethers.Contract(
        walrusStorageAddress,
        WALRUS_STORAGE_ABI,
        adminSigner
      )

      // 假設管理員地址上傳了卡片樣式
      const adminAddress = adminSigner.address
      const files = await walrusContract.getAllFiles(adminAddress)
      
      console.log('管理員上傳的檔案:', files)
      
      // 過濾出圖片類型
      const imageFiles = files.filter(f => f.fileType && f.fileType.startsWith('image'))
      console.log('過濾後的圖片檔案:', imageFiles)
      setCardStyles(imageFiles)
      
      if (imageFiles.length > 0) {
        setSelectedStyle(imageFiles[0].dataId)
      }
    } catch (err) {
      console.error('載入卡片樣式錯誤:', err)
      setStatus('❌ 載入卡片樣式失敗: ' + (err.message || err))
    } finally {
      setLoadingStyles(false)
    }
  }

  // 載入用戶的申請記錄
  const loadUserApplications = async () => {
    if (!wallet) {
      console.log('錢包未載入，跳過申請記錄查詢')
      return
    }

    console.log('開始載入申請記錄')
    setLoadingApplications(true)
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (!creditCardAddress) {
        console.warn('CreditCard 合約地址未設定')
        setApplications([])
        return
      }
      console.log('查詢申請記錄，合約地址:', creditCardAddress)

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const creditCardContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      )

      const apps = await creditCardContract.getUserApplications(wallet.address)
      
      const formattedApps = apps.map((app, index) => ({
        index,
        userId: app.userId,
        creditLimit: ethers.formatUnits(app.creditLimit, 18),
        cardStyle: app.cardStyle,
        applicationTime: new Date(Number(app.applicationTime) * 1000).toLocaleString('zh-TW'),
        approved: app.approved,
        approvedTime: app.approved ? new Date(Number(app.approvedTime) * 1000).toLocaleString('zh-TW') : null
      }))

      setApplications(formattedApps)
    } catch (err) {
      console.error('載入申請記錄錯誤:', err)
      setStatus('❌ 載入申請記錄失敗: ' + (err.message || err))
    } finally {
      setLoadingApplications(false)
    }
  }

  // 申請信用卡
  const handleApplyCard = async (e) => {
    e.preventDefault()
    
    if (!wallet) {
      setStatus('⚠️ 請先載入錢包')
      return
    }

    if (!userId) {
      setStatus('⚠️ 請輸入用戶 ID')
      return
    }

    if (!selectedStyle) {
      setStatus('⚠️ 請選擇卡片樣式')
      return
    }

    if (parseFloat(creditLimit) <= 0) {
      setStatus('⚠️ 您的 NTD 餘額不足，無法申請信用卡（最低需 1000 NTD）')
      return
    }

    setApplying(true)
    setStatus('⏳ 正在提交申請...')

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (!creditCardAddress) throw new Error('CreditCard 合約地址未設定')

      // 使用用戶的錢包提交申請
      const creditCardContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        wallet
      )

      const tx = await creditCardContract.applyForCard(userId, selectedStyle)
      setStatus(`📤 申請已提交，交易雜湊: ${tx.hash.substring(0, 10)}...`)
      
      await tx.wait()
      setStatus('✅ 信用卡申請成功！已自動審核通過，您現在可以使用信用卡服務')
      
      // 重新載入申請記錄
      setUserId('')
      await loadUserApplications()
    } catch (err) {
      console.error('申請信用卡錯誤:', err)
      setStatus('❌ 申請失敗: ' + (err.message || err))
    } finally {
      setApplying(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="creditcard-page">
        <p>請先登入以使用信用卡服務</p>
      </div>
    )
  }

  return (
    <div className="creditcard-page">
      <div className="page-header">
        <h1>💳 信用卡申請</h1>
        <p>根據您的 NTD 餘額申請專屬信用卡</p>
      </div>

      {showPasswordInput && !wallet && (
        <div className="card">
          <h3>載入您的錢包</h3>
          <form onSubmit={handleLoadWallet} className="inline-form">
            <input 
              type="password" 
              placeholder="輸入您的密碼" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              autoFocus 
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? '🔄 載入中...' : '🔓 載入錢包'}
            </button>
          </form>
          <div className="small">💡 提示：請輸入您註冊時設定的密碼</div>
        </div>
      )}

      {wallet && (
        <>
          {/* NTD 餘額與信用額度 */}
          <div className="card balance-card">
            <h3>💰 您的資產與信用額度</h3>
            {calculatingLimit ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⏳ 正在載入您的資產資訊...</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>請稍候</p>
              </div>
            ) : (
              <div className="balance-info">
                <div className="balance-item">
                  <div className="balance-label">NTD 餘額</div>
                  <div className="balance-amount">
                    <span className="balance-number">
                      {parseFloat(ntdBalance).toLocaleString()}
                    </span>
                    <span className="balance-unit">NTD</span>
                  </div>
                </div>
                <div className="balance-item highlight-item">
                  <div className="balance-label">可申請額度</div>
                  <div className="balance-amount">
                    <span className="balance-number highlight-number">
                      {parseFloat(creditLimit).toLocaleString()}
                    </span>
                    <span className="balance-unit">NTD</span>
                  </div>
                </div>
                <div className="balance-item">
                  <div className="balance-label">額度倍數</div>
                  <div className="balance-amount">
                    <span className="balance-number">
                      {parseFloat(ntdBalance) > 0 
                        ? (parseFloat(creditLimit) / parseFloat(ntdBalance)).toFixed(2)
                        : '0.00'}
                    </span>
                    <span className="balance-unit">倍</span>
                  </div>
                </div>
              </div>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={loadNTDBalance}
              disabled={calculatingLimit}
              style={{ marginTop: '1rem', width: '100%', maxWidth: '300px', margin: '1.5rem auto 0' }}
            >
              🔄 重新計算額度
            </button>
          </div>

          {/* 卡片樣式選擇 */}
          <div className="card">
            <h3>🎨 選擇卡片樣式</h3>
            {loadingStyles ? (
              <p>⏳ 正在從 Walrus 載入卡片樣式...</p>
            ) : cardStyles.length === 0 ? (
              <p style={{ color: '#999' }}>目前沒有可用的卡片樣式</p>
            ) : (
              <>
                <div className="card-styles-grid">
                  {cardStyles
                    .filter(style => !failedImages.has(style.dataId))
                    .map((style, index) => (
                      <div 
                        key={index}
                        className={`card-style-item ${selectedStyle === style.dataId ? 'selected' : ''}`}
                        onClick={() => setSelectedStyle(style.dataId)}
                      >
                        <ImageWithFallback 
                          blobId={style.dataId} 
                          alt={`Card Style ${index + 1}`}
                          onImageLoadError={handleImageLoadError}
                        />
                        <div className="style-overlay">
                          {selectedStyle === style.dataId && <span className="selected-badge">✓ 已選擇</span>}
                        </div>
                      </div>
                    ))}
                </div>
                {cardStyles.filter(style => !failedImages.has(style.dataId)).length === 0 && (
                  <p style={{ color: '#f44336', textAlign: 'center', padding: '2rem' }}>
                    ⚠️ 所有卡片樣式都無法載入，請稍後再試
                  </p>
                )}
              </>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={loadCardStyles}
              disabled={loadingStyles}
              style={{ marginTop: '1rem' }}
            >
              🔄 重新載入樣式
            </button>
          </div>

          {/* 申請表單 */}
          <div className="card">
            <h3>📝 提交申請</h3>
            <form onSubmit={handleApplyCard}>
              <label>
                用戶 ID
                <input 
                  type="text" 
                  placeholder="請輸入您的用戶 ID" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={applying || parseFloat(creditLimit) <= 0}
                />
              </label>

              <div className="application-preview">
                <h4>申請預覽</h4>
                <div className="preview-item">
                  <span>用戶 ID:</span>
                  <strong>{userId || '(未填寫)'}</strong>
                </div>
                <div className="preview-item">
                  <span>核准額度:</span>
                  <strong>{parseFloat(creditLimit).toLocaleString()} NTD</strong>
                </div>
                <div className="preview-item">
                  <span>卡片樣式:</span>
                  <strong>{selectedStyle ? '已選擇' : '(未選擇)'}</strong>
                </div>
              </div>

              <button 
                className="btn" 
                type="submit" 
                disabled={applying || !userId || !selectedStyle || parseFloat(creditLimit) <= 0}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {applying ? '⏳ 提交中...' : '💳 提交申請'}
              </button>
            </form>
          </div>

          {/* 申請記錄 */}
          <div className="card">
            <h3>📋 我的申請記錄 ({applications.length})</h3>
            {loadingApplications ? (
              <p>⏳ 載入中...</p>
            ) : applications.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                目前沒有申請記錄
              </p>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div key={app.index} className={`application-item ${app.approved ? 'approved' : 'pending'}`}>
                    <div className="application-header">
                      <span className="application-id">申請 #{app.index + 1}</span>
                      <span className={`application-status ${app.approved ? 'status-approved' : 'status-pending'}`}>
                        {app.approved ? '✅ 已核准' : '⏳ 待審核'}
                      </span>
                    </div>
                    <div className="application-preview-small">
                      <ImageWithFallback 
                        blobId={app.cardStyle} 
                        alt="Card Style"
                        onImageLoadError={handleImageLoadError}
                      />
                    </div>
                    <div className="application-details">
                      <div className="detail-row">
                        <span>用戶 ID:</span>
                        <strong>{app.userId}</strong>
                      </div>
                      <div className="detail-row">
                        <span>信用額度:</span>
                        <strong>{parseFloat(app.creditLimit).toLocaleString()} NTD</strong>
                      </div>
                      <div className="detail-row">
                        <span>申請時間:</span>
                        <span>{app.applicationTime}</span>
                      </div>
                      {app.approved && (
                        <div className="detail-row">
                          <span>核准時間:</span>
                          <span>{app.approvedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={loadUserApplications}
              disabled={loadingApplications}
              style={{ marginTop: '1rem' }}
            >
              🔄 重新整理
            </button>
          </div>
        </>
      )}

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
          {status}
        </div>
      )}

      <div className="note">
        <p>💡 申請須知：</p>
        <ul>
          <li>信用額度根據您的 NTD 餘額自動計算</li>
          <li>最低申請門檻為 1,000 NTD 餘額</li>
          <li>提交申請後會自動審核通過</li>
          <li>審核通過後即可使用信用卡服務</li>
        </ul>
      </div>
    </div>
  )
}

export default CreditCardPage
