import { useContext, useState, useMemo, useRef, useEffect } from 'react'
import { myContext } from '../../components/Context'
import './Movies.css'

const getPrice = (movie) => {
  if (!movie.genres?.length) return 2
  return Math.max(...movie.genres.map(g => g.price ?? 2))
}

const MovieCard = ({ movie, onClick }) => (
  <div className='movieCard' onClick={onClick}>
    <div className='movieImageWrapper'>
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className='movieImage'
      />
      <div className='movieOverlay'><span>Ver detalles</span></div>
    </div>
    <p className='movieTitle'>{movie.title}</p>
  </div>
)

/* ── Horizontal row with scroll arrows ── */
const GenreRow = ({ genre, movies, openModal }) => {
  const scrollRef = useRef(null)
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 640, behavior: 'smooth' })

  return (
    <section className='genreRow'>
      <h2 className='genreRowTitle'>{genre.name}</h2>
      <div className='genreRowWrapper'>
        <button className='scrollArrow scrollArrowLeft' onClick={() => scroll(-1)}>‹</button>
        <div className='genreRowScroll' ref={scrollRef}>
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onClick={() => openModal(movie)} />
          ))}
        </div>
        <button className='scrollArrow scrollArrowRight' onClick={() => scroll(1)}>›</button>
      </div>
    </section>
  )
}

