import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AllowanceComponent from '../test_components/AllowanceComponent';
import BalanceOfComponent from '../test_components/BalanceOfComponent';
import DecimalsComponent from '../test_components/DecimalsComponent';
import DefaultAdminRoleComponent from '../test_components/DefaultAdminRoleComponent';
import GetRestrictionComponent from '../test_components/GetRestrictionComponent';
import GetRoleAdminComponent from '../test_components/GetRoleAdminComponent';
import HasRoleComponent from '../test_components/HasRoleComponent';
import IsUserAllowedComponent from '../test_components/IsUserAllowedComponent';
import MinterRoleComponent from '../test_components/MinterRoleComponent';
import NameComponent from '../test_components/NameComponent';
import PausedComponent from '../test_components/PausedComponent';
import PauserRoleComponent from '../test_components/PauserRoleComponent';
import SupportsInterfaceComponent from '../test_components/SupportsInterfaceComponent';
import SymbolComponent from '../test_components/SymbolComponent';
import TotalSupplyComponent from '../test_components/TotalSupplyComponent';
import TransferComponent from '../test_components/TransferComponent';
import BlockAccountComponent from '../test_components/BlockAccountComponent';
import MintComponent from '../test_components/MintComponent';
import PauseComponent from '../test_components/PauseComponent';
import UnpauseComponent from '../test_components/UnpauseComponent';
import ResetAccountRestrictionComponent from '../test_components/ResetAccountRestrictionComponent';
import ApproveComponent from '../test_components/ApproveComponent';
import BurnComponent from '../test_components/BurnComponent';
import TransferFromComponent from '../test_components/TransferFromComponent';
import GrantRoleComponent from '../test_components/GrantRoleComponent';
import RevokeRoleComponent from '../test_components/RevokeRoleComponent';
import RenounceRoleComponent from '../test_components/RenounceRoleComponent';
import BurnFromComponent from '../test_components/BurnFromComponent';
import AllowAccountComponent from '../test_components/AllowAccountComponent';
import BankAdminComponent from '../test_components/BankAdminComponent';
import DepositsComponent from '../test_components/DepositsComponent';
import GetAllUsersComponent from '../test_components/GetAllUsersComponent';
import GetAllActiveDepositsComponent from '../test_components/GetAllActiveDepositsComponent';
import GetAllExpiredDepositComponent from '../test_components/GetAllExpiredDepositComponent';
import GetUserDepositsComponent from '../test_components/GetUserDepositsComponent';
import LastWithdrawTimeComponent from '../test_components/LastWithdrawTimeComponent';
import NtdComponent from '../test_components/NtdComponent';
import UsersComponent from '../test_components/UsersComponent';
import BatchWithdrawDepositComponent from '../test_components/BatchWithdrawDepositComponent';
import CreateDepositComponent from '../test_components/CreateDepositComponent';
import SendInterestComponent from '../test_components/SendInterestComponent';
import SendInterestBatchComponent from '../test_components/SendInterestBatchComponent';
import WithdrawDepositComponent from '../test_components/WithdrawDepositComponent';
import BankAdminComponentCC from '../test_components/BankAdminComponentCC';
import CreditsComponent from '../test_components/CreditsComponent';
import GetSpendRecordsComponent from '../test_components/GetSpendRecordsComponent';
import NtdComponentCC from '../test_components/NtdComponentCC';
import SpendRecordsComponent from '../test_components/SpendRecordsComponent';
import RepayComponent from '../test_components/RepayComponent';
import SetCreditLimitComponent from '../test_components/SetCreditLimitComponent';
import SpendComponent from '../test_components/SpendComponent';

function TestPage() {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  // 檢查權限：只有 admin 可以訪問
  if (!isAuthenticated || role !== 'admin') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>⚠️ 權限不足</h1>
        <p>此頁面僅限管理員訪問</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>測試頁面 (管理員專用)</h1>
      <h2><br></br>NTD_READ</h2>
      {/* config/read/ 組件 */}
      <AllowanceComponent />
      <BalanceOfComponent />
      <DecimalsComponent />
      <DefaultAdminRoleComponent />
      <GetRestrictionComponent />
      <GetRoleAdminComponent />
      <HasRoleComponent />
      <IsUserAllowedComponent />
      <MinterRoleComponent />
      <NameComponent />
      <PausedComponent />
      <PauserRoleComponent />
      <SupportsInterfaceComponent />
      <SymbolComponent />
      <TotalSupplyComponent />
      <h2><br></br>NTD_WRITE</h2>
      {/* config/write/ 組件 */}
      <TransferComponent />
      <BlockAccountComponent />
      <MintComponent />
      <PauseComponent />
      <UnpauseComponent />
      <ResetAccountRestrictionComponent />
      <ApproveComponent />
      <BurnComponent />
      <TransferFromComponent />
      <GrantRoleComponent />
      <RevokeRoleComponent />
      <RenounceRoleComponent />
      <BurnFromComponent />
      <AllowAccountComponent />
      <h2><br></br>Deposit</h2>
      {/* config/Deposit/ 組件 */}
      <BankAdminComponent />
      <DepositsComponent />
      <GetAllUsersComponent />
      <GetAllActiveDepositsComponent />
      <GetAllExpiredDepositComponent />
      <GetUserDepositsComponent />
      <LastWithdrawTimeComponent />
      <NtdComponent />
      <UsersComponent />
      <BatchWithdrawDepositComponent />
      <CreateDepositComponent />
      <SendInterestComponent />
      <SendInterestBatchComponent />
      <WithdrawDepositComponent />
      <h2><br></br>CreditCard</h2>
      {/* config/CreditCard/ 組件 */}
      <BankAdminComponentCC />
      <CreditsComponent />
      <GetSpendRecordsComponent />
      <NtdComponentCC />
      <SpendRecordsComponent />
      <RepayComponent />
      <SetCreditLimitComponent />
      <SpendComponent />
    </div>
  );
}

export default TestPage;
