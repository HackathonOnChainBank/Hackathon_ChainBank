import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireAuth = true, requireRole = null }) {
  const { isAuthenticated, currentUser, isLoading, role } = useAuth();

  // 等待加載完成
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>載入中...</div>
      </div>
    );
  }

  // 檢查是否需要登入
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 檢查角色權限
  if (requireRole && role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
