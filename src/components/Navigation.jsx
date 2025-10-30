import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '../contexts/AuthContext'
import './Navigation.css'

function Navigation() {
  const { role, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">RWA 銀行系統</Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            首頁
          </Link>
          
          <Link to="/disaster" className={isActive('/disaster') ? 'active' : ''}>
            災難救助
          </Link>
          
          <Link to="/test" className={isActive('/test') ? 'active' : ''}>
            測試頁面
          </Link>
          
          {isAuthenticated && (
            <>
              {role === 'user' && (
                <>
                  <Link to="/deposit" className={isActive('/deposit') ? 'active' : ''}>
                    存款
                  </Link>
                  <Link to="/transfer" className={isActive('/transfer') ? 'active' : ''}>
                    一般轉帳
                  </Link>
                  <Link to="/kyc" className={isActive('/kyc') ? 'active' : ''}>
                    KYC 驗證
                  </Link>
                  <Link to="/creditcard" className={isActive('/creditcard') ? 'active' : ''}>
                    信用卡申請
                  </Link>
                  <Link to="/creditcard-spend" className={isActive('/creditcard-spend') ? 'active' : ''}>
                    信用卡消費
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                  管理員
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-user">
          {/* 只有管理員才顯示錢包連接按鈕 */}
          {role === 'admin' && <ConnectButton />}
          
          {isAuthenticated ? (
            <>
              <span className="user-role">
                {role === 'user' ? '使用者' : role === 'admin' ? '管理員' : '訪客'}
              </span>
              <button onClick={logout} className="btn-logout">登出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-nav btn-primary">
                登入
              </Link>
              <Link to="/register" className="btn-nav btn-primary">
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
