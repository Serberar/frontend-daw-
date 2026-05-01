export const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

const CardPreview = ({ cardNumber, cardHolder, expiry }) => {
  const displayNumber = (cardNumber || '').replace(/\s/g, '').padEnd(16, '•')
  const groups = [
    displayNumber.slice(0, 4),
    displayNumber.slice(4, 8),
    displayNumber.slice(8, 12),
    displayNumber.slice(12, 16),
  ]
  return (
    <div className='cardPreview'>
      <div className='cardTop'>
        <div className='cardChip' />
        <span className='cardBrand'>VISA</span>
      </div>
      <div className='cardNumberDisplay'>
        {groups.map((g, i) => <span key={i}>{g}</span>)}
      </div>
      <div className='cardBottom'>
        <div className='cardHolderSection'>
          <span className='cardLabel'>Titular</span>
          <span className='cardValue'>{cardHolder || 'NOMBRE COMPLETO'}</span>
        </div>
        {expiry && (
          <div className='cardExpirySection'>
            <span className='cardLabel'>Caduca</span>
            <span className='cardValue'>{expiry}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardPreview
