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

  const [users, setUsers] = useState([])
  const [selectedShortUuid, setSelectedShortUuid] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  useEffect(() => {
    // load users from AuthContext (localStorage)
    const all = getAllUsers()
    const list = Object.keys(all || {}).map(k => ({ shortUuid: k, ...all[k] }))
    setUsers(list)
  }, [getAllUsers])

  // 檢查是否已經有錢包載入（從 HomePage 或其他頁面）
  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true)
    } else {
      setShowPasswordInput(false)
      setStatus('✓ 錢包已自動載入')
    }
  }, [wallet])

  useEffect(() => {
    if (selectedShortUuid) {
      const addr = getWalletAddress(selectedShortUuid)
      setSelectedAddress(addr)
    } else {
      setSelectedAddress('')
    }
  }, [selectedShortUuid])

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
      setStatus(`✅ 轉帳成功！已轉帳 ${amount} NTD 給 ${selectedShortUuid}`)
      
      // 清空表單
      setAmount('')
      setSelectedShortUuid('')
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
        <h3>選擇接收者</h3>
        <select 
          value={selectedShortUuid} 
          onChange={(e) => setSelectedShortUuid(e.target.value)}
          disabled={loading}
        >
          <option value="">-- 請選擇接收者 --</option>
          {users.map(u => (
            <option key={u.shortUuid} value={u.shortUuid}>
              {u.shortUuid} {u.fullName ? `— ${u.fullName}` : ''}
            </option>
          ))}
        </select>
        {selectedShortUuid && (
          <div className="small">✓ 已選擇帳號：{selectedShortUuid}</div>
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
          {selectedShortUuid && (
            <label>
              接收者：<strong>{selectedShortUuid}</strong>
            </label>
          )}
          <input 
            type="number" 
            placeholder="請輸入 NTD 金額" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            disabled={loading}
            style={{ marginBottom: '1rem' }}
          />
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
