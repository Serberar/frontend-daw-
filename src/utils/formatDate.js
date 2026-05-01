const formatDate = (iso, fallback = '—') =>
  iso ? new Date(iso).toLocaleDateString('es-ES') : fallback

export default formatDate
