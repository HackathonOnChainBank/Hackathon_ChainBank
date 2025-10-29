import React from 'react';
import AllowanceComponent from '../components/AllowanceComponent';
import BalanceOfComponent from '../components/BalanceOfComponent';
import DecimalsComponent from '../components/DecimalsComponent';
import DefaultAdminRoleComponent from '../components/DefaultAdminRoleComponent';
import GetRestrictionComponent from '../components/GetRestrictionComponent';
import GetRoleAdminComponent from '../components/GetRoleAdminComponent';
import HasRoleComponent from '../components/HasRoleComponent';
import IsUserAllowedComponent from '../components/IsUserAllowedComponent';
import MinterRoleComponent from '../components/MinterRoleComponent';
import NameComponent from '../components/NameComponent';
import PausedComponent from '../components/PausedComponent';
import PauserRoleComponent from '../components/PauserRoleComponent';
import SupportsInterfaceComponent from '../components/SupportsInterfaceComponent';
import SymbolComponent from '../components/SymbolComponent';
import TotalSupplyComponent from '../components/TotalSupplyComponent';
import TransferComponent from '../components/TransferComponent';
import BlockAccountComponent from '../components/BlockAccountComponent';
import MintComponent from '../components/MintComponent';
import PauseComponent from '../components/PauseComponent';
import UnpauseComponent from '../components/UnpauseComponent';
import ResetAccountRestrictionComponent from '../components/ResetAccountRestrictionComponent';
import ApproveComponent from '../components/ApproveComponent';
import BurnComponent from '../components/BurnComponent';
import TransferFromComponent from '../components/TransferFromComponent';
import GrantRoleComponent from '../components/GrantRoleComponent';
import RevokeRoleComponent from '../components/RevokeRoleComponent';
import RenounceRoleComponent from '../components/RenounceRoleComponent';
import BurnFromComponent from '../components/BurnFromComponent';
import AllowAccountComponent from '../components/AllowAccountComponent';
import BankAdminComponent from '../components/BankAdminComponent';
import DepositsComponent from '../components/DepositsComponent';
import GetAllUsersComponent from '../components/GetAllUsersComponent';
import GetAllActiveDepositsComponent from '../components/GetAllActiveDepositsComponent';
import GetAllExpiredDepositComponent from '../components/GetAllExpiredDepositComponent';
import GetUserDepositsComponent from '../components/GetUserDepositsComponent';
import LastWithdrawTimeComponent from '../components/LastWithdrawTimeComponent';
import NtdComponent from '../components/NtdComponent';
import UsersComponent from '../components/UsersComponent';
import BatchWithdrawDepositComponent from '../components/BatchWithdrawDepositComponent';
import CreateDepositComponent from '../components/CreateDepositComponent';
import SendInterestComponent from '../components/SendInterestComponent';
import SendInterestBatchComponent from '../components/SendInterestBatchComponent';
import WithdrawDepositComponent from '../components/WithdrawDepositComponent';
import WithdrawDepositsComponent from '../components/WithdrawDepositsComponent';
import BankAdminComponentCC from '../components/BankAdminComponentCC';
import CreditsComponent from '../components/CreditsComponent';
import GetSpendRecordsComponent from '../components/GetSpendRecordsComponent';
import NtdComponentCC from '../components/NtdComponentCC';
import SpendRecordsComponent from '../components/SpendRecordsComponent';
import RepayComponent from '../components/RepayComponent';
import SetCreditLimitComponent from '../components/SetCreditLimitComponent';
import SpendComponent from '../components/SpendComponent';

function TestPage() {
  return (
    <div>
      <h1>測試頁面</h1>
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
      <WithdrawDepositsComponent />
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
