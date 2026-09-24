import React, { useState, useEffect, useContext, createContext } from 'react'
import api from '../axiosInstances/api.jsx'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/loggedInUser`)
        console.log("User Fetched: ", res.data)
        setUser(res.data)
      } catch (error) {
        setUser(null)
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async () => {
    try {
      const res = await api.post('/auth/login', {
  
      })
      setUser(res.data)
      setShowLoginModal(false)
    } catch (error) {
      console.log(error)
    }
  }

  const logout = async () => {
    await api.get('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext value={{ user, setUser, logout, loading }}>
      {children}
      {showLoginModal && <LoginModal />}
    </AuthContext>
  )
}

export const useAuth = () => useContext(AuthContext)