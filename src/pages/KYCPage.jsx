import { useState } from 'react'
import './KYCPage.css'

function KYCPage() {
  const [kycStatus, setKycStatus] = useState('pending') // pending, verified, rejected
  const [kycForm, setKycForm] = useState({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('KYC 資料已提交，等待審核中')
    setKycStatus('pending')
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { text: '審核中', className: 'status-pending' },
      verified: { text: '已驗證', className: 'status-verified' },
      rejected: { text: '已拒絕', className: 'status-rejected' }
    }
    const config = statusConfig[kycStatus]
    return <span className={`kyc-status ${config.className}`}>{config.text}</span>
  }

  return (
    <div className="kyc-page">
      <div className="page-header">
        <h1>KYC 身份驗證</h1>
        <p>完成身份驗證以使用完整服務</p>
        {getStatusBadge()}
      </div>

      <div className="section">
        <h2>身份資訊</h2>
        <form className="kyc-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>姓名 *</label>
              <input
                type="text"
                placeholder="請輸入真實姓名"
                value={kycForm.fullName}
                onChange={(e) => setKycForm({...kycForm, fullName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>身分證字號 *</label>
              <input
                type="text"
                placeholder="請輸入身分證字號"
                value={kycForm.idNumber}
                onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>出生日期 *</label>
              <input
                type="date"
                value={kycForm.dateOfBirth}
                onChange={(e) => setKycForm({...kycForm, dateOfBirth: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>電話號碼 *</label>
              <input
                type="tel"
                placeholder="請輸入電話號碼"
                value={kycForm.phone}
                onChange={(e) => setKycForm({...kycForm, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>電子郵件 *</label>
            <input
              type="email"
              placeholder="請輸入電子郵件"
              value={kycForm.email}
              onChange={(e) => setKycForm({...kycForm, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>地址 *</label>
            <textarea
              placeholder="請輸入完整地址"
              rows="3"
              value={kycForm.address}
              onChange={(e) => setKycForm({...kycForm, address: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>身分證件上傳</label>
            <input type="file" accept="image/*" />
            <small>請上傳身分證正反面照片</small>
          </div>

          <button type="submit" className="btn-primary">提交驗證</button>
        </form>
      </div>

      <div className="section">
        <h2>驗證須知</h2>
        <ul className="kyc-notes">
          <li>請確保提供的資訊真實準確</li>
          <li>身分證件照片需清晰可見</li>
          <li>審核時間約 1-3 個工作天</li>
          <li>驗證通過後方可使用完整服務</li>
        </ul>
      </div>
    </div>
  )
}

export default KYCPage
