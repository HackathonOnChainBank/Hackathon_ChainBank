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
    </div>
  );
}

export default TestPage;