const Modal = ({ movie, onClose, onRent }) => {
  const [days, setDays] = useState(1)
  const pricePerDay = getPrice(movie)

  return (
    <div className='modalOverlay' onClick={onClose}>
      <div className='modalContent' onClick={e => e.stopPropagation()}>
        <button className='modalClose' onClick={onClose}>✕</button>
        <div className='modalBody'>
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className='modalImage'
          />
          <div className='modalInfo'>
            <h2>{movie.title}</h2>
            <p className='modalMeta'>{movie.year} · {movie.runtime} min · {movie.director}</p>
            <p className='modalGenres'>{movie.genres.map(g => g.name).join(', ')}</p>
            <p className='modalPlot'>{movie.plot}</p>
            <p className='modalActors'><strong>Reparto:</strong> {movie.actors}</p>
            <div className='rentSection'>
              <label>Días de alquiler:</label>
              <div className='daysControl'>
                <button className='daysBtn' onClick={() => setDays(d => Math.max(1, d - 1))}>−</button>
                <span className='daysValue'>{days}</span>
                <button className='daysBtn' onClick={() => setDays(d => Math.min(7, d + 1))}>+</button>
              </div>
              <p className='price'>Total: {(days * pricePerDay).toFixed(2)}€ <span>({pricePerDay.toFixed(2)}€/día)</span></p>
              <button className='rentBtn' onClick={() => onRent(movie, days, pricePerDay)}>Alquilar</button>
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
  const [selectedGenreId, setSelectedGenreId] = useState(null)
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [heroIndex, setHeroIndex]         = useState(0)
  const [heroPaused, setHeroPaused]       = useState(false)

  const featuredMovies = state.featuredMovies
  const currentFeatured = featuredMovies.length > 0
    ? featuredMovies[heroIndex % featuredMovies.length]
    : null

  useEffect(() => {
    if (featuredMovies.length <= 1 || heroPaused) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % featuredMovies.length), 5500)
    return () => clearInterval(t)
  }, [featuredMovies.length, heroPaused])

  const years = useMemo(() => {
    const set = new Set(state.movies.map(m => m.year).filter(Boolean))
    return [...set].sort()
  }, [state.movies])

  const filteredMovies = useMemo(() => {
    return state.movies.filter(movie => {
      const matchesGenre  = !selectedGenreId || movie.genres.some(g => g.id === selectedGenreId)
      const matchesSearch = !search || movie.title.toLowerCase().includes(search.toLowerCase())
      const year          = parseInt(movie.year)
      const matchesFrom   = !yearFrom || year >= parseInt(yearFrom)
      const matchesTo     = !yearTo   || year <= parseInt(yearTo)
      return matchesGenre && matchesSearch && matchesFrom && matchesTo
    })
  }, [state.movies, search, selectedGenreId, yearFrom, yearTo])

  const moviesByGenre = useMemo(() => {
    return state.genres
      .map(genre => ({
        genre,
        movies: state.movies.filter(m => m.genres.some(g => g.id === genre.id))
      }))
      .filter(row => row.movies.length > 0)
  }, [state.movies, state.genres])

  const isFiltering = search || selectedGenreId || yearFrom || yearTo

  return (
    <div className='moviesPage'>

      {currentFeatured && !isFiltering && (
        <section
          className='hero'
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className='heroBg' style={{ backgroundImage: `url(${currentFeatured.posterUrl})` }} />
          <div className='heroGradient' />
          <div className='heroContent'>
            <div className='heroText' key={currentFeatured.id}>
              {currentFeatured.genres?.[0] && (
                <span className='heroEyebrow'>{currentFeatured.genres[0].name}</span>
              )}
              <h1 className='heroTitle'>{currentFeatured.title}</h1>
              {currentFeatured.plot && <p className='heroPlot'>{currentFeatured.plot}</p>}
              <div className='heroMeta'>
                {currentFeatured.year     && <span>{currentFeatured.year}</span>}
                {currentFeatured.runtime  && <span>{currentFeatured.runtime} min</span>}
                {currentFeatured.director && <span>{currentFeatured.director}</span>}
              </div>
              <button className='heroBtn' onClick={() => openModal(currentFeatured)}>
                ▶&nbsp; Ver detalles
              </button>
            </div>
            <img
              className='heroPoster'
              src={currentFeatured.posterUrl}
              alt={currentFeatured.title}
            />
          </div>

          {featuredMovies.length > 1 && (
            <div className='heroDots'>
              {featuredMovies.map((_, i) => (
                <button
                  key={i}
                  className={`heroDot ${i === heroIndex ? 'heroDotActive' : ''}`}
                  onClick={() => setHeroIndex(i)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className='controls'>
        <div className='controlsTop'>
          <div className='searchBar'>
            <span className='searchIcon'>🔍</span>
            <input
              type='text'
              className='searchInput'
              placeholder='Buscar película...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className='searchClear' onClick={() => setSearch('')}>✕</button>}
          </div>
          <select className='yearPill' value={yearFrom} onChange={e => setYearFrom(e.target.value)}>
            <option value=''>Desde</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className='yearPill' value={yearTo} onChange={e => setYearTo(e.target.value)}>
            <option value=''>Hasta</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(yearFrom || yearTo) && (
            <button className='clearFiltersBtn' onClick={() => { setYearFrom(''); setYearTo('') }}>✕</button>
          )}
        </div>

        <div className='genreChips'>
          <button
            className={`chip ${!selectedGenreId ? 'active' : ''}`}
            onClick={() => setSelectedGenreId(null)}
          >Todos</button>
          {state.genres.map(genre => (
            <button
              key={genre.id}
              className={`chip ${selectedGenreId === genre.id ? 'active' : ''}`}
              onClick={() => setSelectedGenreId(genre.id)}
            >{genre.name}</button>
          ))}
        </div>
      </div>

      {isFiltering ? (
        filteredMovies.length === 0
          ? <p className='noResults'>No se encontraron películas.</p>
          : (
            <div className='moviesGrid'>
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={() => openModal(movie)} />
              ))}
            </div>
          )
      ) : (
        <div className='genreRows'>
          {moviesByGenre.map(({ genre, movies }) => (
            <GenreRow
              key={genre.id}
              genre={genre}
              movies={movies}
              openModal={openModal}
            />
          ))}
        </div>
      )}

      {state.modalOpen && state.selectedMovie && (
        <Modal movie={state.selectedMovie} onClose={closeModal} onRent={rentMovie} />
      )}
    </div>
  )
}

export default Movies
