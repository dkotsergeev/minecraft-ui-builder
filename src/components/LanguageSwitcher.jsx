import { useLang } from '../i18n/LanguageContext'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="lang-switcher">
      <button
        className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
        onClick={() => setLang('ru')}
        title="Русский"
      >
        🇷🇺 RU
      </button>
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title="English"
      >
        🇬🇧 EN
      </button>
    </div>
  )
}

export default LanguageSwitcher
