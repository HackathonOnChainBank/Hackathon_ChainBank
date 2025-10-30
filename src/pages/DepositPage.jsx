import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../hooks/useWallet'
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI'
import { ABI as DEPOSIT_PRODUCT_ABI } from '../config/DepositProduct_ABI'
import './DepositPage.css'

function DepositPage() {
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useAuth()
  const { wallet, loadWallet, provider } = useWallet()

  const [password, setPassword] = useState('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState('30') // 預設 30 天
  const [interestRate, setInterestRate] = useState('3') // 預設 3%
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)
  const [checkingAllowance, setCheckingAllowance] = useState(false)
  const [userDeposits, setUserDeposits] = useState([])

  // 利率對照表：天數 -> 利率(%)
  const interestRateMap = {
    '30': '3',
    '90': '4',
    '180': '5.5',
    '365': '6'
  }

  // 當期限改變時，自動設定對應的利率
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    const rate = interestRateMap[newPeriod] || '3' // 預設 3%
    setInterestRate(rate)
  }

  // 檢查是否已經有錢包載入
  useEffect(() => {
    if (!wallet) {
      setShowPasswordInput(true)
    } else {
      setShowPasswordInput(false)
      setStatus('✓ 錢包已自動載入')
      checkAllowanceStatus()
      loadUserDeposits()
    }
  }, [wallet])

  // 檢查用戶是否已被 allowAccount 授權
  const checkAllowanceStatus = async () => {
    if (!wallet) return
    
    setCheckingAllowance(true)
    try {
      const contractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!contractAddress) throw new Error('NTD_TOKEN 合約地址未設定')

      const contract = new ethers.Contract(contractAddress, NTD_TOKEN_ABI, wallet)
      const allowed = await contract.isUserAllowed(wallet.address)
      
      setIsAllowed(allowed)
      if (allowed) {
        setStatus('✅ 您的帳戶已授權，可以使用定存服務')
      } else {
        setStatus('⚠️ 您的帳戶尚未授權，請聯繫管理員進行 allowAccount 授權')
      }
    } catch (err) {
      console.error('檢查授權狀態錯誤:', err)
      setStatus('❌ 無法檢查授權狀態: ' + (err.message || err))
    } finally {
      setCheckingAllowance(false)
    }
  }

  // 載入用戶的定存記錄
  const loadUserDeposits = async () => {
    if (!wallet) return

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS
      if (!depositContractAddress) {
        console.log('DepositProduct 合約地址未設定')
        return
      }

      console.log('正在載入定存記錄...')
      console.log('合約地址:', depositContractAddress)
      console.log('用戶地址:', wallet.address)

      // 使用管理員私鑰建立合約實例來查詢
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x'+adminPk, providerAdmin)

      const contract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, adminSigner)
      const deposits = await contract.getUserDeposits(wallet.address)
      
      console.log('原始定存資料:', deposits)
      console.log('定存數量:', deposits.length)

      const formattedDeposits = deposits.map((d, index) => ({
        id: index,
        amount: ethers.formatUnits(d.amount, 18),
        startTime: new Date(Number(d.startTime) * 1000).toLocaleString('zh-TW'),
        period: Number(d.period),
        interestRate: Number(d.interestRate),
        withdrawn: d.withdrawn
      }))
      
      console.log('格式化後的定存:', formattedDeposits)
      setUserDeposits(formattedDeposits)
    } catch (err) {
      console.error('載入定存記錄錯誤:', err)
      setStatus('❌ 載入定存記錄失敗: ' + (err.message || err))
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
      setPassword('')
    } catch (err) {
      setStatus('❌ 載入錢包失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeposit = async (e) => {
    e.preventDefault()
    setStatus('')

    if (!wallet) {
      setStatus('⚠️ 請先載入您的錢包')
      return
    }

    if (!isAllowed) {
      setStatus('⚠️ 您的帳戶尚未授權，無法建立定存')
      return
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setStatus('⚠️ 請輸入有效的定存金額（必須大於 0）')
      return
    }

    if (!period || isNaN(period) || Number(period) <= 0) {
      setStatus('⚠️ 請輸入有效的定存期限（天數，必須大於 0）')
      return
    }

    if (!interestRate || isNaN(interestRate) || Number(interestRate) < 0) {
      setStatus('⚠️ 請輸入有效的利率（%，必須大於等於 0）')
      return
    }

    setLoading(true)
    setStatus(`⏳ 正在建立定存...`)

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS
      if (!depositContractAddress) throw new Error('DepositProduct 合約地址未設定')

      const ntdContractAddress = import.meta.env.VITE_NTD_TOKEN_CONTRACT_ADDRESS
      if (!ntdContractAddress) throw new Error('NTD_TOKEN 合約地址未設定')

      // 先檢查並 approve DepositProduct 合約
      const ntdContract = new ethers.Contract(ntdContractAddress, NTD_TOKEN_ABI, wallet)
      const decimals = await ntdContract.decimals()
      const depositAmount = ethers.parseUnits(amount.toString(), decimals)
      
      setStatus(`⏳ 正在授權 DepositProduct 合約使用您的 NTD...`)
      const approveTx = await ntdContract.approve(depositContractAddress, depositAmount)
      await approveTx.wait()

      // 建立定存 - 使用管理員私鑰調用合約
      setStatus(`⏳ 正在建立定存記錄...`)
      
      const adminPk = import.meta.env.VITE_PRIVATE_KEY_1
      if (!adminPk) throw new Error('管理員私鑰未設定')

      const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
      const providerAdmin = new ethers.JsonRpcProvider(rpcUrl)
      const adminSigner = new ethers.Wallet(adminPk.startsWith('0x') ? adminPk : '0x'+adminPk, providerAdmin)
      
      // 使用管理員私鑰創建合約實例
      const depositContract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, adminSigner)
      
      // createDeposit(address user, uint256 amount, uint256 period, uint256 interestRate)
      // user 參數使用當前登入用戶的地址
      // 金額已經用 parseUnits 轉換成 wei (乘以 10^18)
      // period 直接從天換成秒數
      const periodInSeconds = Number(period * 86400)
      // interestRate 以基點表示（例如 500 = 5%）
      const rateInBasisPoints = Math.floor(Number(interestRate) * 100)

      const tx = await depositContract.createDeposit(
        wallet.address,  // 使用當前用戶的地址
        depositAmount,
        periodInSeconds,
        rateInBasisPoints
      )
      
      setStatus(`📤 定存建立中，交易雜湊: ${tx.hash.substring(0, 10)}...`)
      await tx.wait()
      setStatus(`✅ 定存建立成功！金額: ${amount} NTD，期限: ${period} 天，利率: ${interestRate}%`)

      // 清空表單並重新載入定存記錄
      setAmount('')
      setPeriod('')
      setInterestRate('')
      await loadUserDeposits()
    } catch (err) {
      console.error('建立定存錯誤:', err)
      setStatus('❌ 建立定存失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (depositId) => {
    if (!wallet) return

    setLoading(true)
    setStatus(`⏳ 正在提領定存 #${depositId}...`)

    try {
      const depositContractAddress = import.meta.env.VITE_DEPOSIT_CONTRACT_ADDRESS
      if (!depositContractAddress) throw new Error('DepositProduct 合約地址未設定')

      const contract = new ethers.Contract(depositContractAddress, DEPOSIT_PRODUCT_ABI, wallet)
      const tx = await contract.withdrawDeposit(wallet.address, depositId)
      
      setStatus(`📤 提領中，交易雜湊: ${tx.hash.substring(0, 10)}...`)
      await tx.wait()
      setStatus(`✅ 定存 #${depositId} 提領成功！`)

      // 重新載入定存記錄
      await loadUserDeposits()
    } catch (err) {
      console.error('提領定存錯誤:', err)
      setStatus('❌ 提領失敗: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="deposit-page">
        <p>請先登入以使用定存服務</p>
      </div>
    )
  }

  return (
    <div className="deposit-page">
      <h1>💰 NTD 定存服務</h1>
      <p>穩健理財，讓您的資產增值</p>

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
          <div className="card status-card">
            <h3>授權狀態</h3>
            {checkingAllowance ? (
              <p>⏳ 檢查授權狀態中...</p>
            ) : (
              <>
                {isAllowed ? (
                  <div className="status-badge allowed">
                    ✅ 已授權 - 可以使用定存服務
                  </div>
                ) : (
                  <div className="status-badge not-allowed">
                    ⚠️ 未授權 - 請聯繫管理員進行 allowAccount 授權
                  </div>
                )}
                <button 
                  className="btn btn-secondary" 
                  onClick={checkAllowanceStatus}
                  disabled={loading}
                  style={{ marginTop: '1rem' }}
                >
                  🔄 重新檢查授權狀態
                </button>
              </>
            )}
          </div>

          <div className="card">
            <h3>建立新定存</h3>
            <form onSubmit={handleCreateDeposit}>
              <label>
                定存金額 (NTD)
                <input 
                  type="number" 
                  placeholder="請輸入定存金額" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  disabled={loading || !isAllowed}
                />
              </label>

              <label>
                定存期限與利率
                <select
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  disabled={loading || !isAllowed}
                >
                  <option value="30">30 天 (1個月)</option>
                  <option value="90">90 天 (3個月)</option>
                  <option value="180">180 天 (6個月)</option>
                  <option value="365">365 天 (1年)</option>
                </select>
              </label>

              <div className="rate-info">
                <span>目前利率：</span>
                <strong>{interestRate}% 年利率</strong>
              </div>
              {amount && period && interestRate && (
                <div className="deposit-preview">
                  <h4>預估收益</h4>
                  <div className="preview-item">
                    <span>本金：</span>
                    <strong>{amount} NTD</strong>
                  </div>
                  <div className="preview-item">
                    <span>期限：</span>
                    <strong>{period} 天</strong>
                  </div>
                  <div className="preview-item">
                    <span>年利率：</span>
                    <strong>{interestRate}%</strong>
                  </div>
                  <div className="preview-item highlight">
                    <span>預估利息：</span>
                    <strong>
                      {(Number(amount) * Number(interestRate) / 100 * Number(period) / 365).toFixed(2)} NTD
                    </strong>
                  </div>
                  <div className="preview-item highlight">
                    <span>到期總額：</span>
                    <strong>
                      {(Number(amount) + Number(amount) * Number(interestRate) / 100 * Number(period) / 365).toFixed(2)} NTD
                    </strong>
                  </div>
                </div>
              )}

              <button 
                className="btn" 
                type="submit" 
                disabled={loading || !wallet || !isAllowed || !amount || !period || !interestRate}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? '⏳ 處理中...' : '💰 建立定存'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>我的定存記錄</h3>
            {userDeposits.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                目前沒有定存記錄
              </p>
            ) : (
              <div className="deposits-list">
                {userDeposits.map((deposit) => (
                  <div key={deposit.id} className={`deposit-item ${deposit.withdrawn ? 'withdrawn' : 'active'}`}>
                    <div className="deposit-header">
                      <span className="deposit-id">定存 #{deposit.id}</span>
                      <span className={`deposit-status ${deposit.withdrawn ? 'status-withdrawn' : 'status-active'}`}>
                        {deposit.withdrawn ? '已提領' : '進行中'}
                      </span>
                    </div>
                    <div className="deposit-details">
                      <div className="detail-row">
                        <span>金額：</span>
                        <strong>{deposit.amount} NTD</strong>
                      </div>
                      <div className="detail-row">
                        <span>開始時間：</span>
                        <span>{deposit.startTime}</span>
                      </div>
                      <div className="detail-row">
                        <span>期限：</span>
                        <span>{deposit.period} 天</span>
                      </div>
                      <div className="detail-row">
                        <span>年利率：</span>
                        <span>{(deposit.interestRate / 100).toFixed(2)}%</span>
                      </div>
                    </div>
                    {!deposit.withdrawn && (
                      <button 
                        className="btn btn-withdraw"
                        onClick={() => handleWithdraw(deposit.id)}
                        disabled={loading}
                      >
                        💸 提領定存
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}`}>
          {status}
        </div>
      )}

      <div className="note">
        <p>💡 定存小提示：</p>
        <ul>
          <li>定存期間資金將被鎖定，無法提前解約</li>
          <li>到期後可隨時提領本金加利息</li>
          <li>利息將根據實際天數計算</li>
          <li>建議選擇適合自己的定存期限</li>
        </ul>
      </div>
    </div>
  )
}

export default DepositPage
