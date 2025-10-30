import { Routes, Route, Link } from 'react-router-dom'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import DepositPage from './pages/DepositPage'
import CreditCardPage from './pages/CreditCardPage'
import CreditCardSpendPage from './pages/CreditCardSpendPage'
import AdminPage from './pages/AdminPage'
import DisasterReliefPage from './pages/DisasterReliefPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import TestPage from './pages/testPage'
import TransferPage from './pages/TransferPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
  <Route path="/transfer" element={<TransferPage />} />
        <Route path="/disaster" element={<DisasterReliefPage />} />
        <Route path="/test" element={<TestPage />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route 
          path="/deposit" 
          element={
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creditcard" 
          element={
            <ProtectedRoute>
              <CreditCardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/creditcard-spend" 
          element={
            <ProtectedRoute>
              <CreditCardSpendPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Only Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
