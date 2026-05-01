import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { fetchMovies, adaptMovie } from '../services/movieService'

export const myContext = createContext()

const API = process.env.REACT_APP_BACK_URL

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

export function MyProvider({ children }) {
  const [state, setState] = useState(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || []
    return {
      movies: [],
      genres: [],
      featuredMovies: [],
      items,
      modalOpen: false,
      selectedMovie: null,
      userData: JSON.parse(localStorage.getItem('userData')) || null,
      userDetails: JSON.parse(localStorage.getItem('userData')) || {},
      rentals: []
    }
  })

  useEffect(() => {
    fetchMovies().then(movies => setState(prev => ({ ...prev, movies })))
    axios.get(`${API}/api/genre`).then(({ data }) => setState(prev => ({ ...prev, genres: data })))
    axios.get(`${API}/api/movie/featured`)
      .then(({ data }) => setState(prev => ({ ...prev, featuredMovies: data.map(adaptMovie) })))
      .catch(() => {})
  }, [])

  const getToken = () => localStorage.getItem('token')
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

  const openModal = (movie) => setState(prev => ({ ...prev, modalOpen: true, selectedMovie: movie }))
  const closeModal = () => setState(prev => ({ ...prev, modalOpen: false, selectedMovie: null }))

  const rentMovie = (movie, days, pricePerDay = 2) => {
    const newItem = { id: movie.id, title: movie.title, posterUrl: movie.posterUrl, days, pricePerDay, total: days * pricePerDay }
    const existing = state.items.find(item => item.id === movie.id)
    const newItems = existing
      ? state.items.map(item => item.id === movie.id ? { ...item, days, pricePerDay, total: days * pricePerDay } : item)
      : [...state.items, newItem]
    localStorage.setItem('cart', JSON.stringify(newItems))
    setState(prev => ({ ...prev, items: newItems, modalOpen: false, selectedMovie: null }))
  }

  const removeFromCart = (id) => {
    const newItems = state.items.filter(item => item.id !== id)
    localStorage.setItem('cart', JSON.stringify(newItems))
    setState(prev => ({ ...prev, items: newItems }))
  }

  const confirmRental = async () => {
    await Promise.all(
      state.items.map(item =>
        axios.post(`${API}/api/product/rent`, { movieId: item.id, movieTitle: item.title, dias: item.days }, { headers: authHeader() })
      )
    )
    localStorage.removeItem('cart')
    setState(prev => ({ ...prev, items: [] }))
    await fetchRentals()
  }

  const register = async (userData) => {
    await axios.post(`${API}/api/user/register`, userData)
  }

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/user/login`, { email, password })
    localStorage.setItem('token', data.token)
    const meRes = await axios.get(`${API}/api/user/me`, { headers: { Authorization: `Bearer ${data.token}` } })
    localStorage.setItem('userData', JSON.stringify(meRes.data))
    setState(prev => ({ ...prev, userData: meRes.data, userDetails: meRes.data }))
    return meRes.data
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

  const changePassword = async (currentPassword, newPassword) => {
    await axios.patch(`${API}/api/user/me/password`, { currentPassword, newPassword }, { headers: authHeader() })
  }

  const saveCard = async (cardNumber) => {
    await axios.patch(`${API}/api/user/me/card`, { cardNumber }, { headers: authHeader() })
    setState(prev => ({
      ...prev,
      userDetails: { ...prev.userDetails, cardLast4: cardNumber.slice(-4) },
      userData: { ...prev.userData, cardLast4: cardNumber.slice(-4) },
    }))
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

  const fetchUsers = async () => {
    const { data } = await axios.get(`${API}/api/admin/lista-de-usuarios`, { headers: authHeader() })
    return data.users
  }

  const fetchUserDetail = async (userId) => {
    const { data } = await axios.get(`${API}/api/admin/${userId}`, { headers: authHeader() })
    return data
  }

  const resetUserPassword = async (userId, newPassword) => {
    await axios.patch(`${API}/api/admin/${userId}/password`, { newPassword }, { headers: authHeader() })
  }

  const updateUserAdmin = async (userId, userData) => {
    const { data } = await axios.put(`${API}/api/admin/${userId}`, userData, { headers: authHeader() })
    return data
  }

  const suspendUser = async (userId, note) => {
    const { data } = await axios.patch(`${API}/api/admin/${userId}/suspend`, { note }, { headers: authHeader() })
    return data
  }

  const fetchAllRentals = async () => {
    const { data } = await axios.get(`${API}/api/admin/alquileres`, { headers: authHeader() })
    return data
  }

  const createMovie = async (movieData) => {
    const { data } = await axios.post(`${API}/api/movie/create-a-new-movie`, movieData, { headers: authHeader() })
    return data
  }

  const updateMovie = async (id, movieData) => {
    const { data } = await axios.put(`${API}/api/movie/${id}`, movieData, { headers: authHeader() })
    return data
  }

  const createGenre = async (name, price) => {
    const { data } = await axios.post(`${API}/api/genre`, { name, price }, { headers: authHeader() })
    setState(prev => ({ ...prev, genres: [...prev.genres, data].sort((a, b) => a.name.localeCompare(b.name)) }))
    return data
  }

  const updateGenre = async (id, name, price) => {
    const { data } = await axios.put(`${API}/api/genre/${id}`, { name, price }, { headers: authHeader() })
    setState(prev => ({ ...prev, genres: prev.genres.map(g => g.id === id ? data : g) }))
    return data
  }

  const deleteGenre = async (id) => {
    await axios.delete(`${API}/api/genre/${id}`, { headers: authHeader() })
    setState(prev => ({ ...prev, genres: prev.genres.filter(g => g.id !== id) }))
  }

  const refreshMoviesAdmin = async () => {
    const { data } = await axios.get(`${API}/api/admin/all-movies`, { headers: authHeader() })
    return data.map(adaptMovie)
  }

  const toggleMovie = async (id) => {
    const { data } = await axios.patch(`${API}/api/movie/${id}/toggle`, {}, { headers: authHeader() })
    return data
  }

  const toggleFeaturedMovie = async (id) => {
    await axios.patch(`${API}/api/movie/${id}/toggle-featured`, {}, { headers: authHeader() })
    const { data } = await axios.get(`${API}/api/movie/featured`).catch(() => ({ data: [] }))
    setState(prev => ({ ...prev, featuredMovies: data.map(adaptMovie) }))
  }

  const fetchRentals = async () => {
    const { data } = await axios.get(`${API}/api/product/history`, { headers: authHeader() })
    setState(prev => ({ ...prev, rentals: data }))
  }

  const returnMovie = async (rentalId) => {
    await axios.patch(`${API}/api/product/${rentalId}/return`, {}, { headers: authHeader() })
    await fetchRentals()
  }

  return (
    <myContext.Provider value={{
      state,
      openModal, closeModal,
      rentMovie, removeFromCart, confirmRental,
      register, login, logout,
      fetchUserData, saveUserData, saveCard, changePassword,
      fetchRentals, returnMovie,
      fetchUsers, fetchUserDetail, updateUserAdmin, suspendUser, fetchAllRentals,
      resetUserPassword,
      createMovie, updateMovie, refreshMoviesAdmin, toggleMovie, toggleFeaturedMovie,
      createGenre, updateGenre, deleteGenre
    }}>
      {children}
    </myContext.Provider>
  )
}
