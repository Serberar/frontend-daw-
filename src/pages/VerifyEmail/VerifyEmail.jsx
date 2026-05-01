import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import './VerifyEmail.css'

const API = process.env.REACT_APP_BACK_URL

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('error'); return }

    axios.get(`${API}/api/user/verify-email`, { params: { token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [searchParams])

  if (status === 'loading') return (
    <div className='verifyContainer'>
      <p className='verifyMessage'>Verificando tu cuenta…</p>
    </div>
  )

  if (status === 'success') return (
    <div className='verifyContainer'>
      <div className='verifyBox success'>
        <div className='verifyIcon'>✓</div>
        <h2>¡Email verificado!</h2>
        <p>Tu cuenta está activa. Ya puedes iniciar sesión.</p>
        <Link className='verifyBtn' to='/login'>Ir al login</Link>
      </div>
    </div>
  )

  return (
    <div className='verifyContainer'>
      <div className='verifyBox error'>
        <div className='verifyIcon'>✕</div>
        <h2>Enlace inválido o expirado</h2>
        <p>El enlace de verificación no es válido o ha caducado.</p>
        <Link className='verifyBtn' to='/register'>Volver al registro</Link>
      </div>
    </div>
  )
}

export default VerifyEmail
