import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import { ABI as CREDIT_CARD_ABI } from '../config/CreditCard_ABI'
import './CreditCardSpendPage.css'

function CreditCardSpendPage() {
  const { isAuthenticated, currentUser } = useAuth()
  const { wallet, loadWallet } = useWallet()

  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // 信用卡資訊
  const [creditInfo, setCreditInfo] = useState({
    limit: '0',
    balance: '0',
    available: '0'
  })
  const [loadingCredit, setLoadingCredit] = useState(false)

  // 消費記錄
  const [spendRecords, setSpendRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  // 商家列表
  const [merchantList, setMerchantList] = useState([])
  const [showAddMerchant, setShowAddMerchant] = useState(false)
  const [newMerchantAddress, setNewMerchantAddress] = useState('')
  const [newMerchantName, setNewMerchantName] = useState('')

  // 消費表單
  const [merchantAddress, setMerchantAddress] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [spending, setSpending] = useState(false)

  // 還款表單
  const [repayAmount, setRepayAmount] = useState('')
  const [repaying, setRepaying] = useState(false)

  // 載入商家列表
  useEffect(() => {
    const savedMerchants = localStorage.getItem('chainbank_merchants')
    if (savedMerchants) {
      try {
        const merchants = JSON.parse(savedMerchants)
        setMerchantList(merchants)
      } catch (err) {
        console.error('載入商家列表失敗:', err)
        setMerchantList([])
      }
    }
  }, [])

  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true)
    } else {
      setShowPasswordInput(false)
      setStatus('✓ 錢包已載入')
      loadCreditInfo()
      loadSpendRecords()
    }
  }, [wallet])

  // 根據地址查找商家名稱
  const getMerchantName = (address) => {
    const merchant = merchantList.find(m => m.address.toLowerCase() === address.toLowerCase())
    if (merchant) {
      return merchant.name
    }
    // 如果找不到，顯示地址縮寫
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 新增商家
  const handleAddMerchant = () => {
    if (!newMerchantAddress || !ethers.isAddress(newMerchantAddress)) {
      setStatus('⚠️ 請輸入有效的商家地址')
      return
    }
    if (!newMerchantName.trim()) {
      setStatus('⚠️ 請輸入商家名稱')
      return
    }

    const merchant = {
      address: newMerchantAddress,
      name: newMerchantName.trim()
    }

    const updatedList = [...merchantList, merchant]
    setMerchantList(updatedList)
    localStorage.setItem('chainbank_merchants', JSON.stringify(updatedList))

    setMerchantAddress(newMerchantAddress)
    setNewMerchantAddress('')
    setNewMerchantName('')
    setShowAddMerchant(false)
    setStatus('✅ 商家新增成功！')
  }

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

  // 載入信用卡資訊
  const loadCreditInfo = async () => {
    if (!wallet) return

    setLoadingCredit(true)
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定')

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      )

      const info = await creditContract.credits(wallet.address)
      const limit = ethers.formatUnits(info.limit, 18)
      const balance = ethers.formatUnits(info.balance, 18)
      const available = (parseFloat(limit) - parseFloat(balance)).toFixed(2)

      setCreditInfo({
        limit,
        balance,
        available
      })
    } catch (err) {
      console.error('載入信用卡資訊錯誤:', err)
      setStatus('❌ 載入信用卡資訊失敗: ' + (err.message || err))
    } finally {
      setLoadingCredit(false)
    }
  }

  // 載入消費記錄
  const loadSpendRecords = async () => {
    if (!wallet) return

    setLoadingRecords(true)
    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定')

      // 使用管理員私鑰查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      )

      const records = await creditContract.getSpendRecords(wallet.address)
      
      const formattedRecords = records.map((record, index) => ({
        index,
        merchant: record.merchant,
        amount: ethers.formatUnits(record.amount, 18),
        timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString('zh-TW')
      }))

      setSpendRecords(formattedRecords)
    } catch (err) {
      console.error('載入消費記錄錯誤:', err)
      setStatus('❌ 載入消費記錄失敗: ' + (err.message || err))
    } finally {
      setLoadingRecords(false)
    }
  }

  // 信用卡消費
  const handleSpend = async (e) => {
    e.preventDefault()

    if (!wallet) {
      setStatus('⚠️ 請先載入錢包')
      return
    }

    if (!merchantAddress || !ethers.isAddress(merchantAddress)) {
      setStatus('⚠️ 請輸入有效的商家地址')
      return
    }

    if (!spendAmount || parseFloat(spendAmount) <= 0) {
      setStatus('⚠️ 請輸入有效的消費金額')
      return
    }

    if (parseFloat(spendAmount) > parseFloat(creditInfo.available)) {
      setStatus('⚠️ 消費金額超過可用額度')
      return
    }

    setSpending(true)
    setStatus('⏳ 正在處理消費...')

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      if (!creditCardAddress) throw new Error('CreditCardProduct 合約地址未設定')

      // 使用管理員私鑰執行消費
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      )

      const amount = ethers.parseUnits(spendAmount, 18)
      const tx = await creditContract.spend(wallet.address, merchantAddress, amount)
      setStatus(`📤 消費處理中，交易雜湊: ${tx.hash.substring(0, 10)}...`)

      await tx.wait()
      setStatus('✅ 消費成功！')

      // 清空表單並重新載入資訊
      setMerchantAddress('')
      setSpendAmount('')
      await loadCreditInfo()
      await loadSpendRecords()
    } catch (err) {
      console.error('消費錯誤:', err)
      setStatus('❌ 消費失敗: ' + (err.message || err))
    } finally {
      setSpending(false)
    }
  }

  // 還款
  const handleRepay = async (e) => {
    e.preventDefault()

    if (!wallet) {
      setStatus('⚠️ 請先載入錢包')
      return
    }

    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setStatus('⚠️ 請輸入有效的還款金額')
      return
    }

    if (parseFloat(repayAmount) > parseFloat(creditInfo.balance)) {
      setStatus('⚠️ 還款金額超過欠款餘額')
      return
    }

    setRepaying(true)
    setStatus('⏳ 正在處理還款...')

    try {
      const creditCardAddress = import.meta.env.VITE_CREDITCARD_CONTRACT_ADDRESS
      const ntdAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!creditCardAddress || !ntdAddress) throw new Error('合約地址未設定')

      // 先用用戶錢包 approve NTD_TOKEN
      const ntdContract = new ethers.Contract(ntdAddress, NTD_TOKEN_ABI, wallet)
      const amount = ethers.parseUnits(repayAmount, 18)
      
      setStatus('⏳ 正在授權 NTD 轉帳...')
      const approveTx = await ntdContract.approve(creditCardAddress, amount)
      await approveTx.wait()

      // 使用管理員私鑰執行還款
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        providerAdmin
      )

      const creditContract = new ethers.Contract(
        creditCardAddress,
        CREDIT_CARD_ABI,
        adminSigner
      )

      setStatus('⏳ 正在執行還款...')
      const tx = await creditContract.repay(wallet.address, amount)
      setStatus(`📤 還款處理中，交易雜湊: ${tx.hash.substring(0, 10)}...`)

      await tx.wait()
      setStatus('✅ 還款成功！')

      // 清空表單並重新載入資訊
      setRepayAmount('')
      await loadCreditInfo()
    } catch (err) {
      console.error('還款錯誤:', err)
      setStatus('❌ 還款失敗: ' + (err.message || err))
    } finally {
      setRepaying(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="creditcard-spend-page">
        <p>請先登入以使用信用卡服務</p>
      </div>
    )
  }

  return (
    <div className="creditcard-spend-page">
      <div className="page-header">
        <h1>💳 信用卡消費與還款</h1>
        <p>使用您的信用卡進行消費，並隨時還款</p>
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
          {/* 信用額度資訊 - 使用與 CreditCardPage 相同的小卡樣式 */}
          <div className="card balance-card">
            <h3>您的資產與信用額度</h3>
            <div className="balance-info">
              <div className="balance-item">
                <div className="balance-label">信用額度</div>
                <div className="balance-amount">
                  {loadingCredit ? (
                    <span className="balance-number">載入中...</span>
                  ) : (
                    <>
                      <span className="balance-number">{parseFloat(creditInfo.limit).toLocaleString()}</span>
                      <span className="balance-unit">NTD</span>
                    </>
                  )}
                </div>
              </div>

              <div className="balance-item">
                <div className="balance-label">已使用額度</div>
                <div className="balance-amount">
                  {loadingCredit ? (
                    <span className="balance-number">載入中...</span>
                  ) : (
                    <>
                      <span className="balance-number">{parseFloat(creditInfo.balance).toLocaleString()}</span>
                      <span className="balance-unit">NTD</span>
                    </>
                  )}
                </div>
              </div>

              <div className="balance-item highlight-item">
                <div className="balance-label">可用額度</div>
                <div className="balance-amount">
                  {loadingCredit ? (
                    <span className="balance-number highlight-number">載入中...</span>
                  ) : (
                    <>
                      <span className="balance-number highlight-number">{parseFloat(creditInfo.available).toLocaleString()}</span>
                      <span className="balance-unit">NTD</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={loadCreditInfo}
              disabled={loadingCredit}
              style={{ marginTop: '0.5rem' }}
            >
              🔄 重新整理
            </button>
          </div>
        
          <div className="card balance-card">
            {/* 消費表單 - 改用小卡片樣式 */}
            <div className="card balance-card">
              <h3>💸 信用卡消費</h3>
              <form onSubmit={handleSpend}>
                <div className="form-field">
                  <label className="field-label">商家</label>
                  {!showAddMerchant ? (
                    <>
                      <select 
                        className="field-input"
                        value={merchantAddress}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setShowAddMerchant(true)
                          } else {
                            setMerchantAddress(e.target.value)
                          }
                        }}
                        disabled={spending || parseFloat(creditInfo.limit) === 0}
                      >
                        <option value="">-- 請選擇商家 --</option>
                        {merchantList.map((merchant, index) => (
                          <option key={index} value={merchant.address}>
                            {merchant.name}
                          </option>
                        ))}
                        <option value="ADD_NEW">➕ 新增商家</option>
                      </select>
                    </>
                  ) : (
                    <div className="add-merchant-form">
                      <input 
                        type="text"
                        className="field-input"
                        placeholder="商家名稱 (例: 統一超商)"
                        value={newMerchantName}
                        onChange={(e) => setNewMerchantName(e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <input 
                        type="text"
                        className="field-input"
                        placeholder="商家錢包地址 (0x...)"
                        value={newMerchantAddress}
                        onChange={(e) => setNewMerchantAddress(e.target.value)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button"
                          className="btn-quick"
                          onClick={handleAddMerchant}
                        >
                          ✓ 確認新增
                        </button>
                        <button 
                          type="button"
                          className="btn-quick"
                          onClick={() => {
                            setShowAddMerchant(false)
                            setNewMerchantAddress('')
                            setNewMerchantName('')
                          }}
                        >
                          ✕ 取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">消費金額 (NTD)</label>
                  <input 
                    type="number" 
                    className="field-input"
                    placeholder="請輸入消費金額" 
                    value={spendAmount} 
                    onChange={(e) => setSpendAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={spending || parseFloat(creditInfo.limit) === 0}
                  />
                </div>

                <div className="info-display">
                  <span className="info-label">可用額度</span>
                  <span className="info-value">{parseFloat(creditInfo.available).toLocaleString()} NTD</span>
                </div>

                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={spending || !merchantAddress || !spendAmount || parseFloat(creditInfo.limit) === 0}
                >
                  {spending ? '⏳ 處理中...' : '💳 確認消費'}
                </button>
              </form>
            </div>

            {/* 還款表單 - 改用小卡片樣式 */}
            <div className="card balance-card">
              <h3>💰 信用卡還款</h3>
              <form onSubmit={handleRepay}>
                <div className="form-field">
                  <label className="field-label">還款金額 (NTD)</label>
                  <input 
                    type="number" 
                    className="field-input"
                    placeholder="請輸入還款金額" 
                    value={repayAmount} 
                    onChange={(e) => setRepayAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={repaying || parseFloat(creditInfo.balance) === 0}
                  />
                </div>

                <div className="info-display">
                  <span className="info-label">當前欠款</span>
                  <span className="info-value debt-highlight">{parseFloat(creditInfo.balance).toLocaleString()} NTD</span>
                </div>

                <div className="quick-actions">
                  <span className="quick-label">快速選擇:</span>
                  <div className="quick-buttons">
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => setRepayAmount(creditInfo.balance)}
                      disabled={repaying || parseFloat(creditInfo.balance) === 0}
                    >
                      全額還款
                    </button>
                    <button 
                      type="button" 
                      className="btn-quick"
                      onClick={() => setRepayAmount((parseFloat(creditInfo.balance) / 2).toFixed(2))}
                      disabled={repaying || parseFloat(creditInfo.balance) === 0}
                    >
                      50%
                    </button>
                  </div>
                </div>

                <button 
                  className="btn btn-success" 
                  type="submit" 
                  disabled={repaying || !repayAmount || parseFloat(creditInfo.balance) === 0}
                >
                  {repaying ? '⏳ 處理中...' : '💰 確認還款'}
                </button>
              </form>
            </div>
          </div>

          {/* 消費記錄 */}
          <div className="card">
            <h3>📋 消費記錄 ({spendRecords.length})</h3>
            {loadingRecords ? (
              <p>⏳ 載入中...</p>
            ) : spendRecords.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                目前沒有消費記錄
              </p>
            ) : (
              <div className="records-table-container">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>序號</th>
                      <th>商家名稱</th>
                      <th>消費金額</th>
                      <th>消費時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendRecords.map((record) => (
                      <tr key={record.index}>
                        <td>#{record.index + 1}</td>
                        <td>
                          <span className="merchant-name">
                            {getMerchantName(record.merchant)}
                          </span>
                        </td>
                        <td className="amount-cell">
                          {parseFloat(record.amount).toLocaleString()} NTD
                        </td>
                        <td>{record.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={loadSpendRecords}
              disabled={loadingRecords}
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
        <p>💡 使用說明：</p>
        <ul>
          <li>💳 <strong>消費：</strong>使用信用卡向商家付款，由合約代墊金額</li>
          <li>💰 <strong>還款：</strong>使用您的 NTD_TOKEN 還款，減少欠款餘額</li>
          <li>📊 消費金額不能超過可用額度</li>
          <li>🔄 還款後可用額度會立即恢復</li>
        </ul>
      </div>
    </div>
  )
}

export default CreditCardSpendPage
