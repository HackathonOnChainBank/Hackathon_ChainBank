import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import { getWalletAddress } from '../utils/walletStorage'
import './TransferPage.css'

function TransferPage() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser, getAllUsers } = useAuth()
  const { wallet, loadWallet, provider } = useWallet()

  const [recipientId, setRecipientId] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [recipientInfo, setRecipientInfo] = useState(null)
  
  // 約定轉帳相關
  const [savedRecipients, setSavedRecipients] = useState([])
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [newRecipientId, setNewRecipientId] = useState('')
  const [newRecipientNote, setNewRecipientNote] = useState('')
  const [selectedSavedRecipient, setSelectedSavedRecipient] = useState('')

  // 載入約定轉帳名單
  useEffect(() => {
    if (currentUser) {
      const storageKey = `chainbank_saved_recipients_${currentUser}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          setSavedRecipients(JSON.parse(saved))
        } catch (err) {
          console.error('載入約定轉帳名單失敗:', err)
        }
      }
    }
  }, [currentUser])

  // 檢查是否已經有錢包載入（從 HomePage 或其他頁面）
  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true)
    } else {
      setShowPasswordInput(false)
      setStatus('✓ 錢包已自動載入')
    }
  }, [wallet])

  // 當使用者輸入 ID 時，查詢對應的地址和資訊
  const handleRecipientIdChange = (id) => {
    setRecipientId(id)
    
    if (!id.trim()) {
      setSelectedAddress('')
      setRecipientInfo(null)
      return
    }

    // 查詢該 ID 的錢包地址和使用者資訊
    const addr = getWalletAddress(id)
    if (addr) {
      setSelectedAddress(addr)
      
      // 獲取使用者資訊
      const allUsers = getAllUsers()
      const userInfo = allUsers[id]
      setRecipientInfo(userInfo)
    } else {
      setSelectedAddress('')
      setRecipientInfo(null)
    }
  }

  // 新增約定轉帳對象
  const handleAddSavedRecipient = () => {
    if (!newRecipientId.trim()) {
      setStatus('⚠️ 請輸入接收者 ID')
      return
    }
    if (!newRecipientNote.trim()) {
      setStatus('⚠️ 請輸入備註')
      return
    }

    // 驗證該 ID 是否存在
    const addr = getWalletAddress(newRecipientId)
    if (!addr) {
      setStatus('❌ 找不到此帳號 ID')
      return
    }

    // 檢查是否已經存在
    if (savedRecipients.find(r => r.recipientId === newRecipientId)) {
      setStatus('⚠️ 此接收者已在約定轉帳名單中')
      return
    }

    const newRecipient = {
      recipientId: newRecipientId,
      note: newRecipientNote.trim(),
      address: addr,
      addedAt: new Date().toISOString()
    }

    const updated = [...savedRecipients, newRecipient]
    setSavedRecipients(updated)
    
    // 儲存到 localStorage
    const storageKey = `chainbank_saved_recipients_${currentUser}`
    localStorage.setItem(storageKey, JSON.stringify(updated))

    setStatus('✅ 已新增到約定轉帳名單')
    setNewRecipientId('')
    setNewRecipientNote('')
    setShowAddRecipient(false)
  }

  // 選擇約定轉帳對象
  const handleSelectSavedRecipient = (recipientId) => {
    setSelectedSavedRecipient(recipientId)
    if (recipientId) {
      handleRecipientIdChange(recipientId)
    } else {
      setRecipientId('')
      setSelectedAddress('')
      setRecipientInfo(null)
    }
  }

  // 刪除約定轉帳對象
  const handleDeleteSavedRecipient = (recipientId) => {
    const updated = savedRecipients.filter(r => r.recipientId !== recipientId)
    setSavedRecipients(updated)
    
    const storageKey = `chainbank_saved_recipients_${currentUser}`
    localStorage.setItem(storageKey, JSON.stringify(updated))
    
    if (selectedSavedRecipient === recipientId) {
      setSelectedSavedRecipient('')
      setRecipientId('')
      setSelectedAddress('')
      setRecipientInfo(null)
    }
    
    setStatus('✅ 已從約定轉帳名單移除')
  }

  const adminApprove = async () => {
    if (!selectedAddress) {
      setStatus('⚠️ 請先選擇接收者')
      return
    }
    setLoading(true)
    setStatus('⏳ 使用管理員私鑰發送 allowAccount 中...')

    try {
      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定')

      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x'+adminPk, providerAdmin)
      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, adminSigner)

      // 使用 allowAccount 方法來允許該帳戶進行轉帳
      const tx = await contract.allowAccount(selectedAddress)
      setStatus(`📤 AllowAccount 已送出，交易雜湊: ${tx.hash.substring(0, 10)}...`)
      await tx.wait()
      setStatus('✅ AllowAccount 已確認成功！該帳戶已被授權，可以進行轉帳了')
    } catch (err) {
      console.error('adminApprove error', err)
      setStatus('❌ AllowAccount 失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleLoadWallet = async (e) => {
    e.preventDefault()
    setStatus('')
    if (!password) {
      setStatus('⚠️ 請輸入密碼以載入私鑰')
      return
    }
    setLoading(true)
    try {
      await loadWallet(password)
      setStatus('✅ 錢包已成功載入！')
      setPassword('') // 清空密碼輸入
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    setStatus('')
    
    if (!wallet) {
      setStatus('⚠️ 請先載入您的錢包')
      return
    }
    if (!selectedAddress) {
      setStatus('⚠️ 請選擇接收者')
      return
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setStatus('⚠️ 請輸入有效金額（必須大於 0）')
      return
    }

    setLoading(true)
    setStatus(`⏳ 正在轉帳 ${amount} NTD...`)
    
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定')

      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, wallet)
      const decimals = await contract.decimals()
      const value = ethers.parseUnits(amount.toString(), decimals)

      const tx = await contract.transfer(selectedAddress, value)
      setStatus(`📤 轉帳已送出，交易雜湊: ${tx.hash.substring(0, 10)}...`)
      await tx.wait()
      setStatus(`✅ 轉帳成功！已轉帳 ${amount} NTD 給 ${recipientId}`)
      
      // 清空表單
      setAmount('')
      setRecipientId('')
      setRecipientInfo(null)
    } catch (err) {
      console.error('transfer error', err)
      setStatus('❌ 轉帳失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="transfer-page">
        <p>請先登入以使用轉帳功能</p>
      </div>
    )
  }

  return (
    <div className="transfer-page">
      <h1>💸 NTD 轉帳</h1>
      <p>安全、快速的數位資產轉帳服務</p>

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

      <div className="card">
        <div className="card-header-with-action">
          <h3>選擇或輸入接收者</h3>
          <button 
            className="btn-manage-recipients"
            onClick={() => setShowAddRecipient(!showAddRecipient)}
            type="button"
          >
            + 約定轉帳設定
          </button>
        </div>
        
        {/* 約定轉帳快速選擇 */}
        {savedRecipients.length > 0 && (
          <div className="saved-recipients-section">
            <label>
              約定轉帳對象
              <select 
                value={selectedSavedRecipient} 
                onChange={(e) => handleSelectSavedRecipient(e.target.value)}
                disabled={loading}
              >
                <option value="">-- 選擇約定轉帳對象 --</option>
                {savedRecipients.map((recipient) => (
                  <option key={recipient.recipientId} value={recipient.recipientId}>
                    {recipient.note} ({recipient.recipientId})
                  </option>
                ))}
              </select>
            </label>
            
            {selectedSavedRecipient && (
              <button 
                className="btn-delete-recipient"
                onClick={() => handleDeleteSavedRecipient(selectedSavedRecipient)}
                type="button"
              >
                🗑️ 移除此約定轉帳
              </button>
            )}
          </div>
        )}

        {/* 手動輸入接收者 */}
        <div className="manual-input-section">
          <label>
            或手動輸入接收者 ID
            <input 
              type="text" 
              placeholder="請輸入接收者的帳號 ID (例: 5a3b9c2d)" 
              value={recipientId} 
              onChange={(e) => {
                handleRecipientIdChange(e.target.value)
                setSelectedSavedRecipient('')
              }}
              disabled={loading}
            />
          </label>
        </div>
        
        {recipientId && !selectedAddress && (
          <div className="recipient-status error">
            ❌ 找不到此帳號 ID，請確認後重新輸入
          </div>
        )}
        
        {recipientId && selectedAddress && recipientInfo && (
          <div className="recipient-status success">
            <div className="recipient-info">
              <p>✓ 已找到接收者</p>
              <div className="info-row">
                <span>帳號 ID：</span>
                <strong>{recipientId}</strong>
              </div>
              {recipientInfo.fullName && (
                <div className="info-row">
                  <span>姓名：</span>
                  <strong>{recipientInfo.fullName}</strong>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 新增約定轉帳表單 */}
        {showAddRecipient && (
          <div className="add-recipient-form">
            <h4>新增約定轉帳對象</h4>
            <input 
              type="text"
              placeholder="備註 (例: 家人、朋友、房東)"
              value={newRecipientNote}
              onChange={(e) => setNewRecipientNote(e.target.value)}
            />
            <input 
              type="text"
              placeholder="接收者 ID"
              value={newRecipientId}
              onChange={(e) => setNewRecipientId(e.target.value)}
            />
            <div className="form-buttons">
              <button 
                className="btn-confirm"
                onClick={handleAddSavedRecipient}
                type="button"
              >
                ✓ 確認新增
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowAddRecipient(false)
                  setNewRecipientId('')
                  setNewRecipientNote('')
                }}
                type="button"
              >
                ✕ 取消
              </button>
            </div>
          </div>
        )}
        
        <button 
          className="btn" 
          onClick={adminApprove} 
          disabled={loading || !selectedAddress}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          {loading ? '⏳ 處理中...' : '✅ 管理員授權帳戶 (AllowAccount)'}
        </button>
      </div>

      <div className="card">
        <h3>轉帳金額</h3>
        <form onSubmit={handleTransfer}>
          {recipientId && selectedAddress && (
            <div className="transfer-summary">
              <div className="info-row">
                <span>接收者：</span>
                <strong>{recipientId}</strong>
              </div>
              {recipientInfo?.fullName && (
                <div className="info-row">
                  <span>姓名：</span>
                  <strong>{recipientInfo.fullName}</strong>
                </div>
              )}
            </div>
          )}
          <label>
            轉帳金額 (NTD)
            <input 
              type="number" 
              placeholder="請輸入 NTD 金額" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={loading || !selectedAddress}
            />
          </label>
          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !wallet || !selectedAddress || !amount}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ 處理中...' : '💸 確認轉帳'}
          </button>
        </form>
      </div>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
          {status}
        </div>
      )}

      <div className="note">
        <p>⚠️ 注意：管理員私鑰儲存在環境變數中（僅測試用途），實際生產環境請使用安全後端與 KMS。</p>
      </div>
    </div>
  )
}

export default TransferPage
