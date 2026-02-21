import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { myContext } from '../../components/Context'
import EditableField from './EditableField'
import './Account.css'

const Account = () => {
  const { state, fetchUserData, saveUserData, logout, fetchRentals, returnMovie } = useContext(myContext)
  const navigate = useNavigate()
  const [editingField, setEditingField] = useState('')
  const [formData, setFormData] = useState(state.userDetails)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (!state.userData) { navigate('/login'); return }
    fetchUserData()
    fetchRentals()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFormData(state.userDetails)
  }, [state.userDetails])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await saveUserData(formData)
      setEditingField('')
      setSaveMessage('Datos guardados correctamente.')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch {
      setSaveMessage('Error al guardar los datos.')
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const handleReturn = async (rentalId) => {
    try { await returnMovie(rentalId) }
    catch (err) { alert(err.response?.data?.error || 'Error al devolver la película.') }
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-ES')

  return (
    <div className='accountContainer'>
      <div className='accountHeader'>
        <h1>Mi cuenta</h1>
        <button className='logoutBtn' onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {state.userData && (
        <p className='welcome'>Hola, <strong>{state.userDetails.firstName} {state.userDetails.lastName}</strong></p>
      )}

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

      <div className='historyContainer'>
        <h2>Historial de alquileres</h2>
        {state.rentals.length === 0
          ? <p className='historyEmpty'>No hay alquileres registrados.</p>
          : (
            <table className='historyTable'>
              <thead>
                <tr>
                  <th>Película</th>
                  <th>Días</th>
                  <th>Alquilada</th>
                  <th>Devuelta</th>
                  <th></th>
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
                        <button className='returnBtn' onClick={() => handleReturn(rental.id)}>
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
      </div>
    </div>
  )
}

export default Account
