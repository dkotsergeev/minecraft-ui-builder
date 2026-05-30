import { useState } from 'react'
import ItemPicker from './ItemPicker'
import { useLang } from '../i18n/LanguageContext'
import './InventoryTriggers.css'

const SCALE = 3

function InventoryTriggers({ triggers, interfaces, onUpdate }) {
  const { t } = useLang()
  const [editingId, setEditingId] = useState(null)
  const [pickerOpenForId, setPickerOpenForId] = useState(null)

  const handleAdd = () => {
    const newTrigger = {
      id: `trigger_${Date.now()}`,
      slot: 8, // last hotbar slot by default
      texture: 'book',
      textureFolder: 'items',
      displayName: '',
      targetInterface: interfaces[0]?.id || '',
    }
    onUpdate([...triggers, newTrigger])
    setEditingId(newTrigger.id)
  }

  const handleUpdate = (id, updates) => {
    onUpdate(triggers.map(tr => tr.id === id ? { ...tr, ...updates } : tr))
  }

  const handleDelete = (id) => {
    onUpdate(triggers.filter(tr => tr.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const triggerBySlot = new Map(triggers.map(tr => [tr.slot, tr]))

  // Render player inventory grid (4 rows: 3 inventory + 1 hotbar)
  const renderInventoryGrid = () => {
    return (
      <div className="inv-preview">
        <div className="inv-section-label">{t('main_inventory')} (9-35)</div>
        <div className="inv-grid">
          {Array.from({ length: 27 }).map((_, idx) => {
            const slotIdx = 9 + idx
            const trigger = triggerBySlot.get(slotIdx)
            return (
              <div
                key={slotIdx}
                className={`inv-slot ${trigger ? 'has-trigger' : ''} ${editingId === trigger?.id ? 'editing' : ''}`}
                onClick={() => {
                  if (trigger) setEditingId(trigger.id)
                  else {
                    // create new trigger for this slot
                    const newTr = {
                      id: `trigger_${Date.now()}`,
                      slot: slotIdx,
                      texture: 'book',
                      textureFolder: 'items',
                      displayName: '',
                      targetInterface: interfaces[0]?.id || '',
                    }
                    onUpdate([...triggers, newTr])
                    setEditingId(newTr.id)
                  }
                }}
                title={trigger ? `${trigger.texture} → ${trigger.targetInterface}` : `Slot ${slotIdx}`}
              >
                <span className="inv-slot-idx">{slotIdx}</span>
                {trigger && trigger.texture && (
                  <img
                    src={`/textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                    alt={trigger.texture}
                    className="inv-slot-tex"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="inv-section-label hotbar-label">{t('hotbar')} (0-8)</div>
        <div className="inv-grid hotbar">
          {Array.from({ length: 9 }).map((_, idx) => {
            const trigger = triggerBySlot.get(idx)
            return (
              <div
                key={idx}
                className={`inv-slot hotbar-slot ${trigger ? 'has-trigger' : ''} ${editingId === trigger?.id ? 'editing' : ''}`}
                onClick={() => {
                  if (trigger) setEditingId(trigger.id)
                  else {
                    const newTr = {
                      id: `trigger_${Date.now()}`,
                      slot: idx,
                      texture: 'book',
                      textureFolder: 'items',
                      displayName: '',
                      targetInterface: interfaces[0]?.id || '',
                    }
                    onUpdate([...triggers, newTr])
                    setEditingId(newTr.id)
                  }
                }}
                title={trigger ? `${trigger.texture} → ${trigger.targetInterface}` : `Slot ${idx}`}
              >
                <span className="inv-slot-idx">{idx}</span>
                {trigger && trigger.texture && (
                  <img
                    src={`/textures/${trigger.textureFolder || 'items'}/${trigger.texture}.png`}
                    alt={trigger.texture}
                    className="inv-slot-tex"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const editingTrigger = triggers.find(tr => tr.id === editingId)

  return (
    <div className="inventory-triggers">
      <div className="triggers-header">
        <h2>{t('triggers_title')}</h2>
        <p className="subtitle">{t('triggers_subtitle')}</p>
      </div>

      <div className="triggers-layout">
        <div className="triggers-left">
          {renderInventoryGrid()}
          <button className="btn btn-primary" onClick={handleAdd}>
            {t('add_trigger')}
          </button>
        </div>

        <div className="triggers-right">
          {triggers.length === 0 && (
            <div className="triggers-empty">{t('no_triggers')}</div>
          )}

          <div className="triggers-list">
            {triggers.map(tr => (
              <div
                key={tr.id}
                className={`trigger-card ${editingId === tr.id ? 'editing' : ''}`}
                onClick={() => setEditingId(tr.id)}
              >
                <div className="trigger-card-row">
                  <div className="trigger-icon">
                    {tr.texture && (
                      <img
                        src={`/textures/${tr.textureFolder || 'items'}/${tr.texture}.png`}
                        alt={tr.texture}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <div className="trigger-info">
                    <div className="trigger-title">
                      {tr.displayName || tr.texture || '(empty)'}
                    </div>
                    <div className="trigger-meta">
                      {tr.slot < 9 ? `${t('hotbar')} #${tr.slot}` : `${t('main_inventory')} #${tr.slot}`}
                      {tr.targetInterface && ` → ${interfaces.find(i => i.id === tr.targetInterface)?.name || tr.targetInterface}`}
                    </div>
                  </div>
                  <button
                    className="btn-danger trigger-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(tr.id) }}
                  >
                    ✕
                  </button>
                </div>

                {editingId === tr.id && (
                  <div className="trigger-editor" onClick={(e) => e.stopPropagation()}>
                    <div className="prop-row">
                      <label>{t('trigger_slot')}:</label>
                      <input
                        type="number"
                        min="0"
                        max="35"
                        value={tr.slot}
                        onChange={(e) => handleUpdate(tr.id, { slot: Math.max(0, Math.min(35, parseInt(e.target.value) || 0)) })}
                      />
                      <small>{t('trigger_slot_hint')}</small>
                    </div>

                    <div className="prop-row">
                      <label>{t('trigger_item')}:</label>
                      <div className="trigger-texture-row">
                        <input
                          type="text"
                          value={tr.texture || ''}
                          onChange={(e) => handleUpdate(tr.id, { texture: e.target.value })}
                          placeholder="book"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setPickerOpenForId(tr.id)}
                        >
                          📦
                        </button>
                      </div>
                    </div>

                    <div className="prop-row">
                      <label>{t('trigger_display_name')}:</label>
                      <input
                        type="text"
                        value={tr.displayName || ''}
                        onChange={(e) => handleUpdate(tr.id, { displayName: e.target.value })}
                        placeholder="Phone"
                      />
                    </div>

                    <div className="prop-row">
                      <label>{t('trigger_target')}:</label>
                      <select
                        value={tr.targetInterface || ''}
                        onChange={(e) => handleUpdate(tr.id, { targetInterface: e.target.value })}
                      >
                        <option value="">{t('trigger_select_target')}</option>
                        {interfaces.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ItemPicker
        isOpen={pickerOpenForId !== null}
        onClose={() => setPickerOpenForId(null)}
        onSelect={(item, folder) => {
          handleUpdate(pickerOpenForId, { texture: item, textureFolder: folder })
        }}
        currentTexture={triggers.find(tr => tr.id === pickerOpenForId)?.texture}
      />
    </div>
  )
}

export default InventoryTriggers
