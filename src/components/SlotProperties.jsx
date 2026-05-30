import { useState } from 'react'
import ItemPicker from './ItemPicker'
import { useLang } from '../i18n/LanguageContext'
import './SlotProperties.css'

const ACTION_TYPES = [
  'open_interface',
  'close',
  'go_back',
  'custom_action',
  'none'
]

function SlotProperties({
  interfaceId,
  slot,
  slotIndex,
  allInterfaces,
  onUpdate,
  onDelete
}) {
  const { t } = useLang()
  const [showCustomAction, setShowCustomAction] = useState(
    slot?.actionType === 'custom_action'
  )
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!slot) {
    return (
      <div className="slot-properties">
        <p className="empty">{t('select_slot_to_edit')}</p>
      </div>
    )
  }

  const textureFolder = slot.textureFolder || 'items'

  const handleTextureChange = (e) => {
    onUpdate({ texture: e.target.value })
  }

  const handleActionTypeChange = (e) => {
    const type = e.target.value
    setShowCustomAction(type === 'custom_action')
    onUpdate({
      actionType: type,
      targetInterface: type === 'open_interface' ? slot.targetInterface : undefined,
      customAction: type === 'custom_action' ? slot.customAction : undefined
    })
  }

  const handleTargetInterfaceChange = (e) => {
    onUpdate({ targetInterface: e.target.value })
  }

  const handleCustomActionChange = (e) => {
    onUpdate({ customAction: e.target.value })
  }

  const handleDisplayNameChange = (e) => {
    onUpdate({ displayName: e.target.value })
  }

  const handleLoreChange = (e) => {
    onUpdate({ lore: e.target.value })
  }

  const actionLabel = (type) => {
    if (type === 'open_interface') return t('open_interface')
    if (type === 'close') return t('close_interface')
    if (type === 'go_back') return t('go_back')
    if (type === 'custom_action') return t('custom_action')
    return t('no_action')
  }

  return (
    <div className="slot-properties">
      <div className="properties-header">
        <h3>{t('slot_n', slotIndex)}</h3>
        <button className="btn-danger" onClick={onDelete}>{t('delete')}</button>
      </div>

      <div className="property-group">
        <label>{t('texture_item')}:</label>
        <div className="texture-picker">
          {slot.texture && (
            <img
              src={`${import.meta.env.BASE_URL}textures/${textureFolder}/${slot.texture}.png`}
              alt={slot.texture}
              className="texture-preview"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <input
            type="text"
            value={slot.texture || ''}
            onChange={handleTextureChange}
            placeholder={t('texture_placeholder')}
          />
        </div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => setPickerOpen(true)}
        >
          {t('browse_library')}
        </button>
      </div>

      <div className="property-group">
        <label>{t('display_name')}:</label>
        <input
          type="text"
          value={slot.displayName || ''}
          onChange={handleDisplayNameChange}
          placeholder={t('display_name_placeholder')}
        />
      </div>

      <div className="property-group">
        <label>{t('lore_tooltip')}:</label>
        <textarea
          value={slot.lore || ''}
          onChange={handleLoreChange}
          placeholder={t('lore_placeholder')}
          rows="3"
        />
      </div>

      <div className="property-group">
        <label>{t('action_type')}:</label>
        <select value={slot.actionType || 'none'} onChange={handleActionTypeChange}>
          {ACTION_TYPES.map(type => (
            <option key={type} value={type}>{actionLabel(type)}</option>
          ))}
        </select>
      </div>

      {slot.actionType === 'open_interface' && (
        <div className="property-group">
          <label>{t('target_interface')}:</label>
          <select
            value={slot.targetInterface || ''}
            onChange={handleTargetInterfaceChange}
          >
            <option value="">-- {t('target_interface')} --</option>
            {allInterfaces
              .filter(i => i.id !== interfaceId)
              .map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
          </select>
        </div>
      )}

      {slot.actionType === 'custom_action' && (
        <div className="property-group">
          <label>{t('custom_action_id')}:</label>
          <input
            type="text"
            value={slot.customAction || ''}
            onChange={handleCustomActionChange}
            placeholder={t('custom_action_placeholder')}
          />
        </div>
      )}

      <div className="property-group">
        <label>
          <input
            type="checkbox"
            checked={slot.glowing || false}
            onChange={(e) => onUpdate({ glowing: e.target.checked })}
          />
          {t('glowing_effect')}
        </label>
      </div>

      <ItemPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item, folder) => onUpdate({ texture: item, textureFolder: folder })}
        currentTexture={slot.texture}
      />
    </div>
  )
}

export default SlotProperties
