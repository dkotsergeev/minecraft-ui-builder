import { MC_COLORS } from '../utils/minecraftColors'
import './MinecraftColorPicker.css'

// Compact 16-color swatch picker. Click a color to select it.
function MinecraftColorPicker({ value, onChange }) {
  return (
    <div className="mc-color-picker">
      {MC_COLORS.map(c => (
        <button
          key={c.code}
          type="button"
          className={`mc-color-swatch ${value === c.code ? 'active' : ''}`}
          style={{ backgroundColor: c.hex }}
          title={`${c.label} (${c.mcCode})`}
          onClick={() => onChange(c.code)}
        />
      ))}
    </div>
  )
}

export default MinecraftColorPicker
