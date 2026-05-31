import { useState, useEffect, useRef } from 'react'
import SlotWithTooltip from './SlotWithTooltip'
import { useLang } from '../i18n/LanguageContext'
import './TestMode.css'

const SCALE = 3

function TestMode({ interfaces, triggers }) {
  const { t } = useLang()
  // navigation stack — array of interface IDs. Last item is currently open.
  const [stack, setStack] = useState([])
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const currentInterfaceId = stack[stack.length - 1] || null
  const currentInterface = interfaces.find(i => i.id === currentInterfaceId)

  // ESC closes the menu
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setStack([])
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const showToast = (message) => {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2200)
  }

  const handleTriggerClick = (trigger) => {
    if (trigger.targetInterface) {
      setStack([trigger.targetInterface])
    } else {
      showToast('⚠️ Триггер без целевого меню')
    }
  }

  const handleSlotClick = (slot) => {
    if (!slot) return
    const action = slot.actionType

    if (action === 'open_interface' && slot.targetInterface) {
      setStack([...stack, slot.targetInterface])
    } else if (action === 'close') {
      setStack([])
    } else if (action === 'go_back') {
      setStack(stack.slice(0, -1))
    } else if (action === 'custom_action' && slot.customAction) {
      showToast(t('custom_action_triggered', slot.customAction))
    }
  }

  const triggerBySlot = new Map(triggers.map(tr => [tr.slot, tr]))

  // Render player inventory (hotbar + main 3×9) with triggers
  const renderPlayerInventory = () => (
    <div className="test-player-inv">
      <div className="test-title">🎮 {t('test_mode_title')}</div>
      <p className="test-hint">{t('test_mode_subtitle')}</p>

      {triggers.length === 0 ? (
        <div className="test-empty">{t('test_no_triggers')}</div>
      ) : (
        <>
          <div className="player-inv-grid">
            {Array.from({ length: 27 }).map((_, idx) => {
              const slotIdx = 9 + idx
              const trigger = triggerBySlot.get(slotIdx)
              return (
                <div
                  key={slotIdx}
                  className={`inv-cell ${trigger ? 'has-trigger' : ''}`}
                  onClick={() => trigger && handleTriggerClick(trigger)}
                  title={trigger ? `${trigger.displayName || trigger.texture} → ${interfaces.find(i => i.id === trigger.targetInterface)?.name}` : ''}
                >
                  {trigger && trigger.texture && (
                    <img
                      src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                      alt={trigger.texture}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="player-hotbar-grid">
            {Array.from({ length: 9 }).map((_, idx) => {
              const trigger = triggerBySlot.get(idx)
              return (
                <div
                  key={idx}
                  className={`inv-cell hotbar-cell ${trigger ? 'has-trigger' : ''}`}
                  onClick={() => trigger && handleTriggerClick(trigger)}
                  title={trigger ? `${trigger.displayName || trigger.texture} → ${interfaces.find(i => i.id === trigger.targetInterface)?.name}` : ''}
                >
                  {trigger && trigger.texture && (
                    <img
                      src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                      alt={trigger.texture}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )

  // Render the currently open interface (chest GUI)
  const renderOpenInterface = () => {
    if (!currentInterface) return null
    const iface = currentInterface
    const slotMap = new Map(iface.slots.map(s => [s.index, s]))
    const totalSlots = iface.rows * 9
    const chestWidth = 176 * SCALE
    const chestHeight = (17 + 18 * iface.rows + 7 + 14 + 54 + 4 + 18 + 7) * SCALE

    return (
      <div className="test-overlay" onClick={(e) => {
        // click outside chest window closes it
        if (e.target.classList.contains('test-overlay')) setStack([])
      }}>
        <div className="test-top-bar">
          <div className="test-history">
            <strong>{t('history')}:</strong>
            {stack.map((id, idx) => {
              const name = interfaces.find(i => i.id === id)?.name || id
              return (
                <span key={`${id}-${idx}`} className="history-step">
                  {idx > 0 && ' → '}
                  {name}
                </span>
              )
            })}
          </div>
          <div className="test-controls">
            {stack.length > 1 && (
              <button className="btn btn-secondary btn-sm" onClick={() => setStack(stack.slice(0, -1))}>
                {t('back_btn')}
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => setStack([])}>
              {t('close_menu')}
            </button>
          </div>
        </div>

        <div className="test-chest-wrap">
          <div className="test-chest-title">{iface.name}</div>

          <div className="chest-window" style={{ width: chestWidth, height: chestHeight }}>
            {/* Chest header */}
            <div
              className="chest-bg-top"
              style={{
                width: chestWidth,
                height: 17 * SCALE,
                backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                backgroundPosition: '0 0',
              }}
            />
            {/* Slot rows */}
            {Array.from({ length: iface.rows }).map((_, rowIdx) => (
              <div
                key={`bg-row-${rowIdx}`}
                className="chest-bg-row"
                style={{
                  width: chestWidth,
                  height: 18 * SCALE,
                  top: (17 + rowIdx * 18) * SCALE,
                  position: 'absolute',
                  left: 0,
                  backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                  backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                  backgroundPosition: `0 -${17 * SCALE}px`,
                }}
              />
            ))}
            {/* Bottom of chest area */}
            <div
              className="chest-bg-bottom"
              style={{
                width: chestWidth,
                height: 7 * SCALE,
                top: (17 + 18 * iface.rows) * SCALE,
                position: 'absolute',
                left: 0,
                backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                backgroundPosition: `0 -${(17 + 18 * 6) * SCALE}px`,
              }}
            />
            {/* Player inventory */}
            <div
              className="chest-bg-inventory"
              style={{
                width: chestWidth,
                height: (14 + 54 + 4 + 18 + 7) * SCALE,
                top: (17 + 18 * iface.rows + 7) * SCALE,
                position: 'absolute',
                left: 0,
                backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                backgroundPosition: `0 -${(17 + 18 * 6 + 7) * SCALE}px`,
              }}
            />

            {/* Slots */}
            {Array.from({ length: totalSlots }).map((_, index) => {
              const slot = slotMap.get(index)
              const row = Math.floor(index / 9)
              const col = index % 9
              const isActionable = slot && slot.actionType && slot.actionType !== 'none'

              return (
                <SlotWithTooltip
                  key={index}
                  slot={slot}
                  className={`test-slot ${isActionable ? 'actionable' : ''}`}
                  style={{
                    position: 'absolute',
                    left: (8 + col * 18) * SCALE,
                    top: (18 + row * 18) * SCALE,
                    width: 16 * SCALE,
                    height: 16 * SCALE,
                  }}
                  onClick={() => handleSlotClick(slot)}
                  title={slot ? `${slot.displayName || slot.texture || `Slot ${index}`}${isActionable ? ' (clickable)' : ''}` : ''}
                >
                  {slot && slot.texture && (
                    <img
                      src={slot.texture.startsWith('data:') || slot.texture.startsWith('http')
                        ? slot.texture
                        : `${import.meta.env.BASE_URL}textures/${slot.textureFolder || 'items'}/${slot.texture}.png`}
                      alt={slot.texture}
                      className="test-slot-tex"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  {slot && slot.glowing && <div className="test-slot-glow" />}
                </SlotWithTooltip>
              )
            })}

            {/* Player inventory slots (with triggers shown) */}
            {Array.from({ length: 27 }).map((_, index) => {
              const slotIdx = 9 + index
              const trigger = triggerBySlot.get(slotIdx)
              const row = Math.floor(index / 9)
              const col = index % 9
              return (
                <div
                  key={`inv-${index}`}
                  className={`test-slot player-inv ${trigger ? 'has-trigger' : ''}`}
                  style={{
                    position: 'absolute',
                    left: (8 + col * 18) * SCALE,
                    top: (17 + 18 * iface.rows + 14 + row * 18) * SCALE,
                    width: 16 * SCALE,
                    height: 16 * SCALE,
                  }}
                  onClick={() => trigger && handleTriggerClick(trigger)}
                  title={trigger ? `${trigger.displayName || trigger.texture}` : ''}
                >
                  {trigger && trigger.texture && (
                    <img
                      src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                      alt={trigger.texture}
                      className="test-slot-tex"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
              )
            })}
            {Array.from({ length: 9 }).map((_, index) => {
              const trigger = triggerBySlot.get(index)
              return (
                <div
                  key={`hot-${index}`}
                  className={`test-slot player-inv hotbar ${trigger ? 'has-trigger' : ''}`}
                  style={{
                    position: 'absolute',
                    left: (8 + index * 18) * SCALE,
                    top: (17 + 18 * iface.rows + 14 + 54 + 4) * SCALE,
                    width: 16 * SCALE,
                    height: 16 * SCALE,
                  }}
                  onClick={() => trigger && handleTriggerClick(trigger)}
                  title={trigger ? `${trigger.displayName || trigger.texture}` : ''}
                >
                  {trigger && trigger.texture && (
                    <img
                      src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                      alt={trigger.texture}
                      className="test-slot-tex"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <p className="test-mode-hint">{t('test_mode_hint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="test-mode">
      {renderPlayerInventory()}
      {currentInterface && renderOpenInterface()}
      {toast && <div className="test-toast">{toast}</div>}
    </div>
  )
}

export default TestMode
