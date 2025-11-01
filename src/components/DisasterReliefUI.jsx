import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import disasterAbi from '../contract/disasterAbi'
import { useAuth } from '../contexts/AuthContext'
import './DisasterReliefUI.css'

export default function DisasterReliefUI() {
  const { address, isConnected } = useAccount()
  const { getAllUsers } = useAuth()

  const [status, setStatus] = useState('idle')
  const [verificationResult, setVerificationResult] = useState(null)
  const [recipientUserId, setRecipientUserId] = useState('') // 改為存儲用戶 ID
  const [recipientAddress, setRecipientAddress] = useState('') // 實際的錢包地址
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState(null)
  const [txStatus, setTxStatus] = useState(null) // pending | confirmed | failed | null
  const [txDetails, setTxDetails] = useState(null) // { blockNumber, confirmations }
  const [availablePrograms, setAvailablePrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const txPollRef = useRef(null)

  // Celo Sepolia 合約地址
  const CONTRACT_ADDRESS = '0xba163d8cfc4918c928970443cb78930b3c6ab1d6' // DisasterRelief 合約

  async function verifyWithSelf() {
    setStatus('opening_self')

    try {
      const selfServiceUrl = import.meta.env.VITE_SELF_SERVICE_URL || 'http://localhost:3000'
      const popup = window.open(
        selfServiceUrl,
        'SelfVerification',
        'width=600,height=800,left=200,top=100'
      )

      if (!popup) {
        setStatus('Popup 被阻擋，請允許彈出視窗')
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      const handleMessage = (event) => {
        console.log('Received message:', event.data)
        
        if (event.data && event.data.type === 'SELF_VERIFICATION_SUCCESS') {
          console.log('✓ Verification successful! Data:', event.data.data)
          
          const walletAddress = event.data.data.userIdentifier || address
          console.log('💼 驗證成功')
          
          // 從 localStorage 查找對應的用戶 ID
          let users = []
          let matchedUser = null
          try {
            users = getAllUsers()
            console.log('👥 All Users:', users)
            matchedUser = users.find(user => user.walletAddress?.toLowerCase() === walletAddress.toLowerCase())
            console.log('🎯 Matched User:', matchedUser)
          } catch (error) {
            console.error('Error getting users:', error)
          }
          
          const userId = matchedUser ? matchedUser.userId : walletAddress
          const displayName = matchedUser ? `${matchedUser.fullName} (${matchedUser.userId})` : userId
          
          console.log('📝 User ID:', userId, 'Display Name:', displayName)
          
          setVerificationResult({
            verified: true,
            timestamp: event.data.data.timestamp,
            nullifier: event.data.data.nullifier || '0x' + '01'.repeat(32),
            userIdentifier: walletAddress,
            userId: userId,
            displayName: displayName,
            proof: event.data.data.proof || 'SELF_PROOF_FROM_SERVICE'
          })
          
          // 自動帶入用戶 ID 和對應的錢包地址
          setRecipientUserId(userId)
          setRecipientAddress(walletAddress)
          
          setStatus('verified')
          window.removeEventListener('message', handleMessage)
          
          console.log('🚀 即將載入救助計劃...')
          // 載入可用的救助計劃
          setTimeout(() => {
            console.log('⏰ 開始執行 loadAvailablePrograms')
            loadAvailablePrograms(walletAddress)
          }, 500)
          
          // 通知使用者
          alert(`✓ 身份驗證成功！已自動帶入您的用戶 ID: ${userId}`)
        }
      }

      window.addEventListener('message', handleMessage)
      console.log('Message listener added, waiting for verification...')

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup)
          window.removeEventListener('message', handleMessage)
          console.log('Popup closed')
          
          // 只有在還沒驗證成功時才顯示取消訊息
          if (status === 'opening_self' && !verificationResult) {
            setStatus('verification_cancelled')
          }
        }
      }, 500)

    } catch (err) {
      console.error('Verification error:', err)
      setStatus('verify_failed: ' + err.message)
    }
  }

  // 載入可用的救助計劃
  async function loadAvailablePrograms(userAddress) {
    console.log('🔄 開始載入救助計劃, userAddress:', userAddress)
    try {
      if (!window.ethereum) {
        console.error('❌ 找不到 window.ethereum')
        return
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // 獲取當前登入用戶的錢包地址
      let currentUser = null
      try {
        const userData = localStorage.getItem('chainbank_current_user')
        if (userData) {
          currentUser = JSON.parse(userData)
        }
      } catch (err) {
        console.warn('無法讀取當前用戶資料:', err)
      }
      
      const checkAddress = currentUser?.walletAddress || userAddress
      
      console.log('👤 當前登入用戶 ID:', currentUser?.userId)
      console.log('💼 驗證檢查中...')
      
      // 使用 DisasterRelief ABI
      const { DISASTER_RELIEF_ABI } = await import('../config/DisasterRelief_ABI')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DISASTER_RELIEF_ABI, signer)
      
      const programCount = await contract.programCounter()
      console.log('📊 計劃總數:', programCount.toString())
      
      const programs = []
      const count = Number(programCount)
      
      for (let i = 0; i < count; i++) {
        console.log(`檢查計劃 ${i}...`)
        const info = await contract.getProgramInfo(i)
        // 使用當前登入用戶的錢包地址來檢查是否已領取
        const hasClaimed = await contract.hasClaimed(i, checkAddress)
        
        console.log(`計劃 ${i} 資訊:`, {
          name: info[0],
          totalBudget: ethers.formatUnits(info[1], 18),
          amountPerPerson: ethers.formatUnits(info[2], 18),
          isActive: info[6],
          hasClaimed: hasClaimed
        })
        
        // 只顯示啟用中且未領取的計劃
        if (info[6] && !hasClaimed) { // info[6] = isActive
          programs.push({
            id: i,
            name: info[0],
            amountPerPerson: ethers.formatUnits(info[2], 18),
            remainingBudget: ethers.formatUnits(info[5], 18),
            isActive: info[6]
          })
          console.log(`✅ 計劃 ${i} 已加入可領取列表`)
        } else {
          console.log(`⏭️ 計劃 ${i} 跳過 (已領取或未啟用)`)
        }
      }
      
      console.log('📋 可用計劃列表:', programs)
      setAvailablePrograms(programs)
      
      // 如果只有一個計劃，自動選擇並設定金額
      if (programs.length === 1) {
        setSelectedProgram(programs[0])
        setAmount(programs[0].amountPerPerson)
        console.log('🎯 自動選擇唯一計劃:', programs[0])
      } else if (programs.length === 0) {
        console.warn('⚠️ 沒有可用的救助計劃')
      }
    } catch (error) {
      console.error('❌ 載入救助計劃失敗:', error)
      setStatus('載入計劃失敗: ' + error.message)
    }
  }

  async function requestPayout() {
    if (!verificationResult) {
      setStatus('請先完成身份驗證')
      return
    }
    if (!selectedProgram) {
      setStatus('請選擇救助計劃')
      return
    }

    setStatus('sending_tx')

    try {
      // 獲取當前登入用戶的 shortUuid
      const currentUserShortUuid = localStorage.getItem('chainbank_current_user')
      console.log('📦 當前用戶 ID:', currentUserShortUuid)
      
      if (!currentUserShortUuid) {
        throw new Error('找不到登入用戶資料，請先登入')
      }

      // 從 chainbank_users 中查找完整的用戶資料
      const usersData = localStorage.getItem('chainbank_wallets')
      if (!usersData) {
        throw new Error('找不到用戶列表')
      }
      
      const usersObj = JSON.parse(usersData)
      console.log('📋 用戶資料類型:', typeof usersObj, Array.isArray(usersObj) ? '陣列' : '對象')
      
      // 直接用 shortUuid 作為 key 查找用戶
      const currentUser = usersObj[currentUserShortUuid]
      
      if (!currentUser) {
        console.error('找不到 shortUuid:', currentUserShortUuid)
        console.error('可用的 keys:', Object.keys(usersObj))
        throw new Error('找不到當前用戶資料')
      }
      
      console.log('👤 當前用戶:', currentUser.userId, currentUser.fullName)
      console.log('💼 用戶地址:', currentUser.address)
      
      if (!currentUser.address && !currentUser.walletAddress) {
        console.error('用戶資料:', currentUser)
        throw new Error('用戶資料不完整，缺少錢包地址')
      }

      if (!currentUser.privateKey) {
        console.error('用戶資料:', currentUser)
        throw new Error('用戶資料中沒有 Private Key')
      }

      console.log('🔑 準備使用 Private Key 簽署交易')
      
      // 使用用戶的 private key 創建 wallet
      const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org')
      const wallet = new ethers.Wallet(currentUser.privateKey, provider)

      // 使用 DisasterRelief ABI
      const { DISASTER_RELIEF_ABI } = await import('../config/DisasterRelief_ABI')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DISASTER_RELIEF_ABI, wallet)

      // 調用 claimRelief，只需要傳入計劃 ID
      const tx = await contract.claimRelief(
        selectedProgram.id,
        { gasLimit: 500000 }
      )

      setStatus('tx_submitted')
      setTxHash(tx.hash)
      setTxStatus('pending')
      console.log('交易已提交:', tx.hash)
      console.log('撥款金額:', amount, 'NTD_TOKEN')
      console.log('用戶 ID:', currentUser.userId)

      // 啟動輪詢監控交易狀態（背景）
      monitorTransaction(tx.hash)

      // 同步等待交易確認（保留以在需要時立即反應）
      await tx.wait()
      // 確保我們做過一次狀態更新
      await fetchTxStatus(tx.hash)
      setStatus('tx_confirmed')
      console.log('交易已確認')
    } catch (err) {
      console.error('撥款錯誤:', err)
      setStatus('tx_failed: ' + (err.message || '未知錯誤'))
    }
  }

  // Fetch latest tx status once and update state
  async function fetchTxStatus(hash) {
    if (!hash) return null
    try {
      const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org')
      const receipt = await provider.getTransactionReceipt(hash)

      if (!receipt) {
        // still pending
        setTxStatus('pending')
        setTxDetails(null)
        return { status: 'pending' }
      }

      const blockNumber = receipt.blockNumber
      const latest = await provider.getBlockNumber()
      const confirmations = blockNumber ? Math.max(0, latest - blockNumber + 1) : 0
      const statusStr = receipt.status === 1 ? 'confirmed' : 'failed'
      setTxStatus(statusStr)
      setTxDetails({ blockNumber, confirmations })
      return { status: statusStr, blockNumber, confirmations }
    } catch (e) {
      console.error('fetchTxStatus error', e)
      return null
    }
  }

  // Start polling the tx status every 3s until confirmed/failed
  function monitorTransaction(hash) {
    if (!hash) return
    // clear existing
    if (txPollRef.current) {
      clearInterval(txPollRef.current)
      txPollRef.current = null
    }

    // do an immediate check
    fetchTxStatus(hash)

    txPollRef.current = setInterval(async () => {
      const res = await fetchTxStatus(hash)
      if (res && (res.status === 'confirmed' || res.status === 'failed')) {
        if (txPollRef.current) {
          clearInterval(txPollRef.current)
          txPollRef.current = null
        }
      }
    }, 3000)
  }

  // cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (txPollRef.current) {
        clearInterval(txPollRef.current)
        txPollRef.current = null
      }
    }
  }, [])

  return (
    <div className="disaster-ui">
      <div className="status">Status: {status}</div>

      {/* 隱藏錢包顯示，但保留底層連接邏輯 */}
      {/* <div className="wallet">
        <div>Connected account: {isConnected ? address : 'Not connected'}</div>
      </div> */}

      <div className="verification">
        <h3>1. 身份驗證</h3>
        <p>
          點擊下方按鈕開啟 Self 身份驗證視窗。完成驗證後即可申請撥款。
        </p>
        <button onClick={verifyWithSelf} disabled={!isConnected || status === 'opening_self'}>
          開始驗證
        </button>
        {verificationResult && (
          <div className="verified-box">
            <strong>✓ 驗證成功</strong>
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
              救助金將發送到您綁定的錢包地址
            </div>
          </div>
        )}
      </div>

      <div className="payout">
        <h3>2. 選擇救助計劃</h3>
        <p>完成身份驗證後，選擇可申請的救助計劃</p>
        
        {/* 調試信息 */}
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', fontSize: '0.85em' }}>
          調試: availablePrograms.length = {availablePrograms.length}, 
          verificationResult = {verificationResult ? '✓' : '✗'},
          selectedProgram = {selectedProgram ? '✓' : '✗'}
        </div>
        
        {availablePrograms.length > 0 ? (
          <div className="programs-list">
            {availablePrograms.map((program) => (
              <div 
                key={program.id} 
                className={`program-card ${selectedProgram?.id === program.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProgram(program)
                  setAmount(program.amountPerPerson)
                }}
                style={{ 
                  cursor: 'pointer',
                  padding: '15px',
                  border: selectedProgram?.id === program.id ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  backgroundColor: selectedProgram?.id === program.id ? '#f0f8f0' : '#fff'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0' }}>{program.name}</h4>
                <div style={{ fontSize: '0.95em', color: '#555' }}>
                  <div>💰 可領取金額: <strong>{parseFloat(program.amountPerPerson).toFixed(2)} NTD</strong></div>
                  <div>📊 剩餘預算: {parseFloat(program.remainingBudget).toFixed(2)} NTD</div>
                </div>
              </div>
            ))}
          </div>
        ) : verificationResult ? (
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '15px' }}>
            ⚠️ 目前沒有可申請的救助計劃，或您已領取過所有計劃
          </div>
        ) : null}
        
        {selectedProgram && (
          <div style={{ marginTop: '20px' }}>
            <label>
              領取金額 <span className="token-label">(NTD)</span>
              <input 
                type="text"
                value={amount} 
                disabled={true}
                style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
              />
            </label>
          </div>
        )}
        
        <button 
          onClick={requestPayout} 
          disabled={!verificationResult || !selectedProgram || status === 'sending_tx'}
          style={{ marginTop: '15px' }}
        >
          {status === 'sending_tx' ? '處理中...' : '領取救助金'}
        </button>
        
        {txHash && (
          <div className="tx-info">
            <div>撥款金額: {amount} NTD_TOKEN</div>
            <div>
              交易: <a href={`https://celo-alfajores.blockscout.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
            <div>狀態: {txStatus ? txStatus : 'unknown'}</div>
            {txDetails && (
              <div>區塊: {txDetails.blockNumber} · 確認數: {txDetails.confirmations}</div>
            )}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => fetchTxStatus(txHash)} style={{ padding: '6px 10px', borderRadius: 6 }}>
                查詢最新狀態
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
