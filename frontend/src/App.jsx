import Navbar from './components/Navbar.jsx'
import Homepage from './pages/HomePage.jsx'
import Courses from './pages/Courses.jsx'
import Degrees from './pages/Degrees.jsx'
import api from './axiosInstances/api.jsx'
import { AuthContext } from './context/context.jsx'
import { Route, Routes } from 'react-router'
import React, { useEffect, useState } from 'react'

// shortcut for creating component: rafce (arrow function)
const App = () => {
  return (
    <div>
        <Navbar />
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='/degrees' element={<Degrees />} />
        </Routes>
    </div>
  )
}

export default App