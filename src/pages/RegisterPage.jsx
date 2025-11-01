import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { generateUuidV4 } from '../contract/uuid-generator'
import { uuidToShortId } from '../contract/short-uuid'
import { useAuth } from '../contexts/AuthContext'
import { storePrivateKey } from '../utils/walletStorage'
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1) // 1: 填寫資料, 2: 設定密碼, 3: 顯示 shortUuid
  const [isCreating, setIsCreating] = useState(false)
  const [userForm, setUserForm] = useState({
    fullName: '',
    country: '',
    dateOfBirth: '',
    phoneCountryCode: '+886', // 預設台灣
    phone: '',
    email: ''
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [walletInfo, setWalletInfo] = useState(null)
  const [error, setError] = useState('')

  // 常用國家電話代碼
  const countryCodes = [
    { code: '+1', name: '美國/加拿大', flag: '🇺🇸' },
    { code: '+44', name: '英國', flag: '🇬🇧' },
    { code: '+81', name: '日本', flag: '🇯🇵' },
    { code: '+82', name: '韓國', flag: '🇰🇷' },
    { code: '+86', name: '中國', flag: '🇨🇳' },
    { code: '+852', name: '香港', flag: '🇭🇰' },
    { code: '+853', name: '澳門', flag: '🇲🇴' },
    { code: '+886', name: '台灣', flag: '🇹🇼' },
    { code: '+65', name: '新加坡', flag: '🇸🇬' },
    { code: '+60', name: '馬來西亞', flag: '🇲🇾' },
    { code: '+66', name: '泰國', flag: '🇹🇭' },
    { code: '+84', name: '越南', flag: '🇻🇳' },
    { code: '+63', name: '菲律賓', flag: '🇵🇭' },
    { code: '+62', name: '印尼', flag: '🇮🇩' },
  ]

  // 國家列表
  const countries = [
    '台灣', '中國', '香港', '澳門', '日本', '韓國', '新加坡', '馬來西亞',
    '泰國', '越南', '菲律賓', '印尼', '美國', '加拿大', '英國', '澳洲',
    '紐西蘭', '其他'
  ]

  // 創建新錢包
  const createWallet = () => {
    try {
      const wallet = ethers.Wallet.createRandom()
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      }
    } catch (error) {
      console.error('創建錢包失敗:', error)
      throw error
    }
  }

  // 生成 UUID 並轉換為 short UUID
  const generateShortUuid = () => {
    const uuid = generateUuidV4()
    const shortUuid = uuidToShortId(uuid)
    return { uuid, shortUuid }
  }

  // 儲存用戶資料到 localStorage（實際應該儲存到後端資料庫）
  const saveUserData = (userData) => {
    try {
      // 取得現有的用戶列表
      const existingUsers = JSON.parse(localStorage.getItem('chainbank_users') || '{}')
      
      // 新增用戶
      existingUsers[userData.shortUuid] = {
        ...userData,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      // 儲存回 localStorage
      localStorage.setItem('chainbank_users', JSON.stringify(existingUsers))
      
      // 儲存當前登入的用戶
      localStorage.setItem('chainbank_current_user', userData.shortUuid)
      
      console.log('用戶資料已儲存:', userData.shortUuid)
      return true
    } catch (error) {
      console.error('儲存用戶資料失敗:', error)
      return false
    }
  }

  // 處理基本資料提交（步驟1 -> 步驟2）
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // 驗證表單
      if (!userForm.fullName || !userForm.country || !userForm.dateOfBirth || !userForm.email) {
        throw new Error('請填寫所有必填欄位')
      }

      // 驗證 email 格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userForm.email)) {
        throw new Error('請輸入有效的電子郵件地址')
      }

      // 驗證電話號碼（如果有填寫）
      if (userForm.phone && !/^\d+$/.test(userForm.phone)) {
        throw new Error('電話號碼只能包含數字')
      }

      // 進入密碼設定步驟
      setStep(2)
    } catch (err) {
      setError(err.message || '驗證失敗，請重試')
    }
  }

  // 簡單的密碼 hash（實際應用中應使用更安全的方法）
  const hashPassword = async (password) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // 處理密碼提交並創建帳戶（步驟2 -> 步驟3）
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      // 驗證密碼
      if (!password || password.length < 8) {
        throw new Error('密碼至少需要 8 個字元')
      }

      if (password !== confirmPassword) {
        throw new Error('兩次輸入的密碼不一致')
      }

      // 1. 創建錢包
      console.log('正在創建錢包...')
      const wallet = createWallet()
      
      // 2. 生成 UUID
      console.log('正在生成 UUID...')
      const { uuid, shortUuid } = generateShortUuid()
      
      // 系統管理員後台記錄（用於 uuid2wallet.js 映射）
      console.log('=== 系統管理員記錄 ===')
      console.log(`"${shortUuid}": {`)
      console.log(`  address: "${wallet.address}",`)
      console.log(`  privateKey: "${wallet.privateKey}"`)
      console.log('}')
      console.log('======================')

      // 3. Hash 密碼
      const passwordHash = await hashPassword(password)

      // 4. 存儲私鑰（加密後存入 localStorage）
      console.log('正在存儲私鑰...')
      const keyStored = storePrivateKey(shortUuid, wallet.address, wallet.privateKey, password)
      
      if (!keyStored) {
        throw new Error('私鑰存儲失敗')
      }
      console.log('✓ 私鑰已安全存儲')

      // 5. 組合用戶資料（不包含 privateKey）
      const userData = {
        // 基本資料
        ...userForm,
        // UUID 資訊
        uuid,
        shortUuid,
        // 錢包資訊（只存地址，不存私鑰）
        walletAddress: wallet.address,
        // 密碼 hash
        passwordHash,
        // 網路資訊
        network: 'celo-sepolia',
        chainId: 11145550
      }

      // 6. 使用 AuthContext 註冊
      console.log('正在註冊用戶...')
      const registeredUser = register(userData)
      
      console.log('✓ 用戶註冊成功！', registeredUser)

      // 7. 轉 CELO 給新用戶作為 gas fee
      console.log('正在轉帳 CELO 作為 gas fee...')
      try {
        await transferInitialGasFee(wallet.address)
        console.log('✓ 初始 gas fee 已轉帳')
      } catch (gasError) {
        console.warn('Gas fee 轉帳失敗:', gasError)
        // 不中斷註冊流程，只記錄錯誤
      }

      // 8. 儲存必要資訊並進入下一步
      setWalletInfo({
        ...userData,
        privateKey: wallet.privateKey, // 暫存用於顯示（可選）
        mnemonic: wallet.mnemonic
      })
      setStep(3)

    } catch (err) {
      console.error('註冊錯誤:', err)
      setError(err.message || '註冊失敗，請重試')
    } finally {
      setIsCreating(false)
    }
  }
 // 轉帳初始 gas fee 給新用戶
  const transferInitialGasFee = async (recipientAddress) => {
    try {
      // 使用管理員私鑰
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) {
        throw new Error('管理員私鑰未設定')
      }
      console.log('管理員私鑰已載入')

      // 連接到 Celo Sepolia RPC
      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      console.log('RPC URL:', rpcUrl)
      
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const adminWallet = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        provider
      )

      // 轉帳金額（例如：0.01 CELO，足夠支付多次交易的 gas）
      const amount = ethers.parseEther('0.05') 

      console.log('從管理員錢包轉帳:', adminWallet.address)
      console.log('到新用戶錢包:', recipientAddress)
      console.log('金額:', ethers.formatEther(amount), 'CELO')

      const tx = await adminWallet.sendTransaction({
        to: recipientAddress,
        value: amount,
        gasLimit: 21000 // 標準轉帳 gas limit
      })

      console.log('交易已提交:', tx.hash)
      
      // 等待確認
      const receipt = await tx.wait()
      console.log('交易已確認，區塊:', receipt.blockNumber)
      
      return receipt
    } catch (error) {
      console.error('轉帳 gas fee 失敗:', error)
      throw error
    }
  }


  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    alert(`${label}已複製到剪貼簿`)
  }



  const handleComplete = () => {
    // 導向首頁或儀表板
    window.location.href = '/'
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>🏦 ChainBank 用戶註冊</h1>
          <p>填寫基本資料，系統將自動為您創建區塊鏈錢包</p>
        </div>

        {step === 1 && (
          <div className="register-form-section">
            <div className="progress-bar">
              <div className="progress-step active">
                <div className="step-number">1</div>
                <div className="step-label">基本資料</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">2</div>
                <div className="step-label">設定密碼</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">3</div>
                <div className="step-label">完成註冊</div>
              </div>
            </div>

            <form className="register-form" onSubmit={handleFormSubmit}>
              <h2>基本資料</h2>
              
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  placeholder="請輸入真實姓名"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>國家 *</label>
                  <select
                    value={userForm.country}
                    onChange={(e) => setUserForm({...userForm, country: e.target.value})}
                    required
                  >
                    <option value="">請選擇國家</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>出生日期 *</label>
                  <input
                    type="date"
                    value={userForm.dateOfBirth}
                    onChange={(e) => setUserForm({...userForm, dateOfBirth: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>電話號碼</label>
                <div className="phone-input-group">
                  <select
                    className="country-code-select"
                    value={userForm.phoneCountryCode}
                    onChange={(e) => setUserForm({...userForm, phoneCountryCode: e.target.value})}
                  >
                    {countryCodes.map(item => (
                      <option key={item.code} value={item.code}>
                        {item.flag} {item.code} {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="phone-number-input"
                    placeholder="912345678"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
                <small>選填：請輸入不含國碼的電話號碼</small>
              </div>

              <div className="form-group">
                <label>電子郵件（登入帳號）*</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
                <small>此電子郵件將作為您的登入帳號</small>
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <div className="form-info">
                <h3>📝 註冊說明</h3>
                <ul>
                  <li>系統將自動為您創建 Celo Sepolia 測試網錢包</li>
                  <li>每位用戶將獲得唯一的用戶 ID (Short UUID)</li>
                  <li>請妥善保管錢包資訊，特別是私鑰和助記詞</li>
                  <li>所有資料將加密儲存</li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-large"
              >
                下一步：設定密碼
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="register-form-section">
            <div className="progress-bar">
              <div className="progress-step completed">
                <div className="step-number">✓</div>
                <div className="step-label">基本資料</div>
              </div>
              <div className="progress-line completed"></div>
              <div className="progress-step active">
                <div className="step-number">2</div>
                <div className="step-label">設定密碼</div>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">3</div>
                <div className="step-label">完成註冊</div>
              </div>
            </div>

            <form className="register-form" onSubmit={handlePasswordSubmit}>
              <h2>🔐 設定登入密碼</h2>
              
              <div className="form-group">
                <label>密碼 *</label>
                <input
                  type="password"
                  placeholder="請輸入密碼（至少 8 個字元）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label>確認密碼 *</label>
                <input
                  type="password"
                  placeholder="請再次輸入密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="8"
                />
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <div className="form-info">
                <h3>🔒 密碼安全提示</h3>
                <ul>
                  <li>密碼至少需要 8 個字元</li>
                  <li>建議使用大小寫字母、數字和特殊符號組合</li>
                  <li>不要使用過於簡單的密碼</li>
                  <li>請妥善保管您的密碼，遺失後無法找回</li>
                </ul>
              </div>

              <div className="action-buttons">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  上一步
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? '正在創建帳戶...' : '創建帳戶'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && walletInfo && (
          <div className="wallet-info-section">
            <div className="progress-bar">
              <div className="progress-step completed">
                <div className="step-number">✓</div>
                <div className="step-label">基本資料</div>
              </div>
              <div className="progress-line completed"></div>
              <div className="progress-step completed">
                <div className="step-number">✓</div>
                <div className="step-label">設定密碼</div>
              </div>
              <div className="progress-line completed"></div>
              <div className="progress-step active">
                <div className="step-number">3</div>
                <div className="step-label">完成註冊</div>
              </div>
            </div>

            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>註冊成功！</h2>
              <p>您的帳戶已創建完成</p>
            </div>

            <div className="wallet-details">
              <h3>🆔 您的登入帳號</h3>
              <div className="info-card highlight-card">
                <div className="info-row">
                  <span className="info-label">帳號 ID</span>
                  <div className="info-value">
                    <code className="large-code">{walletInfo.shortUuid}</code>
                    <button 
                      className="btn-copy"
                      onClick={() => copyToClipboard(walletInfo.shortUuid, '帳號 ID')}
                    >
                      複製
                    </button>
                  </div>
                </div>
              </div>

              <div className="warning-card">
                <h3>⚠️ 重要提醒</h3>
                <div className="warning-text">
                  <p><strong>請務必記住以下資訊：</strong></p>
                  <ul>
                    <li><strong>帳號 ID：</strong>{walletInfo.shortUuid}</li>
                    <li><strong>密碼：</strong>您剛才設定的密碼</li>
                  </ul>
                  <p style={{ color: '#d32f2f', marginTop: '16px' }}>
                    ⛔ 請妥善保管此帳號 ID，<strong>遺失後無法找回</strong>
                  </p>
                </div>
              </div>

              <div className="form-info">
                <h3>📱 如何使用</h3>
                <ul>
                  <li>使用您的<strong>帳號 ID</strong>和<strong>密碼</strong>登入系統</li>
                  <li>系統會自動為您管理區塊鏈錢包</li>
                  <li>無需記憶複雜的私鑰或助記詞</li>
                  <li>所有交易都由系統安全處理</li>
                  <li>您只需要記住<strong>帳號 ID</strong>和<strong>密碼</strong>即可</li>
                </ul>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-primary btn-large"
                  onClick={handleComplete}
                >
                  完成註冊，開始使用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegisterPage
