import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleRoleSelect = (role) => {
    login(role)
    if (role === 'user') {
      navigate('/deposit')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>歡迎來到 RWA 銀行系統</h1>
        <p>Real World Asset 數位化資產管理平台</p>
      </div>

      <div className="role-selection">
        <h2>選擇您的身份</h2>
        <div className="role-cards">
          <div className="role-card" onClick={() => handleRoleSelect('user')}>
            <div className="role-icon">👤</div>
            <h3>一般使用者</h3>
            <p>存款管理、KYC 驗證、信用卡服務</p>
            <button className="btn-primary">進入</button>
          </div>

          <div className="role-card" onClick={() => handleRoleSelect('admin')}>
            <div className="role-icon">⚙️</div>
            <h3>管理員</h3>
            <p>系統管理、審核與監控</p>
            <button className="btn-primary">進入</button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>平台特色</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>安全可靠</h3>
            <p>區塊鏈技術保障資產安全</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>即時交易</h3>
            <p>快速完成資產交易流程</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>透明監控</h3>
            <p>全程可追蹤的交易記錄</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>全球接軌</h3>
            <p>符合國際標準的數位資產</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
