import axios from 'axios'

const API = process.env.REACT_APP_BACK_URL

export const adaptMovie = (m) => ({
  id:        m.id,
  title:     m.movieTitle,
  plot:      m.desc,
  year:      m.year ? String(m.year) : '',
  posterUrl: m.posterUrl ?? '',
  genres:    m.genres ?? [],   // [{id, name}]
  director:  m.director ?? '',
  actors:    m.actors ?? '',
  runtime:   m.runtime ?? '',
  active:    m.active ?? true,
  featured:  m.featured ?? false,
})

export const fetchMovies = async () => {
  const { data } = await axios.get(`${API}/api/movie/all-movies`)
  return (data.movieList ?? []).map(adaptMovie)
}
