import React from 'react'
import '../css/Navbar.css'
import { NavLink } from 'react-router'
import { useState } from 'react'
import Homepage from '../pages/HomePage.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, loading } = useAuth()

    if (loading) return (<div></div>)

    return (
        <nav className='navbar'>
            <button
                className="navbar-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                ☰
            </button>

            <div className='navbar-brand'>Coursera</div>

            <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                {user ? (
                    <>
                        <li><NavLink to='/' onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
                        <li><NavLink to='/explore' onClick={() => setIsMenuOpen(false)}>Explore</NavLink></li>
                        <li><NavLink to='/courses' onClick={() => setIsMenuOpen(false)}>My Learning</NavLink></li>
                        <li><NavLink to='/degrees' onClick={() => setIsMenuOpen(false)}>Degrees</NavLink></li>
                    </>) : (
                    <>
                        <li><NavLink to='/' onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
                        <li><NavLink to='/explore' onClick={() => setIsMenuOpen(false)}>Explore</NavLink></li>
                        <li><NavLink to='/degrees' onClick={() => setIsMenuOpen(false)}>Degrees</NavLink></li>
                        <li><NavLink to='/login' onClick={() => setIsMenuOpen(false)}>Login</NavLink></li>
                    </>
                )}

            </ul>
        </nav>
    )
}

export default Navbar