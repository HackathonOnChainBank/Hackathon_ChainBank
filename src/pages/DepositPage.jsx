import { useState } from 'react'
import './DepositPage.css'

function DepositPage() {
  const [deposits] = useState([
    { id: '1', date: '2024-01-15', amount: 50000, type: '活期存款', rate: 1.5, status: '進行中' },
    { id: '2', date: '2024-01-10', amount: 100000, type: '定期存款', rate: 3.2, status: '進行中' },
    { id: '3', date: '2023-12-20', amount: 30000, type: '活期存款', rate: 1.5, status: '已到期' },
  ])

  const [depositForm, setDepositForm] = useState({
    amount: '',
    type: 'savings'
  })

  const totalBalance = deposits
    .filter(d => d.status === '進行中')
    .reduce((sum, d) => sum + d.amount, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('存款申請已提交！')
  }

  return (
    <div className="deposit-page">
      <div className="page-header">
        <h1>存款管理</h1>
        <p>管理您的存款帳戶</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>總存款餘額</h3>
          <p className="stat-value">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>存款帳戶數</h3>
          <p className="stat-value">{deposits.length}</p>
        </div>
        <div className="stat-card">
          <h3>平均利率</h3>
          <p className="stat-value">2.1%</p>
        </div>
      </div>

      <div className="section">
        <h2>新增存款</h2>
        <form className="deposit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>存款金額</label>
            <input
              type="number"
              placeholder="請輸入金額"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>存款類型</label>
            <select
              value={depositForm.type}
              onChange={(e) => setDepositForm({...depositForm, type: e.target.value})}
            >
              <option value="savings">活期存款</option>
              <option value="fixed">定期存款</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">提交存款</button>
        </form>
      </div>

      <div className="section">
        <h2>我的存款記錄</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>金額</th>
                <th>類型</th>
                <th>利率</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(deposit => (
                <tr key={deposit.id}>
                  <td>{deposit.date}</td>
                  <td>${deposit.amount.toLocaleString()}</td>
                  <td>{deposit.type}</td>
                  <td>{deposit.rate}%</td>
                  <td>
                    <span className={`status ${deposit.status === '進行中' ? 'active' : 'completed'}`}>
                      {deposit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DepositPage
