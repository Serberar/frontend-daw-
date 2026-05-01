import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { myContext } from '../../components/Context'
import GenrePicker from '../../components/GenrePicker/GenrePicker'
import formatDate from '../../utils/formatDate'
import './Admin.css'

const EMPTY_FORM = { movieTitle: '', desc: '', year: '', posterUrl: '', genreIds: [], director: '', actors: '', runtime: '' }
const EMPTY_GENRE = { name: '', price: '2.00' }

const MovieFormFields = ({ movieForm, genres, onChange, onGenreChange }) => (
  <>
    <div className='movieFormRow'>
      <div className='fieldGroup'>
        <label>Título *</label>
        <input className='adminInput' name='movieTitle' value={movieForm.movieTitle} onChange={onChange} required />
      </div>
      <div className='fieldGroup fieldSmall'>
        <label>Año</label>
        <input className='adminInput' name='year' type='number' value={movieForm.year} onChange={onChange} />
      </div>
      <div className='fieldGroup fieldSmall'>
        <label>Duración (min)</label>
        <input className='adminInput' name='runtime' value={movieForm.runtime} onChange={onChange} />
      </div>
    </div>
    <div className='movieFormRow'>
      <div className='fieldGroup'>
        <label>Director</label>
        <input className='adminInput' name='director' value={movieForm.director} onChange={onChange} />
      </div>
      <div className='fieldGroup'>
        <label>Géneros</label>
        <GenrePicker genres={genres} selected={movieForm.genreIds} onChange={onGenreChange} />
      </div>
    </div>
    <div className='fieldGroup'>
      <label>Actores</label>
      <input className='adminInput' name='actors' value={movieForm.actors} onChange={onChange} />
    </div>
    <div className='fieldGroup'>
      <label>URL del póster</label>
      <input className='adminInput' name='posterUrl' value={movieForm.posterUrl} onChange={onChange} placeholder='https://...' />
    </div>
    <div className='fieldGroup'>
      <label>Descripción *</label>
      <textarea className='adminInput adminTextarea' name='desc' value={movieForm.desc} onChange={onChange} required />
    </div>
  </>
)

