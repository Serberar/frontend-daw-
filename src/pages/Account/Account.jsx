import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { myContext } from '../../components/Context'
import CardPreview, { formatCardNumber } from '../../components/CardPreview/CardPreview'
import EditableField from './EditableField'
import formatDate from '../../utils/formatDate'
import './Account.css'

const Account = () => {
  const { state, fetchUserData, saveUserData, saveCard, changePassword, logout, fetchRentals, returnMovie } = useContext(myContext)
  const navigate = useNavigate()
  const timerRef = useRef([])

  const [editingField, setEditingField] = useState('')
  const [formData, setFormData] = useState(state.userDetails)
  const [saveMessage, setSaveMessage] = useState('')

  const [showCardForm, setShowCardForm] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardMsg, setCardMsg] = useState('')

  const [showPwdForm, setShowPwdForm] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')

  useEffect(() => {
    if (!state.userData) { navigate('/login'); return }
    fetchUserData()
    fetchRentals()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setFormData(state.userDetails) }, [state.userDetails])

  // Clear any pending timers on unmount
  useEffect(() => () => timerRef.current.forEach(clearTimeout), [])

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timerRef.current.push(id)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await saveUserData(formData)
      setEditingField('')
      setSaveMessage('Datos guardados correctamente.')
      later(() => setSaveMessage(''), 3000)
    } catch {
      setSaveMessage('Error al guardar los datos.')
    }
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault()
    setCardMsg('')
    const digits = cardNumber.replace(/\s/g, '')
    if (digits.length !== 16) { setCardMsg('El número de tarjeta debe tener 16 dígitos.'); return }
    try {
      await saveCard(digits)
      setCardMsg('Tarjeta actualizada correctamente.')
      setCardNumber('')
      later(() => { setCardMsg(''); setShowCardForm(false) }, 2000)
    } catch (err) {
      setCardMsg(err.response?.data?.error || 'Error al actualizar la tarjeta.')
    }
  }

  const handlePwdSubmit = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    if (pwdForm.next !== pwdForm.confirm) { setPwdMsg('Las contraseñas no coinciden.'); return }
    if (pwdForm.next.length < 6) { setPwdMsg('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    try {
      await changePassword(pwdForm.current, pwdForm.next)
      setPwdMsg('Contraseña actualizada correctamente.')
      setPwdForm({ current: '', next: '', confirm: '' })
      later(() => { setPwdMsg(''); setShowPwdForm(false) }, 2000)
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Error al cambiar la contraseña.')
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const handleReturn = async (rentalId) => {
    try { await returnMovie(rentalId) }
    catch (err) { alert(err.response?.data?.error || 'Error al devolver la película.') }
  }

  const isAdmin = state.userData?.role === 'ADMIN'

  return (
    <div className='accountContainer'>
      <div className='accountHeader'>
        <h1>Mi cuenta</h1>
        <button className='logoutBtn' onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {state.userData && (
        <p className='welcome'>Hola, <strong>{state.userDetails.firstName} {state.userDetails.lastName}</strong></p>
      )}

      {!isAdmin && (
        <>
          <div className='personalDataContainer'>
            <h2>Datos personales</h2>
            <EditableField label='Nombre' name='firstName' value={formData.firstName}
              isEditing={editingField === 'firstName'} onChange={handleChange}
              onSave={handleSave} onCancel={() => setEditingField('')} onEdit={setEditingField}
            />
            <EditableField label='Apellido' name='lastName' value={formData.lastName}
              isEditing={editingField === 'lastName'} onChange={handleChange}
              onSave={handleSave} onCancel={() => setEditingField('')} onEdit={setEditingField}
            />
            <EditableField label='Teléfono' name='phone' value={formData.phone}
              isEditing={editingField === 'phone'} onChange={handleChange}
              onSave={handleSave} onCancel={() => setEditingField('')} onEdit={setEditingField}
            />
            <EditableField label='Dirección' name='address' value={formData.address}
              isEditing={editingField === 'address'} onChange={handleChange}
              onSave={handleSave} onCancel={() => setEditingField('')} onEdit={setEditingField}
            />
            <div className='editableField readonlyField'>
              <label>Email:</label><span>{formData.email}</span>
            </div>
            <div className='editableField readonlyField'>
              <label>DNI:</label><span>{formData.dni}</span>
            </div>
          </div>
          {saveMessage && (
            <p className={`saveMessage ${saveMessage.startsWith('Error') ? 'error' : 'success'}`}>
              {saveMessage}
            </p>
          )}
        </>
      )}

      <div className='personalDataContainer cardSection'>
        <h2>Contraseña</h2>
        <div className='cardMasked'>
          <span className='cardIcon'>🔒</span>
          <span>••••••••</span>
          {!showPwdForm && (
            <button className='editBtn' onClick={() => setShowPwdForm(true)}>Cambiar contraseña</button>
          )}
        </div>
        {showPwdForm && (
          <form className='cardForm' onSubmit={handlePwdSubmit}>
            <div className='editableField'>
              <label>Contraseña actual</label>
              <input type='password' value={pwdForm.current} onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))} autoComplete='current-password' required />
            </div>
            <div className='editableField'>
              <label>Nueva contraseña</label>
              <input type='password' value={pwdForm.next} onChange={e => setPwdForm(p => ({ ...p, next: e.target.value }))} autoComplete='new-password' required />
            </div>
            <div className='editableField'>
              <label>Confirmar nueva contraseña</label>
              <input type='password' value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))} autoComplete='new-password' required />
            </div>
            {pwdMsg && (
              <p className={`saveMessage ${pwdMsg.startsWith('Contraseña actualizada') ? 'success' : 'error'}`}>{pwdMsg}</p>
            )}
            <div className='cardFormActions'>
              <button type='button' className='cancelBtn' onClick={() => { setShowPwdForm(false); setPwdForm({ current: '', next: '', confirm: '' }); setPwdMsg('') }}>Cancelar</button>
              <button type='submit' className='saveBtn'>Guardar contraseña</button>
            </div>
          </form>
        )}
      </div>

      {!isAdmin && (
        <div className='personalDataContainer cardSection'>
          <h2>Datos bancarios</h2>
          <div className='cardMasked'>
            <span className='cardIcon'>💳</span>
            <span>**** **** **** {state.userDetails.cardLast4 ?? '????'}</span>
            {!showCardForm && (
              <button className='editBtn' onClick={() => setShowCardForm(true)}>Actualizar tarjeta</button>
            )}
          </div>
          {showCardForm && (
            <form className='cardForm' onSubmit={handleCardSubmit}>
              <CardPreview
                cardNumber={cardNumber}
                cardHolder={`${state.userDetails.firstName || ''} ${state.userDetails.lastName || ''}`.trim()}
              />
              <div className='editableField' style={{ marginTop: '1rem' }}>
                <label>Número de tarjeta</label>
                <input
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder='0000 0000 0000 0000'
                  maxLength={19}
                  autoComplete='cc-number'
                />
              </div>
              {cardMsg && (
                <p className={`saveMessage ${cardMsg.startsWith('Tarjeta') ? 'success' : 'error'}`}>{cardMsg}</p>
              )}
              <div className='cardFormActions'>
                <button type='button' className='cancelBtn' onClick={() => { setShowCardForm(false); setCardNumber(''); setCardMsg('') }}>Cancelar</button>
                <button type='submit' className='saveBtn'>Guardar tarjeta</button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAdmin && (
        <div className='historyContainer'>
          <h2>Historial de alquileres</h2>
          {state.rentals.length === 0
            ? <p className='historyEmpty'>No hay alquileres registrados.</p>
            : (
              <table className='historyTable'>
                <thead>
                  <tr>
                    <th>Película</th><th>Días</th><th>Alquilada</th><th>Devuelta</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {state.rentals.map(rental => (
                    <tr key={rental.id}>
                      <td>{rental.movieTitle}</td>
                      <td>{rental.dias}</td>
                      <td>{formatDate(rental.rentedAt)}</td>
                      <td>{rental.returnedAt ? formatDate(rental.returnedAt) : <span className='activeStatus'>Activo</span>}</td>
                      <td>
                        {!rental.returnedAt && (
                          <button className='returnBtn' onClick={() => handleReturn(rental.id)}>Devolver</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}
    </div>
  )
}

export default Account
