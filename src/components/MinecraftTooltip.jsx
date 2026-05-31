import { useEffect, useState } from 'react'
import { getColorHex, DEFAULT_DISPLAY_COLOR, DEFAULT_LORE_COLOR } from '../utils/minecraftColors'
import './MinecraftTooltip.css'

// Reusable Minecraft-styled tooltip.
// Renders inside a portal-less wrapper that follows the mouse position.
// Pass `anchorRef` (DOM element) or `position` ({x, y}).
function MinecraftTooltip({
  displayName,
  displayColor = DEFAULT_DISPLAY_COLOR,
  displayItalic = true,
  lore = '',
  loreColor = DEFAULT_LORE_COLOR,
  position,
  visible = true,
}) {
  if (!visible) return null
  if (!displayName && !lore) return null

  const loreLines = lore ? lore.split('\n').filter(l => l.length > 0) : []

  const style = position
    ? {
        left: position.x + 16,
        top: position.y + 16,
      }
    : {}

  return (
    <div className="mc-tooltip" style={style}>
      {displayName && (
        <div
          className="mc-tooltip-name"
          style={{
            color: getColorHex(displayColor),
            fontStyle: displayItalic ? 'italic' : 'normal',
          }}
        >
          {displayName}
        </div>
      )}
      {loreLines.map((line, i) => (
        <div
          key={i}
          className="mc-tooltip-lore"
          style={{ color: getColorHex(loreColor) }}
        >
          {line}
        </div>
      ))}
    </div>
  )
}

// Hook that tracks mouse position over a target. Returns {position, visible}
// where position updates on mousemove and visible toggles on enter/leave.
export function useTooltipPosition(targetRef) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    const onEnter = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const onMove = (e) => setPosition({ x: e.clientX, y: e.clientY })
    const onLeave = () => setVisible(false)

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [targetRef])

  return { position, visible }
}

export default MinecraftTooltip
