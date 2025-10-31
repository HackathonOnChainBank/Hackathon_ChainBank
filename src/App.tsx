import { useState } from "react";
import { Header } from "./components/header";
import { HomePage } from "./components/home-page";
import { DisasterReliefPage } from "./components/disaster-relief-page";
import { DepositPage } from "./components/deposit-page";
import { TransferPage } from "./components/transfer-page";
import { CreditCardApplyPage } from "./components/credit-card-apply-page";
import { CreditCardSpendingPage } from "./components/credit-card-spending-page";
import { Footer } from "./components/footer";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
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
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main>{renderPage()}</main>

      <Footer />
    </div>
  );
}