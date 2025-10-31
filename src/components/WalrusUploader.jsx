import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { proofAbi, PROOF_CONTRACT_ADDRESS } from '../config/proofAbi'
import './WalrusUploader.css'

// 帶 fallback 的圖片組件
function ImageWithFallback({ blobId, getAllPossibleUrls }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [allUrls] = useState(() => getAllPossibleUrls(blobId).map(item => item.url))
  const [showError, setShowError] = useState(false)

  const handleError = () => {
    if (currentUrlIndex < allUrls.length - 1) {
      console.log(`URL ${currentUrlIndex + 1} 失敗，嘗試下一個...`)
      setCurrentUrlIndex(currentUrlIndex + 1)
    } else {
      console.log('所有 URL 都失敗了')
      setShowError(true)
    }
  }

  if (showError) {
    return (
      <div style={{color: '#999', padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px'}}>
        無法從任何端點載入圖片
        <div style={{fontSize: '12px', marginTop: '8px'}}>
          已嘗試 {allUrls.length} 個不同的 URL
        </div>
      </div>
    )
  }

  return (
    <div>
      <img 
        src={allUrls[currentUrlIndex]} 
        alt="Preview"
        style={{maxWidth: '300px', borderRadius: '8px', border: '1px solid #ddd'}}
        onError={handleError}
        onLoad={() => console.log(`✓ 圖片載入成功 (URL ${currentUrlIndex + 1}):`, allUrls[currentUrlIndex])}
      />
      {currentUrlIndex > 0 && (
        <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
          使用備用端點 #{currentUrlIndex + 1}
        </div>
      )}
    </div>
  )
}

export default function WalrusUploader() {
  const { address, isConnected } = useAccount()
  
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [walrusResponse, setWalrusResponse] = useState(null)
  const [proofTxHash, setProofTxHash] = useState(null)
  const [submittingProof, setSubmittingProof] = useState(false)
  const [userFiles, setUserFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [previewBlobId, setPreviewBlobId] = useState(null)

  // Walrus API endpoints
  // 注意：Walrus API 可能會變更，如果 404 請檢查官方文檔https://publisher.walrus-testnet.walrus.space
  const WALRUS_PUBLISHER_ENDPOINT = 'https://publisher.walrus-testnet.walrus.space'
  const WALRUS_AGGREGATOR_ENDPOINT = 'https://aggregator.walrus-testnet.walrus.space'
  // 替代讀取端點（使用 Walrus Sites）
  const WALRUS_SITES_ENDPOINT = 'https://aggregator.testnet.walrus.mirai.cloud'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus(`已選擇: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`)
    }
  }

  const testWalrusConnection = async () => {
    setUploadStatus('正在測試 Walrus 連線...')
    try {
      const response = await fetch(`${WALRUS_PUBLISHER_ENDPOINT}/v1/blobs`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        const info = await response.json()
        console.log('Walrus 服務資訊:', info)
        setUploadStatus('✓ Walrus 服務連線正常')
      } else {
        setUploadStatus(`⚠️ Walrus 回應異常: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('連線測試失敗:', error)
      setUploadStatus(`✗ 無法連線到 Walrus: ${error.message}`)
    }
  }

  const uploadToWalrus = async () => {
    if (!file) {
      setUploadStatus('請先選擇檔案')
      return
    }

    setUploading(true)
    setUploadStatus('正在上傳到 Walrus...')

    // 嘗試多個可能的端點
    const endpoints = [
      `${WALRUS_PUBLISHER_ENDPOINT}/v1/blobs`,
      `${WALRUS_PUBLISHER_ENDPOINT}/v1/store`,
      `${WALRUS_PUBLISHER_ENDPOINT}/store?epochs=5`,
      `${WALRUS_PUBLISHER_ENDPOINT}/store`,
    ]

    let lastError = null

    try {
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i]
        
        try {
          console.log(`嘗試端點 ${i + 1}/${endpoints.length}:`, endpoint)
          setUploadStatus(`正在嘗試端點 ${i + 1}/${endpoints.length}...`)

          const response = await fetch(endpoint, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            }
          })

          console.log('Walrus 回應狀態:', response.status, response.statusText)

          if (response.status === 404) {
            console.log('404 - 端點不存在，嘗試下一個...')
            lastError = new Error(`端點 ${endpoint} 不存在 (404)`)
            continue
          }

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Walrus 錯誤詳情:', errorText)
            lastError = new Error(`上傳失敗 (${response.status}): ${errorText}`)
            continue
          }

          // 成功！
          const result = await response.json()
          console.log('✓ Walrus 回應:', result)
          
          setWalrusResponse(result)
          setUploadStatus(`✓ 上傳成功！Blob ID: ${result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId || 'N/A'}`)
          
          return result
        } catch (innerError) {
          console.error(`端點 ${i + 1} 錯誤:`, innerError)
          lastError = innerError
          continue
        }
      }

      // 所有端點都失敗
      throw lastError || new Error('所有端點都無法連線')
      
    } catch (error) {
      console.error('上傳錯誤完整資訊:', error)
      console.error('錯誤訊息:', error.message)
      
      let friendlyMessage = error.message
      if (error.message.includes('Failed to fetch')) {
        friendlyMessage = '網路連線失敗，Walrus testnet 可能暫時無法使用'
      } else if (error.message.includes('CORS')) {
        friendlyMessage = 'CORS 錯誤，Walrus 服務暫時不可用'
      } else if (error.message.includes('404')) {
        friendlyMessage = '所有 API 端點都返回 404，Walrus testnet 可能已關閉或 API 已更新'
      }
      
      setUploadStatus(`✗ 上傳失敗: ${friendlyMessage}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const submitProofToBlockchain = async () => {
    if (!isConnected) {
      setUploadStatus('請先連接錢包')
      return
    }

    if (!walrusResponse) {
      setUploadStatus('請先上傳檔案到 Walrus')
      return
    }

    setSubmittingProof(true)
    setUploadStatus('正在提交 Proof 到區塊鏈...')

    try {
      if (!window.ethereum) throw new Error('找不到錢包')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // 確認網路是 Celo Sepolia
      const network = await provider.getNetwork()
      console.log('當前網路:', network)

      const contract = new ethers.Contract(PROOF_CONTRACT_ADDRESS, proofAbi, signer)

      // 從 Walrus 回應中提取資訊
      const dataId = walrusResponse.newlyCreated?.blobObject?.blobId || 
                     walrusResponse.alreadyCertified?.blobId || 
                     ''
      
      // 從 Walrus 回應中提取 proof（如果有的話）
      const proof = walrusResponse.newlyCreated?.blobObject?.id || 
                    walrusResponse.alreadyCertified?.eventOrObject?.Event?.blobId ||
                    dataId  // fallback 使用 dataId

      // 檔案類型
      const fileType = file.type || 'unknown'

      console.log('準備上鏈:', { dataId, proof, fileType })

      // 調用合約的 storeFile 函數
      const tx = await contract.storeFile(dataId, proof, fileType, {
        gasLimit: 500000
      })

      setUploadStatus('交易已提交，等待確認...')
      setProofTxHash(tx.hash)
      console.log('交易 hash:', tx.hash)

      await tx.wait()
      
      setUploadStatus(`✓ Proof 已成功上鏈！交易: ${tx.hash}`)
      console.log('交易已確認')
      
      // 上鏈成功後重新載入檔案列表
      await loadUserFiles()
      
    } catch (error) {
      console.error('上鏈錯誤:', error)
      setUploadStatus(`✗ 上鏈失敗: ${error.message}`)
    } finally {
      setSubmittingProof(false)
    }
  }

  const loadUserFiles = async () => {
    if (!isConnected || !address) {
      setUserFiles([])
      return
    }

    setLoadingFiles(true)
    try {
      if (!window.ethereum) throw new Error('找不到錢包')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(PROOF_CONTRACT_ADDRESS, proofAbi, provider)

      // 取得所有檔案
      const files = await contract.getAllFiles(address)
      console.log('用戶檔案:', files)
      
      setUserFiles(files)
    } catch (error) {
      console.error('載入檔案錯誤:', error)
      setUserFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }

  // 當錢包連接狀態改變時載入檔案
  React.useEffect(() => {
    loadUserFiles()
  }, [isConnected, address])

  // 取得 Walrus 檔案的 URL
  const getWalrusFileUrl = (blobId, useAlternative = false) => {
    if (useAlternative) {
      // 使用替代端點 (Walrus Sites)
      return `${WALRUS_SITES_ENDPOINT}/${blobId}`
    }
    // 使用官方 aggregator
    return `${WALRUS_AGGREGATOR_ENDPOINT}/v1/blobs/${blobId}`
  }
  
  // 取得所有可能的 URL（用於測試）
  const getAllPossibleUrls = (blobId) => {
    return [
      {
        name: 'Aggregator (官方)',
        url: `${WALRUS_AGGREGATOR_ENDPOINT}/v1/blobs/${blobId}`
      },
      {
        name: 'Walrus Sites',
        url: `${WALRUS_SITES_ENDPOINT}/${blobId}`
      },
      {
        name: 'Aggregator (簡化)',
        url: `https://aggregator.walrus-testnet.walrus.space/${blobId}`
      }
    ]
  }

  // 判斷是否為圖片類型
  const isImageType = (fileType) => {
    return fileType && fileType.startsWith('image/')
  }

  // 判斷是否為影片類型
  const isVideoType = (fileType) => {
    return fileType && fileType.startsWith('video/')
  }

  // 打開預覽
  const openPreview = (blobId) => {
    setPreviewBlobId(blobId)
  }

  // 關閉預覽
  const closePreview = () => {
    setPreviewBlobId(null)
  }

  return (
    <div className="walrus-uploader">
      <div className="uploader-header">
        <h2>Walrus 檔案上傳</h2>
        <p>上傳檔案到 Walrus 分散式儲存，並將 Proof 記錄到 Celo Sepolia 區塊鏈</p>
      </div>

      <div className="uploader-content">
        {/* 錢包狀態 */}
        <div className="wallet-status">
          <strong>錢包狀態:</strong> {isConnected ? `已連接 (${address?.slice(0, 6)}...${address?.slice(-4)})` : '未連接'}
          <button 
            onClick={testWalrusConnection}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: '#f8f9fa'
            }}
          >
            🔌 測試 Walrus 連線
          </button>
        </div>

        {/* 檔案選擇 */}
        <div className="file-input-section">
          <label className="file-input-label">
            <input 
              type="file" 
              onChange={handleFileChange}
              disabled={uploading || submittingProof}
            />
            <span className="file-input-button">
              {file ? '✓ 更換檔案' : '選擇檔案'}
            </span>
          </label>
          {file && (
            <div className="file-info">
              <div>📄 {file.name}</div>
              <div>📦 {(file.size / 1024).toFixed(2)} KB</div>
              <div>🏷️ {file.type || 'unknown'}</div>
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="action-buttons">
          <button 
            onClick={uploadToWalrus}
            disabled={!file || uploading || submittingProof}
            className="btn-upload"
          >
            {uploading ? '上傳中...' : '📤 上傳到 Walrus'}
          </button>

          <button 
            onClick={submitProofToBlockchain}
            disabled={!walrusResponse || submittingProof || !isConnected}
            className="btn-submit-proof"
          >
            {submittingProof ? '提交中...' : '⛓️ 提交 Proof 到鏈上'}
          </button>
        </div>

        {/* 狀態顯示 */}
        {uploadStatus && (
          <div className={`status-message ${uploadStatus.includes('✓') ? 'success' : uploadStatus.includes('✗') ? 'error' : 'info'}`}>
            {uploadStatus}
          </div>
        )}

        {/* Walrus 回應詳情 */}
        {walrusResponse && (
          <div className="response-details">
            <h3>📋 Walrus 回應</h3>
            <div className="response-content">
              <div className="response-item">
                <strong>Blob ID:</strong>
                <code>{walrusResponse.newlyCreated?.blobObject?.blobId || walrusResponse.alreadyCertified?.blobId}</code>
              </div>
              {walrusResponse.newlyCreated?.blobObject?.storage?.url && (
                <div className="response-item">
                  <strong>Storage URL:</strong>
                  <a href={walrusResponse.newlyCreated.blobObject.storage.url} target="_blank" rel="noopener noreferrer">
                    {walrusResponse.newlyCreated.blobObject.storage.url}
                  </a>
                </div>
              )}
              {isImageType(file?.type) && walrusResponse && (
                <div className="response-item">
                  <strong>預覽:</strong>
                  <div style={{marginTop: '8px'}}>
                    <ImageWithFallback 
                      blobId={walrusResponse.newlyCreated?.blobObject?.blobId || walrusResponse.alreadyCertified?.blobId}
                      getAllPossibleUrls={getAllPossibleUrls}
                    />
                  </div>
                </div>
              )}
              <details>
                <summary>完整回應 (JSON)</summary>
                <pre>{JSON.stringify(walrusResponse, null, 2)}</pre>
              </details>
            </div>
          </div>
        )}

        {/* 交易詳情 */}
        {proofTxHash && (
          <div className="tx-details">
            <h3>⛓️ 區塊鏈交易</h3>
            <div className="tx-content">
              <div className="tx-item">
                <strong>交易 Hash:</strong>
                <a 
                  href={`https://celo-alfajores.blockscout.com/tx/${proofTxHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {proofTxHash.slice(0, 10)}...{proofTxHash.slice(-8)}
                </a>
              </div>
              <div className="tx-item">
                <strong>合約地址:</strong>
                <code>{PROOF_CONTRACT_ADDRESS}</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 說明文字 */}
      <div className="uploader-footer">
        <h4>ℹ️ 使用說明</h4>
        <ol>
          <li>先連接你的錢包（確保在 Celo Sepolia 網路）</li>
          <li>選擇要上傳的檔案</li>
          <li>點擊「上傳到 Walrus」將檔案儲存到分散式儲存</li>
          <li>點擊「提交 Proof 到鏈上」將檔案證明記錄到區塊鏈</li>
        </ol>
      </div>
      {/* 用戶已上傳的檔案列表 */}
      {isConnected && (
        <div className="user-files-section">
          <div className="section-header">
            <h3>📁 我的檔案 ({userFiles.length})</h3>
            <button 
              onClick={loadUserFiles}
              disabled={loadingFiles}
              className="btn-refresh"
            >
              {loadingFiles ? '載入中...' : '🔄 重新整理'}
            </button>
          </div>

          {userFiles.length === 0 ? (
            <div className="empty-state">
              <p>尚未上傳任何檔案</p>
            </div>
          ) : (
            <div className="files-grid">
              {userFiles.map((fileInfo, index) => (
                <div key={index} className="file-card">
                  <div className="file-card-header">
                    <span className="file-index">#{index + 1}</span>
                    <span className="file-type-badge">{fileInfo.fileType}</span>
                  </div>
                  
                  {/* 圖片預覽 */}
                  {isImageType(fileInfo.fileType) && (
                    <div className="file-preview">
                      <ImageWithFallback 
                        blobId={fileInfo.dataId}
                        getAllPossibleUrls={getAllPossibleUrls}
                      />
                    </div>
                  )}

                  {/* 影片預覽 */}
                  {isVideoType(fileInfo.fileType) && (
                    <div className="file-preview">
                      <video 
                        src={getWalrusFileUrl(fileInfo.dataId)} 
                        controls
                        style={{width: '100%', maxHeight: '200px'}}
                      />
                    </div>
                  )}

                  <div className="file-card-body">
                    <div className="file-info-row">
                      <strong>Data ID:</strong>
                      <code className="file-id">{fileInfo.dataId.slice(0, 20)}...</code>
                    </div>
                    <div className="file-info-row">
                      <strong>Proof:</strong>
                      <code className="file-id">{fileInfo.proof.slice(0, 20)}...</code>
                    </div>
                    <div className="file-info-row">
                      <strong>上傳時間:</strong>
                      <span>{new Date(Number(fileInfo.timestamp) * 1000).toLocaleString('zh-TW')}</span>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div className="file-actions">
                      <a 
                        href={getWalrusFileUrl(fileInfo.dataId)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-view"
                        onClick={() => console.log('開啟 URL:', getWalrusFileUrl(fileInfo.dataId))}
                      >
                        🔗 查看檔案
                      </a>
                      {(isImageType(fileInfo.fileType) || isVideoType(fileInfo.fileType)) && (
                        <button 
                          onClick={() => openPreview(fileInfo.dataId)}
                          className="btn-preview"
                        >
                          👁️ 預覽
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          console.log('Blob ID:', fileInfo.dataId)
                          console.log('完整 URL:', getWalrusFileUrl(fileInfo.dataId))
                          navigator.clipboard.writeText(getWalrusFileUrl(fileInfo.dataId))
                          alert('URL 已複製到剪貼簿')
                        }}
                        className="btn-copy"
                        title="複製 URL"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 預覽模態框 */}
      {previewBlobId && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-modal-close" onClick={closePreview}>
              ✕
            </button>
            <div className="preview-modal-body">
              <img 
                src={getWalrusFileUrl(previewBlobId)} 
                alt="Preview"
                style={{maxWidth: '100%', maxHeight: '80vh'}}
              />
            </div>
            <div className="preview-modal-footer">
              <a 
                href={getWalrusFileUrl(previewBlobId)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-open-new-tab"
              >
                在新分頁開啟
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
