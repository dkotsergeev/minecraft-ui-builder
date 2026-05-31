import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { loadHeadsCatalog, headImageUrl } from '../utils/headsCatalog'
import './HeadsPicker.css'

const MAX_VISIBLE = 300 // cap to keep the picker responsive

// Heads picker backed by a 92k-entry catalog scraped from minecraft-heads.com.
//
// On first open we lazy-fetch the catalog (~9 MB, ~4 MB gzipped from CDN) and
// keep it cached. Searches run in-memory across name + category tag.
// Each catalog entry has { n: name, h: texture-hash, t: category }.
function HeadsPicker({ isOpen, onClose, onSelect }) {
  const { t, lang } = useLang()
  const [catalog, setCatalog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [username, setUsername] = useState('')

  // Lazy-load the catalog the first time the picker opens
  useEffect(() => {
    if (!isOpen || catalog) return
    setLoading(true)
    setError(null)
    loadHeadsCatalog()
      .then(setCatalog)
      .catch(err => setError(err.message || String(err)))
      .finally(() => setLoading(false))
  }, [isOpen, catalog])

  // Filter heads by search query. Matches across name and category tag.
  const filtered = useMemo(() => {
    if (!catalog) return []
    if (!search.trim()) {
      // Without a query, return a small slice so the picker isn't a wall of
      // 92k images. Encourage users to type something.
      return catalog.slice(0, MAX_VISIBLE)
    }
    const q = search.toLowerCase().trim()
    const out = []
    for (const h of catalog) {
      if (h.n.toLowerCase().includes(q) || (h.t || '').includes(q)) {
        out.push(h)
        if (out.length >= MAX_VISIBLE) break
      }
    }
    return out
  }, [catalog, search])

  const totalMatching = useMemo(() => {
    if (!catalog) return 0
    if (!search.trim()) return catalog.length
    const q = search.toLowerCase().trim()
    let n = 0
    for (const h of catalog) {
      if (h.n.toLowerCase().includes(q) || (h.t || '').includes(q)) n++
    }
    return n
  }, [catalog, search])

  if (!isOpen) return null

  const applyUsername = () => {
    const name = username.trim()
    if (!name) return
    // Minecraft usernames are alphanumeric + underscore, max 16 chars
    if (!/^[a-zA-Z0-9_]{1,16}$/.test(name)) {
      alert(lang === 'ru'
        ? 'Никнейм может содержать только буквы, цифры и _ (до 16 символов).'
        : 'Username may only contain letters, digits and _ (up to 16 chars).')
      return
    }
    onSelect(`https://mc-heads.net/head/${name}/64`)
    setUsername('')
    onClose()
  }

  return (
    <div className="item-picker-overlay" onClick={onClose}>
      <div className="item-picker heads-picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <h3>🗿 {t('browse_heads')}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="picker-search">
          <input
            type="text"
            placeholder={'🔍 ' + (lang === 'ru'
              ? 'Поиск: city, town, knight, dragon, food, alphabet…'
              : 'Search: city, town, knight, dragon, food, alphabet…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            disabled={loading || !catalog}
          />
          <span className="results-count">
            {loading
              ? (lang === 'ru' ? 'Загрузка…' : 'Loading…')
              : catalog
                ? `${Math.min(filtered.length, totalMatching)} / ${totalMatching.toLocaleString()} ${lang === 'ru' ? 'из ' + catalog.length.toLocaleString() : 'of ' + catalog.length.toLocaleString()}`
                : ''}
          </span>
        </div>

        <div className="heads-catalog-link">
          <a
            href="https://minecraft-heads.com/custom-heads"
            target="_blank"
            rel="noopener noreferrer"
          >
            🌐 {lang === 'ru'
              ? 'Открыть minecraft-heads.com (для просмотра в браузере)'
              : 'Open minecraft-heads.com (for browsing in the browser)'}
          </a>
          <small>
            {lang === 'ru'
              ? 'Поиск работает локально по 90 000+ голов. Просто введите запрос выше.'
              : 'Search runs locally across 90,000+ heads. Just type a query above.'}
          </small>
        </div>

        <div className="picker-grid heads-grid">
          {loading && (
            <div className="picker-loading">
              {lang === 'ru'
                ? 'Загрузка каталога (≈4 МБ, один раз)…'
                : 'Loading catalog (≈4 MB, one time)…'}
            </div>
          )}
          {error && (
            <div className="picker-empty">
              {lang === 'ru' ? 'Ошибка загрузки: ' : 'Failed to load: '}{error}
            </div>
          )}
          {!loading && catalog && filtered.length === 0 && (
            <div className="picker-empty">
              {lang === 'ru'
                ? `Не найдено по запросу «${search}». Попробуйте другой запрос или вставьте URL.`
                : `No matches for "${search}". Try another query or paste a URL.`}
            </div>
          )}
          {!loading && filtered.map((head, i) => {
            const url = headImageUrl(head.h, 64)
            return (
              <button
                key={head.h}
                className="picker-item"
                onClick={() => { onSelect(url); onClose() }}
                title={`${head.n} — ${head.t}`}
              >
                <img
                  src={url}
                  alt={head.n}
                  loading="lazy"
                  onError={(e) => { e.target.style.opacity = '0.25' }}
                />
                <span className="item-name">{head.n}</span>
              </button>
            )
          })}
          {!loading && catalog && totalMatching > MAX_VISIBLE && (
            <div className="picker-info">
              {lang === 'ru'
                ? `Показано первые ${MAX_VISIBLE} из ${totalMatching.toLocaleString()}. Уточните поиск.`
                : `Showing first ${MAX_VISIBLE} of ${totalMatching.toLocaleString()}. Refine search.`}
            </div>
          )}
        </div>

        <div className="custom-head-row">
          <label>
            {lang === 'ru' ? 'Голова игрока по нику:' : 'Player head by username:'}
          </label>
          <div className="custom-head-input">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'ru' ? 'например: DeloriaZ' : 'e.g., DeloriaZ'}
              maxLength={16}
              onKeyDown={(e) => { if (e.key === 'Enter') applyUsername() }}
            />
            <button className="btn btn-primary" onClick={applyUsername} disabled={!username.trim()}>
              {lang === 'ru' ? 'Применить' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeadsPicker
