import { useState, useEffect } from 'react'
import { useUser } from '../context/useUser'
import axios from 'axios'
import './MyProfile.css'


function MyProfile() {
    const { user, setUser } = useUser()
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState("")

    const logout = () => {
    setUser({ email: '', password: '' })
    sessionStorage.removeItem('user')
    }

    const deleteAccount = async () => {
    const confirmed = window.confirm(
    "Are you sure you want to delete your account?"
    )

    if (!confirmed) {
        return
    }

    try {
        await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/me`,
        {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        }
    )

        setUser({ email: '', password: '' })
        sessionStorage.removeItem('user')
    } catch (error) {
        console.error(error)
        setError("Account could not be deleted.")
    }
    }

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/me`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        )

        setProfile(response.data)
      } catch (error) {
        console.error(error)
        setError("Profile information could not be loaded.")
      }
    }

    if (user?.token) {
      getProfile()
    }
  }, [user])

  if (!user?.token) {
    return <p>"Logout successful."</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!profile) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>My Profile</h1>

      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <div className="profile-buttons">
      <button onClick={logout}>Log out</button>
      <button onClick={deleteAccount}>Delete account</button>
      </div>

    </div>
  )
}

export default MyProfile
