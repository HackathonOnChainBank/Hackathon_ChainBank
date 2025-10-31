import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [role, setRole] = useState('visitor')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化時檢查是否有已登入的用戶
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const shortUuid = localStorage.getItem('chainbank_current_user')
        if (shortUuid) {
          const userData = getUserByShortUuid(shortUuid)
          if (userData) {
            setCurrentUser(userData)
            setIsAuthenticated(true)
            // 根據用戶資料設定角色（可擴展）
            setRole(userData.role || 'user')
          } else {
            // 清除無效的登入狀態
            localStorage.removeItem('chainbank_current_user')
          }
        }
      } catch (error) {
        console.error('Error loading current user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  // 根據 shortUuid 獲取用戶資料
  const getUserByShortUuid = (shortUuid) => {
    try {
      const usersData = localStorage.getItem('chainbank_users')
      if (!usersData) return null
      
      const users = JSON.parse(usersData)
      return users[shortUuid] || null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // 檢查用戶是否存在
  const checkUserExists = (shortUuid) => {
    return getUserByShortUuid(shortUuid) !== null
  }

  // 登入（兼容舊的 role-based 和新的 user-based）
  const login = (shortUuidOrRole) => {
    // 如果是舊的 role 登入方式
    if (['visitor', 'admin', 'user'].includes(shortUuidOrRole)) {
      setRole(shortUuidOrRole)
      setIsAuthenticated(true)
      return { role: shortUuidOrRole }
    }

    // 新的 UUID 登入方式
    const userData = getUserByShortUuid(shortUuidOrRole)
    if (!userData) {
      throw new Error('用戶不存在')
    }
    
    setCurrentUser(userData)
    setIsAuthenticated(true)
    setRole(userData.role || 'user')
    localStorage.setItem('chainbank_current_user', shortUuidOrRole)
    return userData
  }

  // 登出
  const logout = () => {
    setRole('visitor')
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem('chainbank_current_user')
  }

  // 註冊新用戶
  const register = (userData) => {
    try {
      // 讀取現有用戶
      const existingUsersData = localStorage.getItem('chainbank_users')
      const existingUsers = existingUsersData ? JSON.parse(existingUsersData) : {}

      // 檢查 UUID 是否已存在
      if (existingUsers[userData.shortUuid]) {
        throw new Error('此 UUID 已被使用')
      }

      // 儲存新用戶
      existingUsers[userData.shortUuid] = {
        ...userData,
        createdAt: new Date().toISOString(),
        role: 'user' // 預設角色
      }
      localStorage.setItem('chainbank_users', JSON.stringify(existingUsers))

      // 自動登入
      setCurrentUser(existingUsers[userData.shortUuid])
      setIsAuthenticated(true)
      setRole('user')
      localStorage.setItem('chainbank_current_user', userData.shortUuid)

      return existingUsers[userData.shortUuid]
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  }

  // 更新用戶資料
  const updateUser = (shortUuid, updates) => {
    try {
      const usersData = localStorage.getItem('chainbank_users')
      if (!usersData) throw new Error('找不到用戶資料')

      const users = JSON.parse(usersData)
      if (!users[shortUuid]) throw new Error('用戶不存在')

      // 更新用戶資料
      users[shortUuid] = {
        ...users[shortUuid],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem('chainbank_users', JSON.stringify(users))

      // 如果更新的是當前用戶，同步更新狀態
      if (currentUser && currentUser.shortUuid === shortUuid) {
        setCurrentUser(users[shortUuid])
      }

      return users[shortUuid]
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // 獲取所有用戶（僅供管理用途）
  const getAllUsers = () => {
    try {
      const usersData = localStorage.getItem('chainbank_users')
      return usersData ? JSON.parse(usersData) : {}
    } catch (error) {
      console.error('Error getting all users:', error)
      return {}
    }
  }

  // 刪除用戶（僅供管理用途）
  const deleteUser = (shortUuid) => {
    try {
      const usersData = localStorage.getItem('chainbank_users')
      if (!usersData) throw new Error('找不到用戶資料')

      const users = JSON.parse(usersData)
      if (!users[shortUuid]) throw new Error('用戶不存在')

      delete users[shortUuid]
      localStorage.setItem('chainbank_users', JSON.stringify(users))

      // 如果刪除的是當前用戶，執行登出
      if (currentUser && currentUser.shortUuid === shortUuid) {
        logout()
      }

      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      role, 
      setRole, 
      isAuthenticated, 
      login, 
      logout,
      currentUser,
      isLoading,
      register,
      updateUser,
      checkUserExists,
      getUserByShortUuid,
      getAllUsers,
      deleteUser
    }}>
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
