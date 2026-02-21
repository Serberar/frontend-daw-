import React, { createContext, useState } from 'react'
import axios from 'axios'
import { movies } from '../data/movies'

export const myContext = createContext()

const API = process.env.REACT_APP_API_URL

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function MyProvider ({ children }) {
  const savedCart = JSON.parse(localStorage.getItem('cart')) || []
  const initialSubtotal = savedCart.reduce((acc, item) => acc + item.total, 0)

  const [state, setState] = useState({
    movies,
    items: savedCart,
    subtotal: initialSubtotal,
    modalOpen: false,
    selectedMovie: null,
    userData: JSON.parse(localStorage.getItem('userData')) || null,
    userDetails: JSON.parse(localStorage.getItem('userData')) || {},
    rentals: []
  })

  // ── helpers ────────────────────────────────────────────────────────────────
  const getToken = () => localStorage.getItem('token')
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

  // ── Movies / cart ──────────────────────────────────────────────────────────

  const openModal = (movie) => {
    setState(prev => ({ ...prev, modalOpen: true, selectedMovie: movie }))
  }

  const closeModal = () => {
    setState(prev => ({ ...prev, modalOpen: false, selectedMovie: null }))
  }

  const rentMovie = (movie, days) => {
    const pricePerDay = 2
    const newItem = {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      days,
      pricePerDay,
      total: days * pricePerDay
    }

    const existing = state.items.find(item => item.id === movie.id)
    const newItems = existing
      ? state.items.map(item => item.id === movie.id ? { ...item, days, total: days * pricePerDay } : item)
      : [...state.items, newItem]

    const newSubtotal = newItems.reduce((acc, item) => acc + item.total, 0)
    localStorage.setItem('cart', JSON.stringify(newItems))

    setState(prev => ({
      ...prev,
      items: newItems,
      subtotal: newSubtotal,
      modalOpen: false,
      selectedMovie: null
    }))
  }

  const removeFromCart = (id) => {
    const newItems = state.items.filter(item => item.id !== id)
    const newSubtotal = newItems.reduce((acc, item) => acc + item.total, 0)
    localStorage.setItem('cart', JSON.stringify(newItems))
    setState(prev => ({ ...prev, items: newItems, subtotal: newSubtotal }))
  }

  const confirmRental = async () => {
    await Promise.all(
      state.items.map(item =>
        axios.post(
          `${API}/api/product/rent`,
          { movieId: item.id, movieTitle: item.title, dias: item.days },
          { headers: authHeader() }
        )
      )
    )
    localStorage.removeItem('cart')
    setState(prev => ({ ...prev, items: [], subtotal: 0 }))
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  const register = async (userData) => {
    await axios.post(`${API}/api/user/register`, userData)
  }

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/user/login`, { email, password })
    localStorage.setItem('token', data.token)

    const meRes = await axios.get(`${API}/api/user/me`, { headers: { Authorization: `Bearer ${data.token}` } })
    localStorage.setItem('userData', JSON.stringify(meRes.data))

    setState(prev => ({ ...prev, userData: meRes.data, userDetails: meRes.data }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setState(prev => ({ ...prev, userData: null, userDetails: {}, rentals: [] }))
  }

  const fetchUserData = async () => {
    const { data } = await axios.get(`${API}/api/user/me`, { headers: authHeader() })
    setState(prev => ({ ...prev, userDetails: data }))
  }

  const saveUserData = async (formData) => {
    const { data } = await axios.patch(
      `${API}/api/user/me`,
      { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address },
      { headers: authHeader() }
    )
    const updated = { ...state.userDetails, ...data }
    localStorage.setItem('userData', JSON.stringify(updated))
    setState(prev => ({ ...prev, userDetails: updated, userData: updated }))
  }

  // ── Rentals ────────────────────────────────────────────────────────────────

  const fetchRentals = async () => {
    const { data } = await axios.get(`${API}/api/product/history`, { headers: authHeader() })
    setState(prev => ({ ...prev, rentals: data }))
  }

  const returnMovie = async (rentalId) => {
    await axios.patch(`${API}/api/product/${rentalId}/return`, {}, { headers: authHeader() })
    setState(prev => ({
      ...prev,
      rentals: prev.rentals.map(r =>
        r.id === rentalId ? { ...r, returnedAt: new Date().toISOString() } : r
      )
    }))
  }

  return (
    <myContext.Provider value={{
      state,
      openModal, closeModal,
      rentMovie, removeFromCart, confirmRental,
      register, login, logout,
      fetchUserData, saveUserData,
      fetchRentals, returnMovie
    }}
    >
      {children}
    </myContext.Provider>
  )
}
