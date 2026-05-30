import { useLang } from '../i18n/LanguageContext'
import './InterfaceList.css'

function InterfaceList({ interfaces, selectedId, onSelect, onAdd, onDelete }) {
  const { t } = useLang()

  return (
    <div className="interface-list">
      <div className="list-header">
        <h2>{t('interfaces')}</h2>
      </div>

      <div className="list-items">
        {interfaces.length === 0 && (
          <div className="list-empty">{t('no_interfaces')}</div>
        )}
        {interfaces.map(iface => (
          <div
            key={iface.id}
            className={`list-item ${iface.id === selectedId ? 'active' : ''}`}
            onClick={() => onSelect(iface.id)}
          >
            <div className="item-info">
              <div className="item-name">{iface.name}</div>
              <div className="item-meta">{iface.rows} {t('rows_count')}</div>
            </div>
            <button
              className="item-delete"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`${t('delete')} "${iface.name}"?`)) {
                  onDelete(iface.id)
                }
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={onAdd}>
        {t('add_interface')}
      </button>
    </div>
  )
}

export default InterfaceList
