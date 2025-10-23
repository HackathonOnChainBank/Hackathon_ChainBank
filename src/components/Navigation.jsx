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
          
          {isAuthenticated && (
            <>
              {role === 'user' && (
                <>
                  <Link to="/deposit" className={isActive('/deposit') ? 'active' : ''}>
                    存款
                  </Link>
                  <Link to="/kyc" className={isActive('/kyc') ? 'active' : ''}>
                    KYC 驗證
                  </Link>
                  <Link to="/creditcard" className={isActive('/creditcard') ? 'active' : ''}>
                    信用卡
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
          <ConnectButton />
          {isAuthenticated && (
            <>
              <span className="user-role">{role === 'user' ? '使用者' : '管理員'}</span>
              <button onClick={logout} className="btn-logout">登出</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
