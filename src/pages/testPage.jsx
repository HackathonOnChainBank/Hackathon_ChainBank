import React from 'react';
import AllowanceComponent from '../components/AllowanceComponent';
import BalanceOfComponent from '../components/BalanceOfComponent';
import GetRestrictionComponent from '../components/GetRestrictionComponent';
import TransferComponent from '../components/TransferComponent';

function TestPage() {
  return (
    <div>
      <h1>測試頁面</h1>
      <p>這是一個測試頁面，用於開發和測試功能。</p>
      <AllowanceComponent />
      <BalanceOfComponent />
      <GetRestrictionComponent />
      <TransferComponent />
    </div>
  );
}

export default TestPage;
