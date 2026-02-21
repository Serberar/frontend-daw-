import { Route, Routes } from 'react-router-dom'
import Movies from '../pages/Movies/Movies'
import Cart from '../pages/Cart/Cart'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Account from '../pages/Account/Account'

function Path () {
  return (
    <Routes>
      <Route exact path='/' element={<Movies />} />
      <Route path='/carrito' element={<Cart />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/cliente' element={<Account />} />
    </Routes>
  )
}

export default Path
