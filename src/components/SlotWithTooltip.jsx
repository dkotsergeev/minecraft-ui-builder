import { useState } from 'react'
import MinecraftTooltip from './MinecraftTooltip'

// Wrapper around a slot div that shows a Minecraft tooltip on hover
// when displayName or lore is set on the slot.
// Forwards onClick / className / style to the inner div, and renders
// the tooltip as a sibling fixed-position element.
function SlotWithTooltip({
  slot,
  className,
  style,
  onClick,
  children,
  // When true, the tooltip is suppressed (e.g. for empty slots)
  disabled = false,
  // Optional fallback title shown in browser tooltip when no displayName/lore
  title,
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  const hasTooltip = !disabled && slot && (slot.displayName || slot.lore)

  return (
    <>
      <div
        className={className}
        style={style}
        onClick={onClick}
        onMouseEnter={hasTooltip ? (e) => { setPos({ x: e.clientX, y: e.clientY }); setHovering(true) } : undefined}
        onMouseMove={hasTooltip ? (e) => setPos({ x: e.clientX, y: e.clientY }) : undefined}
        onMouseLeave={hasTooltip ? () => setHovering(false) : undefined}
        title={!hasTooltip ? title : undefined}
      >
        {children}
      </div>
      {hasTooltip && hovering && (
        <MinecraftTooltip
          displayName={slot.displayName}
          displayColor={slot.displayColor}
          lore={slot.lore}
          loreColor={slot.loreColor}
          position={pos}
        />
      )}
    </>
  )
}

export default SlotWithTooltip
