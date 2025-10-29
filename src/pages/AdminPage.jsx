import { useState } from 'react';
import './AdminPage.css';
import WalrusUploader from '../components/WalrusUploader';

function AdminPage() {
  const [pendingApprovals] = useState([
    { id: '1', type: 'KYC 驗證', user: '王小明', date: '2024-01-20', status: '待審核' },
    { id: '2', type: '信用卡申請', user: '李小華', date: '2024-01-19', status: '待審核' },
    { id: '3', type: '提款申請', user: '張大同', amount: 50000, date: '2024-01-18', status: '待審核' },
  ]);

  const [systemStats] = useState({
    totalUsers: 1250,
    totalDeposits: 125000000,
    activeCards: 3420,
    pendingApprovals: 3
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>管理員控制台</h1>
        <p>系統監控與管理</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <h3>總用戶數</h3>
            <p className="stat-value">{systemStats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <h3>總存款</h3>
            <p className="stat-value">${(systemStats.totalDeposits / 1000000).toFixed(1)}M</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div>
            <h3>活躍信用卡</h3>
            <p className="stat-value">{systemStats.activeCards.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <h3>待審核</h3>
            <p className="stat-value">{systemStats.pendingApprovals}</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Walrus 檔案上傳與區塊鏈記錄</h2>
        <WalrusUploader />
      </div>

      <div className="section">
        <h2>待審核項目</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>類型</th>
                <th>用戶</th>
                <th>金額</th>
                <th>日期</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map(item => (
                <tr key={item.id}>
                  <td>{item.type}</td>
                  <td>{item.user}</td>
                  <td>{item.amount ? `$${item.amount.toLocaleString()}` : '-'}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className="status pending">{item.status}</span>
                  </td>
                  <td>
                    <button className="btn-approve">批准</button>
                    <button className="btn-reject">拒絕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
