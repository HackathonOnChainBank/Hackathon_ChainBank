import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect } from 'wagmi'; // 添加 useConnect import
import { ConnectButton } from '@rainbow-me/rainbowkit'; // 添加 import
import './AdminPage.css';
import WalrusUploader from '../components/WalrusUploader';
import { DISASTER_RELIEF_ABI, DISASTER_RELIEF_ADDRESS } from '../config/DisasterRelief_ABI';
import { ABI as NTD_TOKEN_ABI } from '../config/NTD_TOKEN_ABI';

const NTD_TOKEN_ADDRESS = '0x870F7e55A15e597342697652A536d5aA58ce932e';

function AdminPage() {
  // 使用 wagmi 的 hooks
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect(); // 添加 useConnect

  // 計算管理員地址（從 VITE_PRIVATE_KEY_1）
  const adminPrivateKey = import.meta.env.VITE_PRIVATE_KEY_1;
  const adminWallet = adminPrivateKey ? new ethers.Wallet(adminPrivateKey) : null;
  const adminAddress = adminWallet ? adminWallet.address.toLowerCase() : '';

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

  // 災難救助金狀態
  const [reliefPrograms, setReliefPrograms] = useState([]);
  const [contractBalance, setContractBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 創建計劃表單
  const [newProgram, setNewProgram] = useState({
    name: '',
    totalBudget: '',
    amountPerPerson: ''
  });

  // 檢查是否是管理員
  const isAdmin = isConnected && address && address.toLowerCase() === adminAddress;

  // 獲取 provider 和 signer（使用 wagmi 的 provider）
  const getContract = async () => {
    if (!window.ethereum) {
      alert('請安裝 MetaMask');
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(DISASTER_RELIEF_ADDRESS, DISASTER_RELIEF_ABI, signer);
  };

  // 載入救助計劃列表
  const loadReliefPrograms = async () => {
    if (!DISASTER_RELIEF_ADDRESS) {
      console.log('請先部署 DisasterRelief 合約並設定地址');
      return;
    }

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const programCount = await contract.programCounter();
      const programs = [];

      for (let i = 0; i < programCount; i++) {
        const info = await contract.getProgramInfo(i);
        programs.push({
          id: i,
          name: info[0],
          totalBudget: ethers.formatUnits(info[1], 18),
          amountPerPerson: ethers.formatUnits(info[2], 18),
          totalDistributed: ethers.formatUnits(info[3], 18),
          recipientCount: info[4].toString(),
          remainingBudget: ethers.formatUnits(info[5], 18),
          isActive: info[6]
        });
      }

      setReliefPrograms(programs);

      // 獲取合約 NTD_TOKEN 餘額
      const balance = await contract.getContractBalance();
      setContractBalance(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error('載入救助計劃失敗:', error);
      alert('載入失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 創建新計劃
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    
    if (!newProgram.name || !newProgram.totalBudget || !newProgram.amountPerPerson) {
      alert('請填寫所有欄位');
      return;
    }

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const totalBudget = ethers.parseUnits(newProgram.totalBudget, 18);
      const amountPerPerson = ethers.parseUnits(newProgram.amountPerPerson, 18);

      const tx = await contract.createProgram(
        newProgram.name,
        totalBudget,
        amountPerPerson
      );

      await tx.wait();
      alert('救助計劃創建成功！');
      
      setNewProgram({ name: '', totalBudget: '', amountPerPerson: '' });
      setShowCreateForm(false);
      loadReliefPrograms();
    } catch (error) {
      console.error('創建計劃失敗:', error);
      alert('創建失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 充值合約 (NTD_TOKEN)
  const handleDeposit = async () => {
    const amount = prompt('請輸入充值金額 (NTD):');
    if (!amount) return;

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // 先 approve NTD_TOKEN
      const ntdToken = new ethers.Contract(NTD_TOKEN_ADDRESS, NTD_TOKEN_ABI, signer);
      const amountInWei = ethers.parseUnits(amount, 18);
      
      console.log('Approving NTD_TOKEN...');
      const approveTx = await ntdToken.approve(DISASTER_RELIEF_ADDRESS, amountInWei);
      await approveTx.wait();
      
      console.log('Depositing to contract...');
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.deposit(amountInWei);
      await tx.wait();
      
      alert('充值成功！');
      loadReliefPrograms();
    } catch (error) {
      console.error('充值失敗:', error);
      alert('充值失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 關閉計劃
  const handleCloseProgram = async (programId) => {
    if (!confirm('確定要關閉此計劃嗎？')) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.closeProgram(programId);
      await tx.wait();
      
      alert('計劃已關閉！');
      loadReliefPrograms();
    } catch (error) {
      console.error('關閉計劃失敗:', error);
      alert('關閉失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 重新開啟計劃
  const handleReopenProgram = async (programId) => {
    if (!confirm('確定要重新開啟此計劃嗎？')) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.reopenProgram(programId);
      await tx.wait();
      
      alert('計劃已重新開啟！');
      loadReliefPrograms();
    } catch (error) {
      console.error('重新開啟計劃失敗:', error);
      alert('重新開啟失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 增加預算
  const handleIncreaseBudget = async (programId) => {
    const amount = prompt('請輸入要增加的預算金額 (NTD):');
    if (!amount) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.increaseBudget(
        programId, 
        ethers.parseUnits(amount, 18)
      );
      await tx.wait();
      
      alert('預算增加成功！');
      loadReliefPrograms();
    } catch (error) {
      console.error('增加預算失敗:', error);
      alert('增加預算失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && isAdmin && DISASTER_RELIEF_ADDRESS) {
      loadReliefPrograms();
    }
  }, [isConnected, isAdmin]); // 添加依賴項

  // 如果未連接或不是管理員，顯示登入提示
  if (!isConnected || !isAdmin) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h1>管理員控制台</h1>
          <p>請連接管理員錢包以繼續</p>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          {!isConnected ? (
            <>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                請連接您的錢包
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ConnectButton /> {/* 使用 RainbowKit 的 ConnectButton */}
              </div>
            </>
          ) : (
            <p style={{ color: '#ff6b6b' }}>
              此地址無管理員權限。請切換到管理員錢包。
            </p>
          )}
          <p style={{ marginTop: '20px', color: '#666' }}>
            需要 MetaMask 或其他 Web3 錢包，並使用管理員地址
          </p>
        </div>
      </div>
    );
  }

  // 已連接且是管理員，顯示完整頁面
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>管理員控制台</h1>
        <p>系統監控與管理 - 已連接管理員: {address.slice(0, 6)}...{address.slice(-4)}</p>
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

      {/* 災難救助金管理區塊 */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🆘 災難救助金管理</h2>
          <div>
            <button 
              className="btn-approve" 
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={loading || !DISASTER_RELIEF_ADDRESS}
            >
              {showCreateForm ? '取消' : '創建新計劃'}
            </button>
            <button 
              className="btn-approve" 
              onClick={handleDeposit}
              disabled={loading || !DISASTER_RELIEF_ADDRESS}
              style={{ marginLeft: '10px' }}
            >
              充值合約
            </button>
            <button 
              className="btn-refresh" 
              onClick={loadReliefPrograms}
              disabled={loading || !DISASTER_RELIEF_ADDRESS}
              style={{ marginLeft: '10px' }}
            >
              刷新
            </button>
          </div>
        </div>

        {!DISASTER_RELIEF_ADDRESS && (
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
            ⚠️ 請先部署 DisasterRelief 合約並在 <code>src/config/DisasterRelief_ABI.js</code> 中設定合約地址
          </div>
        )}

        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>合約餘額:</strong> {contractBalance} NTD
        </div>

        {/* 創建計劃表單 */}
        {showCreateForm && (
          <div style={{ padding: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>創建救助計劃</h3>
            <form onSubmit={handleCreateProgram}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  計劃名稱:
                </label>
                <input
                  type="text"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                  placeholder="例如: 颱風救助金"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  總預算 (NTD):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={newProgram.totalBudget}
                  onChange={(e) => setNewProgram({...newProgram, totalBudget: e.target.value})}
                  placeholder="例如: 10000"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  每人領取金額 (NTD):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={newProgram.amountPerPerson}
                  onChange={(e) => setNewProgram({...newProgram, amountPerPerson: e.target.value})}
                  placeholder="例如: 100"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-approve"
                disabled={loading}
              >
                {loading ? '處理中...' : '創建計劃'}
              </button>
            </form>
          </div>
        )}

        {/* 計劃列表 */}
        {reliefPrograms.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>計劃名稱</th>
                  <th>總預算</th>
                  <th>每人金額</th>
                  <th>已發放</th>
                  <th>剩餘預算</th>
                  <th>領取人數</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {reliefPrograms.map(program => (
                  <tr key={program.id}>
                    <td>{program.id}</td>
                    <td><strong>{program.name}</strong></td>
                    <td>{parseFloat(program.totalBudget).toFixed(2)} NTD</td>
                    <td>{parseFloat(program.amountPerPerson).toFixed(2)} NTD</td>
                    <td>{parseFloat(program.totalDistributed).toFixed(2)} NTD</td>
                    <td>{parseFloat(program.remainingBudget).toFixed(2)} NTD</td>
                    <td>{program.recipientCount} 人</td>
                    <td>
                      <span className={`status ${program.isActive ? 'approved' : 'rejected'}`}>
                        {program.isActive ? '🟢 進行中' : '🔴 已關閉'}
                      </span>
                    </td>
                    <td>
                      {program.isActive ? (
                        <>
                          <button 
                            className="btn-approve" 
                            onClick={() => handleIncreaseBudget(program.id)}
                            disabled={loading}
                            style={{ marginRight: '5px' }}
                          >
                            增加預算
                          </button>
                          <button 
                            className="btn-reject" 
                            onClick={() => handleCloseProgram(program.id)}
                            disabled={loading}
                          >
                            關閉
                          </button>
                        </>
                      ) : (
                        <button 
                          className="btn-approve" 
                          onClick={() => handleReopenProgram(program.id)}
                          disabled={loading}
                        >
                          重新開啟
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && DISASTER_RELIEF_ADDRESS && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              尚無救助計劃，點擊「創建新計劃」開始
            </div>
          )
        )}
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
