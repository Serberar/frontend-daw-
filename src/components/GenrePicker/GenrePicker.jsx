import { useState, useRef, useEffect } from 'react'
import './GenrePicker.css'

const GenrePicker = ({ genres = [], selected = [], onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isSelected = (id) => selected.includes(id)

  const toggle = (id) => {
    onChange(isSelected(id) ? selected.filter(g => g !== id) : [...selected, id])
  }

  const selectedGenres = genres.filter(g => selected.includes(g.id))

  return (
    <div className='genrePicker' ref={ref}>
      <button type='button' className='genrePickerTrigger' onClick={() => setOpen(o => !o)}>
        {selectedGenres.length === 0
          ? <span className='genrePlaceholder'>Seleccionar géneros…</span>
          : <span className='genreTags'>{selectedGenres.map(g => <span key={g.id} className='genreTag'>{g.name}</span>)}</span>
        }
        <span className='genreArrow'>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className='genreDropdown'>
          {genres.map(genre => (
            <label key={genre.id} className='genreOption'>
              <input type='checkbox' checked={isSelected(genre.id)} onChange={() => toggle(genre.id)} />
              {genre.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default GenrePicker
