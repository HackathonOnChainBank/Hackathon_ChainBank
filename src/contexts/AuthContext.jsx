import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [role, setRole] = useState('visitor')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (newRole) => {
    setRole(newRole)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setRole('visitor')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ role, setRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
