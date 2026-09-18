import React from 'react'
import '../css/Navbar.css'
import { NavLink } from 'react-router'
import { useState } from 'react'
import Homepage from '../pages/homepage.jsx'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <li><NavLink to='/' onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
                <li><NavLink to='/explore' onClick={() => setIsMenuOpen(false)}>Explore</NavLink></li>
                <li><NavLink to='/courses' onClick={() => setIsMenuOpen(false)}>My Learning</NavLink></li>
                <li><NavLink to='/degrees' onClick={() => setIsMenuOpen(false)}>Degrees</NavLink></li>
            </ul>
        </nav>
    )
}

export default Navbar