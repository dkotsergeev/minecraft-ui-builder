import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mc-ui-builder-lang') || 'ru'
  })

  useEffect(() => {
    localStorage.setItem('mc-ui-builder-lang', lang)
  }, [lang])

  // t('key') or t('key', 'arg1', 'arg2') for {0}, {1} substitution
  const t = (key, ...args) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key
    args.forEach((arg, i) => {
      str = str.replace(`{${i}}`, arg)
    })
    return str
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
