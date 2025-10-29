import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import disasterAbi from '../contract/disasterAbi'
import './DisasterReliefUI.css'

export default function DisasterReliefUI() {
  const { address, isConnected } = useAccount()

  const [status, setStatus] = useState('idle')
  const [verificationResult, setVerificationResult] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState(null)
  const [txStatus, setTxStatus] = useState(null) // pending | confirmed | failed | null
  const [txDetails, setTxDetails] = useState(null) // { blockNumber, confirmations }
  const txPollRef = useRef(null)

  // Celo Sepolia 合約地址
  const CONTRACT_ADDRESS = '0x37ACE2979C7d6c395AF0D3f400a878fA858b724a'

  async function verifyWithSelf() {
    setStatus('opening_self')

    try {
      const selfServiceUrl = import.meta.env.VITE_SELF_SERVICE_URL || 'http://localhost:3001'
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
          
          setVerificationResult({
            verified: true,
            timestamp: event.data.data.timestamp,
            nullifier: event.data.data.nullifier || '0x' + '01'.repeat(32),
            userIdentifier: event.data.data.userIdentifier || '0x' + '02'.repeat(20),
            proof: event.data.data.proof || 'SELF_PROOF_FROM_SERVICE'
          })
          
          setStatus('verified')
          window.removeEventListener('message', handleMessage)
          
          // 通知使用者
          alert('✓ 身份驗證成功！現在可以申請撥款了。')
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

  async function requestPayout() {
    if (!isConnected) {
      setStatus('請先連接錢包')
      return
    }
    if (!verificationResult) {
      setStatus('請先完成身份驗證')
      return
    }
    if (!recipient || !ethers.isAddress(recipient)) {
      setStatus('請輸入有效的收款地址')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('請輸入有效的撥款金額')
      return
    }

    setStatus('sending_tx')

    try {
      if (!window.ethereum) throw new Error('找不到錢包')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(CONTRACT_ADDRESS, disasterAbi, signer)

      // 將金額轉換為 Wei (假設 NTD_TOKEN 有 18 位小數)
      const amountInWei = ethers.parseUnits(amount.toString(), 18)

      // 調用 withdrawToken，傳入收款地址和金額 (to, amount) — match ABI
      const tx = await contract.withdrawToken(
        recipient,
        amountInWei,
        { gasLimit: 500000 }
      )

      setStatus('tx_submitted')
      setTxHash(tx.hash)
      setTxStatus('pending')
      console.log('交易已提交:', tx.hash)
      console.log('撥款金額:', amount, 'NTD_TOKEN')
      console.log('收款地址:', recipient)

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
      if (!window.ethereum) return null
      const provider = new ethers.BrowserProvider(window.ethereum)
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

      <div className="wallet">
        <div>Connected account: {isConnected ? address : 'Not connected'}</div>
      </div>

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
            <div>Nullifier: {verificationResult.nullifier}</div>
            <div>User ID: {verificationResult.userIdentifier}</div>
          </div>
        )}
      </div>

      <div className="payout">
        <h3>2. 申請撥款</h3>
        <p>完成身份驗證後，輸入收款地址和金額並申請撥款</p>
        
        <label>
          收款地址
          <input 
            type="text"
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
            placeholder="0x..." 
            disabled={!verificationResult}
          />
        </label>
        
        <label>
          撥款金額 <span className="token-label">(NTD_TOKEN)</span>
          <input 
            type="number"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="請輸入金額" 
            min="0"
            step="0.01"
            disabled={!verificationResult}
          />
        </label>
        
        <button onClick={requestPayout} disabled={!verificationResult || !recipient || !amount || status === 'sending_tx'}>
          {status === 'sending_tx' ? '處理中...' : '申請撥款'}
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
