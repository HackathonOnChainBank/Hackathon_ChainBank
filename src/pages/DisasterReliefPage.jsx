import React from 'react'
import DisasterReliefUI from '../components/DisasterReliefUI'
import './DisasterReliefPage.css'

export default function DisasterReliefPage() {
  return (
    <div className="disaster-relief-page">
      <div className="dr-header">
        <h1>災難救助金發放</h1>
        <p className="dr-subtitle">使用 Self Protocol 驗證身份後領取救助金</p>
      </div>

      <div className="dr-content">
        <div className="dr-info-card">
          <h2>📋 申請條件</h2>
          <ul>
            <li>✅ 必須年滿 18 歲</li>
            <li>✅ 非印度居民</li>
            <li>✅ 通過 Self Protocol 身份驗證</li>
            <li>✅ 每個身份只能領取一次</li>
          </ul>
          <div className="contract-info">
            <p><strong>合約地址:</strong></p>
            <code>0x215619cE23bc0bCC1d154900903BAbEc07D8B924</code>
            <p><strong>網路:</strong> Celo Sepolia Testnet</p>
          </div>
        </div>

        <div className="dr-main-card">
          <DisasterReliefUI />
        </div>

        <div className="dr-notice">
          <h3>⚠️ 注意事項</h3>
          <ul>
            <li>請確保已連接錢包並切換到 Celo Sepolia 網路</li>
            <li>驗證過程需要使用 Self Protocol App</li>
            <li>救助金將直接發送到您連接的錢包地址</li>
            <li>請妥善保管您的錢包私鑰</li>
            <li>交易需要支付少量 gas fee（CELO）</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
