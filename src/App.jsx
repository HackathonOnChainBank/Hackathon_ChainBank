import { Routes, Route, Link } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import DepositPage from './pages/DepositPage'
import KYCPage from './pages/KYCPage'
import CreditCardPage from './pages/CreditCardPage'
import AdminPage from './pages/AdminPage'
import DisasterReliefPage from './pages/DisasterReliefPage'
import TestPage from './pages/testPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navigation />
      <Link to="/test">前往測試頁面</Link>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/creditcard" element={<CreditCardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/disaster" element={<DisasterReliefPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  )
}

export default App
