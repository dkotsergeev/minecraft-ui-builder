import { useRef } from 'react'
import { useLang } from '../i18n/LanguageContext'

// Lets the user pick a PNG/JPG/SVG from disk; converts to base64 data URL
// and calls onLoad(dataUrl). Cap at ~256x256 to avoid bloating localStorage.
function CustomTextureButton({ onLoad, label, className = 'btn btn-secondary btn-block' }) {
  const { t } = useLang()
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Hard cap on size to keep localStorage reasonable.
    // 500 KB base64 ≈ ~370 KB binary; plenty for an icon.
    if (file.size > 500_000) {
      alert(`Image too large (${Math.round(file.size / 1024)} KB). Max 500 KB.`)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      // Re-encode through canvas to downscale large images to 64×64
      // (Minecraft item icons are tiny anyway).
      const img = new Image()
      img.onload = () => {
        const maxSize = 64
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/png')
        onLoad(dataUrl)
      }
      img.onerror = () => alert('Could not read image.')
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {label ?? t('upload_custom')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </>
  )
}

export default CustomTextureButton
