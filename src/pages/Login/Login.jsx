import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { myContext } from '../../components/Context'
import './Login.css'

const Login = () => {
  const { login } = useContext(myContext)
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [notVerified, setNotVerified] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setNotVerified(false)
    try {
      await login(e.target.email.value, e.target.password.value)
      navigate('/cliente')
    } catch (err) {
      if (err.response?.status === 403) setNotVerified(true)
      else setErrorMessage(err.response?.data?.error || 'Error al iniciar sesión.')
    }
  }

  return (
    <div className='loginContainer'>
      <form className='loginForm' onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>

        <div className='loginField'>
          <label htmlFor='email'>Email</label>
          <input className='loginInput' type='email' name='email' required />
        </div>

        <div className='loginField'>
          <label htmlFor='password'>Contraseña</label>
          <input className='loginInput' type='password' name='password' required />
        </div>

        {notVerified && (
          <div className='loginNotVerified'>
            <strong>Cuenta no verificada.</strong>
            <p>Por favor revisa tu correo de verificación o contacta al administrador.</p>
          </div>
        )}

        {errorMessage && (
          <p className='loginError'>{errorMessage}</p>
        )}

        <button className='loginBtn' type='submit'>Iniciar sesión</button>

        <p className='loginRegisterLink'>
          ¿No tienes cuenta? <Link to='/register'>Regístrate</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
