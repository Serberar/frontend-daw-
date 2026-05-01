import { Route, Routes } from 'react-router-dom'
import Movies from '../pages/Movies/Movies'
import Cart from '../pages/Cart/Cart'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Account from '../pages/Account/Account'
import VerifyEmail from '../pages/VerifyEmail/VerifyEmail'
import Admin from '../pages/Admin/Admin'

function Path () {
  return (
    <Routes>
      <Route exact path='/' element={<Movies />} />
      <Route path='/carrito' element={<Cart />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/cliente' element={<Account />} />
      <Route path='/verify-email' element={<VerifyEmail />} />
      <Route path='/admin' element={<Admin />} />
    </Routes>
  )
}

export default Path
