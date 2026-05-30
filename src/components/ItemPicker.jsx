import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { CATEGORIES } from '../i18n/translations'
import './ItemPicker.css'

function ItemPicker({ isOpen, onClose, onSelect, currentTexture }) {
  const { t } = useLang()
  const [allItems, setAllItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && allItems.length === 0) {
      fetch('/textures/items-index.json')
        .then(r => r.json())
        .then(data => {
          setAllItems(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load items index:', err)
          setLoading(false)
        })
    }
  }, [isOpen, allItems.length])

  const filteredItems = useMemo(() => {
    let items = allItems
    if (category !== 'all') {
      items = items.filter(item => item.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(item => item.name.toLowerCase().includes(q))
    }
    return items
  }, [allItems, search, category])

  // Category counts for the tab badges
  const categoryCounts = useMemo(() => {
    const counts = { all: allItems.length }
    allItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [allItems])

  if (!isOpen) return null

  const getTexturePath = (item) => `/textures/${item.folder}/${item.name}.png`

  return (
    <div className="item-picker-overlay" onClick={onClose}>
      <div className="item-picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <h3>📦 {t('choose_item')}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="picker-search">
          <input
            type="text"
            placeholder={'🔍 ' + t('search_items')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <span className="results-count">
            {loading ? t('loading') : t('items_count', filteredItems.length, allItems.length)}
          </span>
        </div>

        {/* Category tabs */}
        <div className="picker-categories">
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat] || 0
            if (cat !== 'all' && count === 0) return null
            return (
              <button
                key={cat}
                className={`cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {t(`cat_${cat}`)}
                <span className="cat-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="picker-grid">
          {loading ? (
            <div className="picker-loading">{t('loading')}</div>
          ) : filteredItems.length === 0 ? (
            <div className="picker-empty">{t('no_items_match', search)}</div>
          ) : (
            filteredItems.slice(0, 300).map(item => (
              <button
                key={`${item.folder}/${item.name}`}
                className={`picker-item ${currentTexture === item.name ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(item.name, item.folder)
                  onClose()
                }}
                title={item.name}
              >
                <img
                  src={getTexturePath(item)}
                  alt={item.name}
                  loading="lazy"
                />
                <span className="item-name">{item.name}</span>
              </button>
            ))
          )}
          {!loading && filteredItems.length > 300 && (
            <div className="picker-info">
              {t('showing_first', 300, filteredItems.length)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemPicker
