import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { myContext } from '../../components/Context'
import './Cart.css'

const Cart = () => {
  const { state, removeFromCart, confirmRental } = useContext(myContext)
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!state.userData) {
      navigate('/login')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await confirmRental()
      setMessage('¡Alquiler confirmado! Puedes ver tu historial en el área personal.')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al confirmar el alquiler.')
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className='cart'>
        <h2>Tu carrito de alquiler</h2>
        {message
          ? <p className='cartMessage success'>{message}</p>
          : (
            <p className='cartEmpty'>
              No tienes películas en el carrito.{' '}
              <Link to='/'>Ver catálogo</Link>
            </p>
            )}
      </div>
    )
  }

  return (
    <div className='cart'>
      <h2>Tu carrito de alquiler</h2>
      <ul className='cartList'>
        {state.items.map((item) => (
          <li key={item.id}>
            <div className='cartItem'>
              <img
                src={item.posterUrl}
                alt={item.title}
                className='cartImage'
                onError={e => { e.target.src = 'https://via.placeholder.com/50x75.png?text=?' }}
              />
              <div className='cartInfo'>
                <span className='cartItemName'>{item.title}</span>
                <span className='cartItemDays'>{item.days} {item.days === 1 ? 'día' : 'días'} · {item.pricePerDay}€/día</span>
              </div>
              <span className='cartItemTotal'>{item.total}€</span>
            </div>
            <button className='removeBtn' onClick={() => removeFromCart(item.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <p className='cartTotal'>Total: {state.subtotal}€</p>

      {!state.userData && (
        <p className='cartLoginNotice'>
          <Link to='/login'>Inicia sesión</Link> para confirmar el alquiler
        </p>
      )}

      {message && (
        <p className={`cartMessage ${message.startsWith('¡') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <button className='checkoutBtn' onClick={handleConfirm} disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar alquiler'}
      </button>
    </div>
  )
}

export default Cart
