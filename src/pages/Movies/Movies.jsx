import { useContext, useState, useMemo } from 'react'
import { myContext } from '../../components/Context'
import './Movies.css'

const GENRE_ES = {
  Action: 'Acción',
  Adventure: 'Aventura',
  Animation: 'Animación',
  Biography: 'Biografía',
  Comedy: 'Comedia',
  Crime: 'Crimen',
  Drama: 'Drama',
  Family: 'Familia',
  Fantasy: 'Fantasía',
  'Film-Noir': 'Cine Negro',
  History: 'Historia',
  Horror: 'Terror',
  Music: 'Música',
  Musical: 'Musical',
  Mystery: 'Misterio',
  Romance: 'Romance',
  'Sci-Fi': 'Ciencia Ficción',
  Thriller: 'Suspense',
  War: 'Guerra',
  Western: 'Western',
}

const Modal = ({ movie, onClose, onRent }) => {
  const [days, setDays] = useState(1)

  return (
    <div className='modalOverlay' onClick={onClose}>
      <div className='modalContent' onClick={e => e.stopPropagation()}>
        <button className='modalClose' onClick={onClose}>✕</button>
        <div className='modalBody'>
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className='modalImage'
            onError={e => { e.target.src = 'https://via.placeholder.com/150x225.png?text=Sin+imagen' }}
          />
          <div className='modalInfo'>
            <h2>{movie.title}</h2>
            <p className='modalMeta'>
              {movie.year} · {movie.runtime} min · {movie.director}
            </p>
            <p className='modalGenres'>
              {movie.genres.map(g => GENRE_ES[g] || g).join(', ')}
            </p>
            <p className='modalPlot'>{movie.plot}</p>
            <p className='modalActors'><strong>Reparto:</strong> {movie.actors}</p>

            <div className='rentSection'>
              <label>Días de alquiler:</label>
              <div className='daysControl'>
                <button className='daysBtn' onClick={() => setDays(d => Math.max(1, d - 1))}>−</button>
                <span className='daysValue'>{days}</span>
                <button className='daysBtn' onClick={() => setDays(d => Math.min(7, d + 1))}>+</button>
              </div>
              <p className='price'>Total: {days * 2}€ <span>(2€/día)</span></p>
              <button className='rentBtn' onClick={() => onRent(movie, days)}>
                Alquilar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Movies = () => {
  const { state, openModal, closeModal, rentMovie } = useContext(myContext)
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [genresOpen, setGenresOpen] = useState(true)
  const [yearOpen, setYearOpen] = useState(true)

  const genres = useMemo(() => {
    const set = new Set()
    state.movies.forEach(m => m.genres.forEach(g => set.add(g)))
    return [...set].sort((a, b) => (GENRE_ES[a] || a).localeCompare(GENRE_ES[b] || b))
  }, [state.movies])

  const years = useMemo(() => {
    const set = new Set(state.movies.map(m => m.year))
    return [...set].sort()
  }, [state.movies])

  const filteredMovies = useMemo(() => {
    return state.movies.filter(movie => {
      const matchesGenre = !selectedGenre || movie.genres.includes(selectedGenre)
      const matchesSearch = !search || movie.title.toLowerCase().includes(search.toLowerCase())
      const year = parseInt(movie.year)
      const matchesFrom = !yearFrom || year >= parseInt(yearFrom)
      const matchesTo = !yearTo || year <= parseInt(yearTo)
      return matchesGenre && matchesSearch && matchesFrom && matchesTo
    })
  }, [state.movies, search, selectedGenre, yearFrom, yearTo])

  return (
    <div className='moviesPage'>
      <h1 className='moviesTitle'>Catálogo de películas</h1>

      <div className='catalogueLayout'>
        <aside className='genreSidebar'>

          {/* ── Año ── */}
          <div className='sidebarSection'>
            <button className='sidebarSectionHeader' onClick={() => setYearOpen(o => !o)}>
              <span className='sidebarLabel'>Año</span>
              <span className={`sidebarArrow ${yearOpen ? 'open' : ''}`}>▾</span>
            </button>
            <div className={`sidebarCollapsible ${yearOpen ? 'open' : ''}`}>
              <div className='yearFilter'>
                <div className='yearRow'>
                  <label className='yearLabel'>Desde</label>
                  <select
                    className='yearSelect'
                    value={yearFrom}
                    onChange={e => setYearFrom(e.target.value)}
                  >
                    <option value=''>—</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className='yearRow'>
                  <label className='yearLabel'>Hasta</label>
                  <select
                    className='yearSelect'
                    value={yearTo}
                    onChange={e => setYearTo(e.target.value)}
                  >
                    <option value=''>—</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {(yearFrom || yearTo) && (
                  <button className='yearReset' onClick={() => { setYearFrom(''); setYearTo('') }}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className='sidebarDivider' />

          {/* ── Géneros ── */}
          <div className='sidebarSection'>
            <button className='sidebarSectionHeader' onClick={() => setGenresOpen(o => !o)}>
              <span className='sidebarLabel'>Géneros</span>
              <span className={`sidebarArrow ${genresOpen ? 'open' : ''}`}>▾</span>
            </button>
            <div className={`sidebarCollapsible genresCollapsible ${genresOpen ? 'open' : ''}`}>
              <ul className='genreList'>
                <li
                  className={`genreItem ${!selectedGenre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(null)}
                >
                  <span className='genreDot' />
                  Todos
                </li>
                {genres.map(genre => (
                  <li
                    key={genre}
                    className={`genreItem ${selectedGenre === genre ? 'active' : ''}`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    <span className='genreDot' />
                    {GENRE_ES[genre] || genre}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </aside>

        <div className='catalogueMain'>
          <div className='searchBar'>
            <span className='searchIcon'>🔍</span>
            <input
              type='text'
              className='searchInput'
              placeholder='Buscar película...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className='searchClear' onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {filteredMovies.length === 0 ? (
            <p className='noResults'>No se encontraron películas.</p>
          ) : (
            <div className='moviesGrid'>
              {filteredMovies.map(movie => (
                <div
                  key={movie.id}
                  className='movieCard'
                  onClick={() => openModal(movie)}
                >
                  <div className='movieImageWrapper'>
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className='movieImage'
                      onError={e => { e.target.src = 'https://via.placeholder.com/150x225.png?text=Sin+imagen' }}
                    />
                    <div className='movieOverlay'>
                      <span>Ver detalles</span>
                    </div>
                  </div>
                  <p className='movieTitle'>{movie.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {state.modalOpen && state.selectedMovie && (
        <Modal
          movie={state.selectedMovie}
          onClose={closeModal}
          onRent={rentMovie}
        />
      )}
    </div>
  )
}

export default Movies
