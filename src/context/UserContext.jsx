import { createContext, useState, useEffect } from 'react'

export const UserContext = createContext()
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('token') || localStorage.getItem('token') || null
  })
  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    sessionStorage.setItem('user', JSON.stringify(userData))
    if (userToken) sessionStorage.setItem('token', userToken)
  }
  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.clear()
    localStorage.clear()
  }
  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}