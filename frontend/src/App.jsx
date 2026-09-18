import React from 'react'
import { Route, Routes } from 'react-router'
import Navbar from './components/Navbar.jsx'
import Homepage from './pages/homepage.jsx'
import Courses from './pages/Courses.jsx'
import Degrees from './pages/Degrees.jsx'

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