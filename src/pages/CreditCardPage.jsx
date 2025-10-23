import { useState } from 'react';
import './CreditCardPage.css';

function CreditCardPage() {
  const [cards] = useState([
    { id: '1', number: '**** **** **** 1234', type: 'Visa', limit: 100000, used: 35000, status: '正常' },
    { id: '2', number: '**** **** **** 5678', type: 'MasterCard', limit: 50000, used: 12000, status: '正常' },
  ]);

  const [transactions] = useState([
    { id: '1', date: '2024-01-20', merchant: '全聯福利中心', amount: 1250, category: '購物' },
    { id: '2', date: '2024-01-19', merchant: 'Netflix', amount: 390, category: '娛樂' },
    { id: '3', date: '2024-01-18', merchant: '中油加油站', amount: 800, category: '交通' },
    { id: '4', date: '2024-01-17', merchant: '星巴克', amount: 150, category: '餐飲' },
  ]);

  return (
    <div className="creditcard-page">
      <div className="page-header">
        <h1>信用卡管理</h1>
        <p>管理您的信用卡與帳單</p>
      </div>

      <div className="cards-container">
        {cards.map(card => {
          const usagePercent = (card.used / card.limit) * 100
          return (
            <div key={card.id} className="credit-card">
              <div className="card-header">
                <span className="card-type">{card.type}</span>
                <span className="card-status">{card.status}</span>
              </div>
              <div className="card-number">{card.number}</div>
              <div className="card-details">
                <div className="card-info">
                  <span className="label">信用額度</span>
                  <span className="value">${card.limit.toLocaleString()}</span>
                </div>
                <div className="card-info">
                  <span className="label">已使用</span>
                  <span className="value">${card.used.toLocaleString()}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${usagePercent}%` }}></div>
              </div>
              <div className="progress-text">已使用 {usagePercent.toFixed(1)}%</div>
            </div>
          )
        })}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>最近交易記錄</h2>
          <button className="btn-secondary">查看全部</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>商家</th>
                <th>類別</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.merchant}</td>
                  <td>{tx.category}</td>
                  <td className="amount">-${tx.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>快速操作</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">💳</span>
            <span>申請新卡</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">💰</span>
            <span>繳款</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>帳單查詢</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🔒</span>
            <span>卡片掛失</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditCardPage
