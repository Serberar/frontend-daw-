import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { myContext } from '../../components/Context'
import './Register.css'

const EMPTY_FORM = {
  firstName: '', lastName: '', dni: '', phone: '', address: '', email: '',
  password: '', confirmPassword: '',
}

const EMPTY_CARD = {
  cardNumber: '', cardHolder: '', expiry: '', cvv: '',
}

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

const CardPreview = ({ cardNumber, cardHolder, expiry }) => {
  const displayNumber = (cardNumber || '').replace(/\s/g, '').padEnd(16, '•')
  const groups = [
    displayNumber.slice(0, 4),
    displayNumber.slice(4, 8),
    displayNumber.slice(8, 12),
    displayNumber.slice(12, 16),
  ]

  return (
    <div className='cardPreview'>
      <div className='cardTop'>
        <div className='cardChip' />
        <span className='cardBrand'>VISA</span>
      </div>
      <div className='cardNumberDisplay'>
        {groups.map((g, i) => <span key={i}>{g}</span>)}
      </div>
      <div className='cardBottom'>
        <div className='cardHolderSection'>
          <span className='cardLabel'>Titular</span>
          <span className='cardValue'>{cardHolder || 'NOMBRE COMPLETO'}</span>
        </div>
        <div className='cardExpirySection'>
          <span className='cardLabel'>Caduca</span>
          <span className='cardValue'>{expiry || 'MM/YY'}</span>
        </div>
      </div>
    </div>
  )
}

const Register = () => {
  const { register } = useContext(myContext)
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [card, setCard] = useState(EMPTY_CARD)
  const [stepError, setStepError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target
    if (name === 'cardNumber') {
      setCard(prev => ({ ...prev, cardNumber: formatCardNumber(value) }))
    } else if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4)
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
      setCard(prev => ({ ...prev, expiry: formatted }))
    } else if (name === 'cvv') {
      setCard(prev => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 3) }))
    } else {
      setCard(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleNextStep = () => {
    setStepError('')
    const { firstName, lastName, dni, phone, address, email, password, confirmPassword } = form
    if (!firstName || !lastName || !dni || !phone || !address || !email || !password) {
      setStepError('Todos los campos son obligatorios.')
      return
    }
    if (password !== confirmPassword) {
      setStepError('Las contraseñas no coinciden.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const { cardNumber, cardHolder, expiry, cvv } = card
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      setSubmitError('Todos los campos de la tarjeta son obligatorios.')
      return
    }

    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        dni: form.dni,
        phone: form.phone,
        address: form.address,
        email: form.email,
        password: form.password,
        cardNumber: cardNumber.replace(/\s/g, ''),
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 4000)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Error en el registro. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='registerContainer'>
        <div className='registerSuccess'>
          <div className='successIcon'>✓</div>
          <h2>¡Cuenta creada!</h2>
          <p>Enviamos un email de verificación a <strong>{form.email}</strong>.</p>
          <p>Haz clic en el enlace del email para activar tu cuenta antes de iniciar sesión.</p>
          <p className='redirectNote'>Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    )
  }

  return (
    <div className='registerContainer'>
      <div className='stepIndicator'>
        <div className={`stepDot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className='stepLine' />
        <div className={`stepDot ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>

      {step === 1 && (
        <form className='registerForm' onSubmit={e => { e.preventDefault(); handleNextStep() }}>
          <h1>Crear cuenta</h1>
          <p className='registerSubtitle'>Paso 1 de 2 — Datos personales</p>

          <div className='registerGrid'>
            <div className='loginField'>
              <label>Nombre</label>
              <input className='loginInput' name='firstName' value={form.firstName} onChange={handleFormChange} required />
            </div>
            <div className='loginField'>
              <label>Apellido</label>
              <input className='loginInput' name='lastName' value={form.lastName} onChange={handleFormChange} required />
            </div>
            <div className='loginField'>
              <label>DNI</label>
              <input className='loginInput' name='dni' value={form.dni} onChange={handleFormChange} required />
            </div>
            <div className='loginField'>
              <label>Teléfono</label>
              <input className='loginInput' name='phone' value={form.phone} onChange={handleFormChange} required />
            </div>
          </div>

          <div className='loginField'>
            <label>Dirección</label>
            <input className='loginInput' name='address' value={form.address} onChange={handleFormChange} required />
          </div>
          <div className='loginField'>
            <label>Email</label>
            <input className='loginInput' type='email' name='email' value={form.email} onChange={handleFormChange} required />
          </div>
          <div className='loginField'>
            <label>Contraseña</label>
            <input className='loginInput' type='password' name='password' value={form.password} onChange={handleFormChange} required />
          </div>
          <div className='loginField'>
            <label>Confirmar contraseña</label>
            <input className='loginInput' type='password' name='confirmPassword' value={form.confirmPassword} onChange={handleFormChange} required />
          </div>

          {stepError && <p className='loginError'>{stepError}</p>}

          <button className='loginBtn' type='submit'>Siguiente →</button>
          <p className='registerLoginLink'>¿Ya tienes cuenta? <Link to='/login'>Iniciar sesión</Link></p>
        </form>
      )}

      {step === 2 && (
        <form className='registerForm' onSubmit={handleSubmit}>
          <h1>Datos de pago</h1>
          <p className='registerSubtitle'>Paso 2 de 2 — Registro seguro de tarjeta</p>

          <CardPreview
            cardNumber={card.cardNumber}
            cardHolder={card.cardHolder}
            expiry={card.expiry}
          />

          <div className='loginField'>
            <label>Número de tarjeta</label>
            <input
              className='loginInput cardInput'
              name='cardNumber'
              value={card.cardNumber}
              onChange={handleCardChange}
              placeholder='0000 0000 0000 0000'
              maxLength={19}
              required
            />
          </div>

          <div className='loginField'>
            <label>Nombre del titular</label>
            <input
              className='loginInput'
              name='cardHolder'
              value={card.cardHolder}
              onChange={handleCardChange}
              placeholder='Nombre tal como aparece en la tarjeta'
              required
            />
          </div>

          <div className='cardDetailsRow'>
            <div className='loginField'>
              <label>Fecha de vencimiento</label>
              <input
                className='loginInput'
                name='expiry'
                value={card.expiry}
                onChange={handleCardChange}
                placeholder='MM/YY'
                maxLength={5}
                required
              />
            </div>
            <div className='loginField'>
              <label>CVV</label>
              <input
                className='loginInput'
                name='cvv'
                value={card.cvv}
                onChange={handleCardChange}
                placeholder='•••'
                maxLength={3}
                type='password'
                required
              />
            </div>
          </div>

          <div className='secureNote'>
            <span className='lockIcon'>🔒</span> Los datos de tu tarjeta se almacenan de forma segura y solo se usarán para pagos.
          </div>

          {submitError && <p className='loginError'>{submitError}</p>}

          <div className='registerActions'>
            <button type='button' className='backBtn' onClick={() => setStep(1)}>← Atrás</button>
            <button type='submit' className='loginBtn' disabled={loading}>
              {loading ? 'Registrando…' : 'Completar registro'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Register
