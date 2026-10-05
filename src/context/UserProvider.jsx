import { useState } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'

export default function UserProvider({ children }) {
  const userFromStorage = sessionStorage.getItem('user')
  const [user, setUser] = useState(() => {
    return userFromStorage ? JSON.parse(userFromStorage) : null
  })
  const signUp = async () => {
    const headers = { headers: { 'Content-Type': 'application/json' } }
    await axios.post(`${import.meta.env.VITE_API_URL}/api/user/signup`, { user }, headers)
    setUser(null)
  }
  const signIn = async () => {
    const headers = { headers: { 'Content-Type': 'application/json' } }
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/signin`, { user }, headers)
    
    const loggedInUser = response.data.user || response.data
    setUser(loggedInUser)
    sessionStorage.setItem('user', JSON.stringify(loggedInUser))
  } 
  const signOut = () => {
    setUser(null)
    sessionStorage.removeItem('user')
  }
  return ( 
    <UserContext.Provider value={{ user, setUser, signUp, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  ) 
}