const Admin = () => {
  const {
    state,
    fetchUsers, fetchUserDetail, updateUserAdmin, suspendUser,
    fetchAllRentals,
    createMovie, updateMovie, refreshMoviesAdmin, toggleMovie, toggleFeaturedMovie,
    createGenre, updateGenre, deleteGenre,
  } = useContext(myContext)

  const navigate = useNavigate()
  const [tab, setTab] = useState('users')

  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState('')
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [suspendNote, setSuspendNote] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editMsg, setEditMsg] = useState('')

  const [rentals, setRentals] = useState([])
  const [rentalsError, setRentalsError] = useState('')

  const [movies, setMovies] = useState([])
  const [movieForm, setMovieForm] = useState(EMPTY_FORM)
  const [editingMovie, setEditingMovie] = useState(null)
  const [movieMsg, setMovieMsg] = useState('')
  const [movieMsgType, setMovieMsgType] = useState('success')

  const [genreForm, setGenreForm] = useState(EMPTY_GENRE)
  const [editingGenre, setEditingGenre] = useState(null)
  const [genreMsg, setGenreMsg] = useState('')
  const [genreMsgType, setGenreMsgType] = useState('success')

  useEffect(() => {
    if (!state.userData) { navigate('/login'); return }
    if (state.userData.role !== 'ADMIN') { navigate('/'); return }
  }, [state.userData, navigate])

  useEffect(() => {
    if (tab === 'users') loadUsers()
    if (tab === 'rentals') loadRentals()
    if (tab === 'movies') loadMovies()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try { setUsers(await fetchUsers()); setUsersError('') }
    catch { setUsersError('Error al cargar los usuarios.') }
  }
  const loadRentals = async () => {
    try { setRentals(await fetchAllRentals()); setRentalsError('') }
    catch { setRentalsError('Error al cargar los alquileres.') }
  }
  const loadMovies = async () => setMovies(await refreshMoviesAdmin())

  const handleEditUserClick = async (user) => {
    const detail = await fetchUserDetail(user.id)
    setEditTarget(user)
    setEditForm({ firstName: detail.firstName, lastName: detail.lastName, phone: detail.phone, address: detail.address })
    setEditMsg('')
  }
  const handleEditUserSubmit = async (e) => {
    e.preventDefault()
    try {
      const updated = await updateUserAdmin(editTarget.id, editForm)
      setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, firstName: updated.firstName, lastName: updated.lastName } : u))
      setEditMsg('Datos actualizados correctamente.')
      setTimeout(() => { setEditTarget(null); setEditMsg('') }, 1500)
    } catch (err) { setEditMsg(err.response?.data?.error || 'Error al actualizar.') }
  }
  const handleSuspendClick = (user) => {
    if (user.suspended) handleSuspendConfirm(user, '')
    else { setSuspendTarget(user); setSuspendNote('') }
  }
  const handleSuspendConfirm = async (user, note) => {
    try {
      const updated = await suspendUser(user?.id ?? suspendTarget.id, note ?? suspendNote)
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, suspended: updated.suspended, suspensionNote: updated.suspensionNote } : u))
    } catch (err) { alert(err.response?.data?.error || 'Error al suspender.') }
    finally { setSuspendTarget(null); setSuspendNote('') }
  }

  const handleMovieChange = (e) => {
    const { name, value } = e.target
    setMovieForm(prev => ({ ...prev, [name]: value }))
  }
  const handleMovieSubmit = async (e) => {
    e.preventDefault()
    setMovieMsg('')
    try {
      const payload = {
        movieTitle: movieForm.movieTitle,
        desc: movieForm.desc,
        year: movieForm.year ? parseInt(movieForm.year, 10) : null,
        posterUrl: movieForm.posterUrl || null,
        genreIds: movieForm.genreIds,
        director: movieForm.director || null,
        actors: movieForm.actors || null,
        runtime: movieForm.runtime || null,
      }
      if (editingMovie) {
        await updateMovie(editingMovie.id, payload)
        setMovieMsgType('success'); setMovieMsg('Película actualizada correctamente.')
      } else {
        await createMovie(payload)
        setMovieMsgType('success'); setMovieMsg('Película creada correctamente.')
      }
      setMovieForm(EMPTY_FORM)
      setEditingMovie(null)
      setMovies(await refreshMoviesAdmin())
    } catch (err) {
      setMovieMsgType('error')
      setMovieMsg(err.response?.data?.error || 'Error al guardar la película.')
    }
  }
  const handleEditMovie = (movie) => {
    setEditingMovie(movie)
    setMovieForm({
      movieTitle: movie.title || '',
      desc: movie.plot || '',
      year: movie.year || '',
      posterUrl: movie.posterUrl || '',
      genreIds: Array.isArray(movie.genres) ? movie.genres.map(g => g.id) : [],
      director: movie.director || '',
      actors: movie.actors || '',
      runtime: movie.runtime || '',
    })
    setMovieMsg('')
  }
  const handleCancelEditMovie = () => {
    setEditingMovie(null); setMovieForm(EMPTY_FORM); setMovieMsg('')
  }
  const handleToggleActive = async () => {
    await toggleMovie(editingMovie.id)
    const newActive = !editingMovie.active
    setMovies(prev => prev.map(m => m.id === editingMovie.id ? { ...m, active: newActive } : m))
    setEditingMovie(prev => ({ ...prev, active: newActive }))
  }
  const handleToggleFeatured = async () => {
    await toggleFeaturedMovie(editingMovie.id)
    const newFeatured = !editingMovie.featured
    setMovies(prev => prev.map(m => m.id === editingMovie.id ? { ...m, featured: newFeatured } : m))
    setEditingMovie(prev => ({ ...prev, featured: newFeatured }))
  }

  const formFieldProps = {
    movieForm,
    genres: state.genres,
    onChange: handleMovieChange,
    onGenreChange: (val) => setMovieForm(prev => ({ ...prev, genreIds: val }))
  }

  return (
    <div className='adminContainer'>
      <h1 className='adminTitle'>Panel de administración</h1>

      <div className='adminTabs'>
        <button className={`adminTab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Usuarios</button>
        <button className={`adminTab ${tab === 'movies' ? 'active' : ''}`} onClick={() => setTab('movies')}>Películas</button>
        <button className={`adminTab ${tab === 'genres' ? 'active' : ''}`} onClick={() => setTab('genres')}>Géneros</button>
        <button className={`adminTab ${tab === 'rentals' ? 'active' : ''}`} onClick={() => setTab('rentals')}>Alquileres activos</button>
      </div>

      {tab === 'users' && (
        <div className='adminSection'>
          {usersError && <p className='adminError'>{usersError}</p>}

          <div className='adminCardList'>
            {users.map(u => (
              <div key={u.id} className={`adminCard ${u.suspended ? 'adminCardInactive' : ''}`}>
                <div className={`adminCardAvatar ${u.role === 'ADMIN' ? 'adminRole' : ''} ${u.suspended ? 'suspended' : ''}`}>
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div className='adminCardBody'>
                  <div className='adminCardHeader'>
                    <h3 className='adminCardTitle'>{u.firstName} {u.lastName}</h3>
                    <div className='adminCardBadges'>
                      <span className={`roleBadge ${u.role}`}>{u.role}</span>
                      <span className={`activeBadge ${u.suspended ? 'off' : 'on'}`}>
                        {u.suspended ? 'Suspendido' : 'Activo'}
                      </span>
                    </div>
                  </div>
                  <p className='adminCardMeta'>{u.email}</p>
                  <p className='adminCardMeta'>Registro: {formatDate(u.createdAt)}</p>
                  {u.suspensionNote && <p className='adminCardNote'>Nota: {u.suspensionNote}</p>}
                </div>
                <div className='adminCardActions'>
                  {u.role !== 'ADMIN' && (
                    <button className='editBtn' onClick={() => handleEditUserClick(u)}>Editar</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editTarget && (
            <div className='modalOverlay' onClick={() => setEditTarget(null)}>
              <div className='suspendModal' onClick={e => e.stopPropagation()}>
                <h3>Editar usuario</h3>
                <p><strong>{editTarget.email}</strong></p>
                <form onSubmit={handleEditUserSubmit}>
                  <div className='movieFormRow' style={{ marginTop: '0.8rem' }}>
                    <div className='fieldGroup'>
                      <label>Nombre</label>
                      <input className='adminInput' value={editForm.firstName || ''} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} required />
                    </div>
                    <div className='fieldGroup'>
                      <label>Apellido</label>
                      <input className='adminInput' value={editForm.lastName || ''} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} required />
                    </div>
                  </div>
                  <div className='movieFormRow'>
                    <div className='fieldGroup'>
                      <label>Teléfono</label>
                      <input className='adminInput' value={editForm.phone || ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className='fieldGroup'>
                      <label>Dirección</label>
                      <input className='adminInput' value={editForm.address || ''} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
                    </div>
                  </div>
                  {editMsg && <p className={`movieMsg ${editMsg.startsWith('Datos') ? 'success' : 'error'}`}>{editMsg}</p>}
                  <div className='movieFormActions'>
                    <button type='button' className={`toggleBtn ${editTarget.suspended ? 'activate' : 'deactivate'}`} style={{ marginRight: 'auto' }} onClick={() => handleSuspendClick(editTarget)}>
                      {editTarget.suspended ? 'Reactivar cuenta' : 'Suspender cuenta'}
                    </button>
                    <button type='button' className='cancelBtn' onClick={() => setEditTarget(null)}>Cancelar</button>
                    <button type='submit' className='submitBtn'>Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {suspendTarget && (
            <div className='modalOverlay' onClick={() => setSuspendTarget(null)}>
              <div className='suspendModal' onClick={e => e.stopPropagation()}>
                <h3>Suspender usuario</h3>
                <p><strong>{suspendTarget.firstName} {suspendTarget.lastName}</strong> — {suspendTarget.email}</p>
                <label className='suspendLabel'>Motivo de la suspensión</label>
                <textarea className='adminInput adminTextarea' placeholder='Ej: No ha devuelto la película en el plazo acordado.' value={suspendNote} onChange={e => setSuspendNote(e.target.value)} />
                <div className='movieFormActions'>
                  <button className='cancelBtn' onClick={() => setSuspendTarget(null)}>Cancelar</button>
                  <button className='deleteBtn' onClick={() => handleSuspendConfirm(suspendTarget, suspendNote)}>Confirmar suspensión</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'movies' && (
        <div className='adminSection'>
          <form className='movieForm' onSubmit={handleMovieSubmit}>
            <h2>Nueva película</h2>
            <MovieFormFields {...formFieldProps} />
            {movieMsg && !editingMovie && <p className={`movieMsg ${movieMsgType}`}>{movieMsg}</p>}
            <div className='movieFormActions'>
              <button type='submit' className='submitBtn'>Crear película</button>
            </div>
          </form>

          {editingMovie && (
            <div className='modalOverlay' onClick={handleCancelEditMovie}>
              <div className='editMovieModal' onClick={e => e.stopPropagation()}>
                <button className='modalCloseBtn' onClick={handleCancelEditMovie}>✕</button>
                <h2 className='editMovieTitle'>Editar: {editingMovie.title}</h2>
                <form onSubmit={handleMovieSubmit}>
                  <MovieFormFields {...formFieldProps} />
                  {movieMsg && <p className={`movieMsg ${movieMsgType}`}>{movieMsg}</p>}
                  <div className='editModalActions'>
                    <div className='editModalStatusBtns'>
                      <button type='button' className={`toggleBtn ${editingMovie.active ? 'deactivate' : 'activate'}`} onClick={handleToggleActive}>
                        {editingMovie.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button type='button' className={`featuredBtn ${editingMovie.featured ? 'featuredOn' : ''}`} onClick={handleToggleFeatured}>
                        {editingMovie.featured ? '★ Quitar de portada' : '☆ Poner en portada'}
                      </button>
                    </div>
                    <div className='editModalMainBtns'>
                      <button type='button' className='cancelBtn' onClick={handleCancelEditMovie}>Cancelar</button>
                      <button type='submit' className='submitBtn'>Guardar cambios</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className='adminCardList'>
            {movies.map(m => (
              <div key={m.id} className={`adminCard ${!m.active ? 'adminCardInactive' : ''}`}>
                <div style={{ width: 72, height: 108, flexShrink: 0, overflow: 'hidden', borderRadius: 6 }}>
                  <img src={m.posterUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div className='adminCardBody'>
                  <div className='adminCardHeader'>
                    <h3 className='adminCardTitle'>{m.title}</h3>
                    <div className='adminCardBadges'>
                      <span className={`activeBadge ${m.active ? 'on' : 'off'}`}>{m.active ? 'Activa' : 'Inactiva'}</span>
                      {m.featured && <span className='featuredBadge on'>★ En portada</span>}
                    </div>
                  </div>
                  <p className='adminCardMeta'>{[m.year, m.runtime && `${m.runtime} min`, m.director].filter(Boolean).join(' · ')}</p>
                  {m.plot && <p className='adminCardDesc'>{m.plot}</p>}
                  {m.actors && <p className='adminCardMeta'><strong>Reparto:</strong> {m.actors}</p>}
                  {m.genres?.length > 0 && (
                    <div className='adminCardGenres'>
                      {m.genres.map(g => <span key={g.id} className='genreBadge'>{g.name}</span>)}
                    </div>
                  )}
                </div>
                <div className='adminCardActions'>
                  <button className='editBtn' onClick={() => handleEditMovie(m)}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'genres' && (
        <div className='adminSection'>
          <form className='movieForm' onSubmit={async (e) => {
            e.preventDefault(); setGenreMsg('')
            try {
              if (editingGenre) {
                await updateGenre(editingGenre.id, genreForm.name, parseFloat(genreForm.price))
                setGenreMsgType('success'); setGenreMsg('Género actualizado.')
              } else {
                await createGenre(genreForm.name, parseFloat(genreForm.price))
                setGenreMsgType('success'); setGenreMsg('Género creado.')
              }
              setGenreForm(EMPTY_GENRE); setEditingGenre(null)
            } catch (err) {
              setGenreMsgType('error')
              setGenreMsg(err.response?.data?.error || 'Error al guardar.')
            }
          }}>
            <h2>{editingGenre ? 'Editar género' : 'Nuevo género'}</h2>
            <div className='movieFormRow'>
              <div className='fieldGroup'>
                <label>Nombre</label>
                <input className='adminInput' value={genreForm.name} onChange={e => setGenreForm(p => ({ ...p, name: e.target.value }))} placeholder='Ej: Ciencia Ficción' required />
              </div>
              <div className='fieldGroup fieldSmall'>
                <label>Precio/día (€)</label>
                <input className='adminInput' type='number' min='0' step='0.50' value={genreForm.price} onChange={e => setGenreForm(p => ({ ...p, price: e.target.value }))} required />
              </div>
            </div>
            {genreMsg && <p className={`movieMsg ${genreMsgType}`}>{genreMsg}</p>}
            <div className='movieFormActions'>
              {editingGenre && (
                <button type='button' className='cancelBtn' onClick={() => { setEditingGenre(null); setGenreForm(EMPTY_GENRE); setGenreMsg('') }}>Cancelar</button>
              )}
              <button type='submit' className='submitBtn'>{editingGenre ? 'Guardar' : 'Crear género'}</button>
            </div>
          </form>

          <div className='adminCardList'>
            {state.genres.map(g => (
              <div key={g.id} className='adminCard'>
                <div className='adminCardBody'>
                  <h3 className='adminCardTitle'>{g.name}</h3>
                </div>
                <span className='adminCardPrice'>{g.price?.toFixed(2)} €/día</span>
                <div className='adminCardActions row'>
                  <button className='editBtn' onClick={() => { setEditingGenre(g); setGenreForm({ name: g.name, price: g.price?.toFixed(2) ?? '2.00' }); setGenreMsg('') }}>Editar</button>
                  <button className='deleteBtn' onClick={async () => {
                    if (!window.confirm(`¿Eliminar el género "${g.name}"?`)) return
                    try { await deleteGenre(g.id) }
                    catch (err) { alert(err.response?.data?.error || 'Error al eliminar.') }
                  }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'rentals' && (
        <div className='adminSection'>
          {rentalsError && <p className='adminError'>{rentalsError}</p>}
          {rentals.length === 0 && !rentalsError && (
            <p className='emptyMsg'>No hay alquileres activos en este momento.</p>
          )}
          <div className='adminCardList'>
            {rentals.map(r => (
              <div key={r.id} className='adminCard'>
                <div className='adminCardBody'>
                  <h3 className='adminCardTitle'>{r.movieTitle}</h3>
                  <p className='adminCardMeta'>{r.dias} día{r.dias !== 1 ? 's' : ''} · Alquilada el {formatDate(r.rentedAt)}</p>
                  <p className='adminCardNote'>Usuario: {r.userId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
