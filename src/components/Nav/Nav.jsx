import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { myContext } from '../Context'
import './Nav.css'

const Nav = () => {
  const { state, logout } = useContext(myContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const totalItems = state.items.length

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className='nav'>
      <div className='navLogo'>
        <Link to='/'>🎬 CineRent</Link>
      </div>

      <button
        className='hamburger'
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label='Menu'
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`navLinks ${menuOpen ? 'open' : ''}`}>
        <li>
          <Link to='/' onClick={() => setMenuOpen(false)}>Catálogo</Link>
        </li>
        <li>
          <Link to='/carrito' className='cartLink' onClick={() => setMenuOpen(false)}>
            🛒 Carrito
            {totalItems > 0 && <span className='badge'>{totalItems}</span>}
          </Link>
        </li>

        {state.userData
          ? (
            <>
              <li>
                <Link to='/cliente' onClick={() => setMenuOpen(false)}>
                  👤 {state.userData.firstName}
                </Link>
              </li>
              <li>
                <button className='navLogoutBtn' onClick={handleLogout}>Cerrar sesión</button>
              </li>
            </>
            )
          : (
            <>
              <li>
                <Link to='/register' className='navRegisterLink' onClick={() => setMenuOpen(false)}>
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to='/login' className='navLoginLink' onClick={() => setMenuOpen(false)}>
                  Iniciar sesión
                </Link>
              </li>
            </>
            )}
      </ul>
    </nav>
  )
}

export default Nav
