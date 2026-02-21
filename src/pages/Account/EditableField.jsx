
const EditableField = ({ label, name, type = 'text', value, isEditing, onChange, onSave, onCancel, onEdit }) => (
  <div className='editableField'>
    <label>{label}:</label>
    {isEditing
      ? (
        <>
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
          />
          <button className='saveBtn' onClick={onSave}>Guardar</button>
          <button className='cancelBtn' onClick={onCancel}>Cancelar</button>
        </>
        )
      : (
        <>
          <span>{value || 'No disponible'}</span>
          <button className='editBtn' onClick={() => onEdit(name)}>Editar</button>
        </>
        )}
  </div>
)

export default EditableField
