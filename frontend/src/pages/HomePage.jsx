import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import api from '../axiosInstances/api.jsx'
import { useAuth } from '../context/AuthContext.jsx'




const Homepage = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("User: ", user)
  }, [user])

  if (loading) return <div>Loading...</div>

  return (
    <div>
        <div>Homepage</div>
    </div>
  )
}

export default Homepage