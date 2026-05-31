import { useState } from 'react'
import ItemPicker from './ItemPicker'
import SlotWithTooltip from './SlotWithTooltip'
import { useLang } from '../i18n/LanguageContext'
import './ChestEditor.css'

// Размеры из настоящей текстуры Minecraft generic_54.png
// Caca текстура: 256x256
// Окно сундука: 176px ширина
// Заголовок: 17px высота
// Каждая строка слотов: 18px (16 для предмета + 1 px padding с каждой стороны)
// Нижний край (под слотами): 7px
// Слоты начинаются с (7, 17), каждый 18×18 px
//
// Player inventory структура (под сундуком):
// Промежуток с заголовком "Inventory": 14px
// 3 строки инвентаря: 54px
// Промежуток до hotbar: 4px
// Hotbar: 18px
// Нижний край: 7px

const SCALE = 3 // масштаб для отображения

function ChestEditor({
  interface: iface,
  selectedSlot,
  onSelectSlot,
  onUpdateInterface,
  onUpdateSlot,
  triggers = [],
  onGoToTriggers,
  recentItems = [],
}) {
  const { t } = useLang()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showPlayerInventory, setShowPlayerInventory] = useState(true)

  const triggerBySlot = new Map(triggers.map(tr => [tr.slot, tr]))

  const totalSlots = iface.rows * 9
  const slotMap = new Map(iface.slots.map(s => [s.index, s]))

  const handleRowsChange = (e) => {
    const rows = parseInt(e.target.value)
    if (rows >= 1 && rows <= 6) {
      onUpdateInterface(iface.id, { rows })
    }
  }

  const handleNameChange = (e) => {
    onUpdateInterface(iface.id, { name: e.target.value })
  }

  const handleDescriptionChange = (e) => {
    onUpdateInterface(iface.id, { description: e.target.value })
  }

  const handleSlotClick = (index) => {
    if (selectedSlot === index) {
      onSelectSlot(null)
    } else {
      onSelectSlot(index)
    }
  }

  const handleRecentItemClick = (item) => {
    if (selectedSlot === null) {
      alert(t('hint_select_slot'))
      return
    }
    onUpdateSlot(selectedSlot, { texture: item.texture, textureFolder: item.textureFolder || 'items' })
  }

  const handlePickerSelect = (item, folder) => {
    if (selectedSlot === null) return
    onUpdateSlot(selectedSlot, { texture: item, textureFolder: folder })
  }

  // Размеры окна сундука (только сундук, без player inventory)
  const chestWidth = 176 * SCALE
  const chestHeight = (17 + 18 * iface.rows + 7) * SCALE
  // Полное окно с player inventory
  const fullHeight = (17 + 18 * iface.rows + 14 + 54 + 4 + 18 + 7) * SCALE

  return (
    <div className="chest-editor">
      <div className="editor-header">
        <div className="header-controls">
          <div className="control-group">
            <label>{t('name')}:</label>
            <input
              type="text"
              value={iface.name}
              onChange={handleNameChange}
              placeholder={t('interface_name_placeholder')}
            />
          </div>

          <div className="control-group">
            <label>{t('rows')}:</label>
            <select value={iface.rows} onChange={handleRowsChange}>
              {[1, 2, 3, 4, 5, 6].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>{t('description')}:</label>
            <input
              type="text"
              value={iface.description}
              onChange={handleDescriptionChange}
              placeholder={t('interface_description_placeholder')}
            />
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showPlayerInventory}
                onChange={(e) => setShowPlayerInventory(e.target.checked)}
              />
              {t('show_player_inventory')}
            </label>
          </div>
        </div>
      </div>

      <div className="chest-viewport">
        <div className="chest-title">{iface.name}</div>

        <div
          className="chest-window"
          style={{
            width: chestWidth,
            height: showPlayerInventory ? fullHeight : chestHeight,
          }}
        >
          {/* Background image of chest texture */}
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

          {/* Slots area background - tile vertically */}
          {Array.from({ length: iface.rows }).map((_, rowIdx) => (
            <div
              key={`bg-row-${rowIdx}`}
              className="chest-bg-row"
              style={{
                width: chestWidth,
                height: 18 * SCALE,
                top: (17 + rowIdx * 18) * SCALE,
                backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                backgroundPosition: `0 -${17 * SCALE}px`,
              }}
            />
          ))}

          {/* Bottom border of chest area */}
          <div
            className="chest-bg-bottom"
            style={{
              width: chestWidth,
              height: 7 * SCALE,
              top: (17 + 18 * iface.rows) * SCALE,
              backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
              backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
              backgroundPosition: `0 -${(17 + 18 * 6) * SCALE}px`,
            }}
          />

          {/* Player Inventory (optional) */}
          {showPlayerInventory && (
            <div
              className="chest-bg-inventory"
              style={{
                width: chestWidth,
                height: (14 + 54 + 4 + 18 + 7) * SCALE,
                top: (17 + 18 * iface.rows + 7) * SCALE,
                backgroundImage: `url(${import.meta.env.BASE_URL}textures/containers/generic_54.png)`,
                backgroundSize: `${256 * SCALE}px ${256 * SCALE}px`,
                backgroundPosition: `0 -${(17 + 18 * 6 + 7) * SCALE}px`,
              }}
            />
          )}

          {/* Editable Chest Slots */}
          {Array.from({ length: totalSlots }).map((_, index) => {
            const slot = slotMap.get(index)
            const row = Math.floor(index / 9)
            const col = index % 9
            const isSelected = selectedSlot === index
            const hasItem = !!slot

            return (
              <SlotWithTooltip
                key={index}
                slot={slot}
                className={`chest-slot ${isSelected ? 'selected' : ''} ${hasItem ? 'filled' : ''}`}
                style={{
                  position: 'absolute',
                  left: (8 + col * 18) * SCALE,
                  top: (18 + row * 18) * SCALE,
                  width: 16 * SCALE,
                  height: 16 * SCALE,
                }}
                onClick={() => handleSlotClick(index)}
                title={`Slot ${index}${slot ? ` - ${slot.texture || 'no texture'}` : ''}`}
              >
                <div className="slot-index">{index}</div>
                {slot && slot.texture && (
                  <img
                    src={slot.texture.startsWith('data:') || slot.texture.startsWith('http')
                      ? slot.texture
                      : `${import.meta.env.BASE_URL}textures/${slot.textureFolder || 'items'}/${slot.texture}.png`}
                    alt={slot.texture}
                    className="slot-texture"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                {slot && !slot.texture && (
                  <div className="slot-placeholder">?</div>
                )}
                {slot && slot.glowing && <div className="slot-glow" />}
              </SlotWithTooltip>
            )
          })}

          {/* Player Inventory Slots (decorative + show triggers) */}
          {showPlayerInventory && (
            <>
              {/* Main inventory 3x9 — slot indices 9-35 */}
              {Array.from({ length: 27 }).map((_, index) => {
                const slotIdx = 9 + index
                const trigger = triggerBySlot.get(slotIdx)
                const row = Math.floor(index / 9)
                const col = index % 9
                return (
                  <div
                    key={`inv-${index}`}
                    className={`player-slot ${trigger ? 'has-trigger' : ''}`}
                    style={{
                      position: 'absolute',
                      left: (8 + col * 18) * SCALE,
                      top: (17 + 18 * iface.rows + 14 + row * 18) * SCALE,
                      width: 16 * SCALE,
                      height: 16 * SCALE,
                    }}
                    onClick={() => trigger && onGoToTriggers && onGoToTriggers()}
                    title={trigger
                      ? `🎒 Trigger: ${trigger.displayName || trigger.texture} → ${trigger.targetInterface}\n(Click to edit in Triggers tab)`
                      : `Inventory slot ${slotIdx}`}
                  >
                    {trigger && trigger.texture && (
                      <img
                        src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                        alt={trigger.texture}
                        className="player-slot-tex"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                )
              })}
              {/* Hotbar 1x9 — slot indices 0-8 */}
              {Array.from({ length: 9 }).map((_, index) => {
                const trigger = triggerBySlot.get(index)
                return (
                  <div
                    key={`hotbar-${index}`}
                    className={`player-slot hotbar ${trigger ? 'has-trigger' : ''}`}
                    style={{
                      position: 'absolute',
                      left: (8 + index * 18) * SCALE,
                      top: (17 + 18 * iface.rows + 14 + 54 + 4) * SCALE,
                      width: 16 * SCALE,
                      height: 16 * SCALE,
                    }}
                    onClick={() => trigger && onGoToTriggers && onGoToTriggers()}
                    title={trigger
                      ? `🎒 Trigger: ${trigger.displayName || trigger.texture} → ${trigger.targetInterface}\n(Click to edit in Triggers tab)`
                      : `Hotbar slot ${index}`}
                  >
                    {trigger && trigger.texture && (
                      <img
                        src={`${import.meta.env.BASE_URL}textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                        alt={trigger.texture}
                        className="player-slot-tex"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      <div className="quick-items">
        <div className="quick-items-header">
          <h3>{t('recent_items')}</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPickerOpen(true)}
            disabled={selectedSlot === null}
          >
            {t('browse_all_items')}
          </button>
        </div>

        {selectedSlot === null && (
          <div className="quick-hint">
            {t('hint_select_slot')}
          </div>
        )}

        {selectedSlot !== null && (
          <div className="quick-hint active">
            {t('hint_slot_selected', selectedSlot)}
          </div>
        )}

        <div className="items-grid">
          {recentItems.length === 0 ? (
            <div className="recent-empty">{t('no_recent_items')}</div>
          ) : (
            recentItems.map((item, i) => {
              const isUrl = item.texture.startsWith('http') || item.texture.startsWith('data:')
              const src = isUrl
                ? item.texture
                : `${import.meta.env.BASE_URL}textures/${item.textureFolder || 'items'}/${item.texture}.png`
              const label = isUrl
                ? (item.textureFolder === 'heads' ? 'head' : item.textureFolder === 'custom' ? 'custom' : '…')
                : item.texture
              return (
                <button
                  key={`${item.texture}-${i}`}
                  className="quick-item"
                  onClick={() => handleRecentItemClick(item)}
                  disabled={selectedSlot === null}
                  title={item.texture}
                >
                  <img
                    src={src}
                    alt={label}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <span className="quick-item-name">{label}</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <ItemPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        currentTexture={selectedSlot !== null ? slotMap.get(selectedSlot)?.texture : null}
      />
    </div>
  )
}

export default ChestEditor
