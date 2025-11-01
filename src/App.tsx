import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // 確保導入 AuthProvider
import { Header } from './components/header';
import { HomePage } from './components/home-page';
import { InfoPage} from './components/info-page';
import { LoginPage } from './components/login-page';
import { RegisterPage } from './components/register-page';
import { DepositPage } from './components/deposit-page';
import { DisasterReliefPage } from "./components/disaster-relief-page";
import { TransferPage } from "./components/transfer-page";
import { CreditCardApplyPage } from "./components/credit-card-apply-page";
import { CreditCardSpendingPage } from "./components/credit-card-spending-page";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />; // 替換為您的首頁組件
      case "info":
        return <InfoPage />;
      case "login":
        return <LoginPage />;
      case "register":
        return <RegisterPage />;
      case "disaster-relief":
        return <DisasterReliefPage />;
      case "deposit":
        return <DepositPage />;
      case "transfer":
        return <TransferPage />;
      case "credit-card-apply":
        return <CreditCardApplyPage />;
      case "credit-card-spending":
        return <CreditCardSpendingPage />;
      default:
        return <div>404 頁面</div>;
    }
  };

  // 包裝組件以使用 useNavigate
  function AppContent() {
    const navigate = useNavigate();

    const handleNavigate = (page: string) => {
      setCurrentPage(page);
      // 如果使用路由，導航到對應路徑
      if (page === 'login') navigate('/login');
      else if (page === 'register') navigate('/register');
      else navigate('/');
    };

    return (
      <>
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <Routes>
          <Route path="/" element={renderPage()} />
          <Route path="/info" element={InfoPage()} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/disaster-relief" element={<DisasterReliefPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/credit-card-apply" element={<CreditCardApplyPage />} />
          <Route path="/credit-card-spending" element={<CreditCardSpendingPage />} />
        </Routes>
      </>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}