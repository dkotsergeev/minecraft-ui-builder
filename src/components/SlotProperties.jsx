import { useState } from 'react'
import ItemPicker from './ItemPicker'
import HeadsPicker from './HeadsPicker'
import CustomTextureButton from './CustomTextureButton'
import MinecraftColorPicker from './MinecraftColorPicker'
import { useLang } from '../i18n/LanguageContext'
import { DEFAULT_DISPLAY_COLOR, DEFAULT_LORE_COLOR, getColorHex } from '../utils/minecraftColors'
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
  const [headsPickerOpen, setHeadsPickerOpen] = useState(false)

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
              src={slot.texture.startsWith('data:') || slot.texture.startsWith('http')
                ? slot.texture
                : `${import.meta.env.BASE_URL}textures/${textureFolder}/${slot.texture}.png`}
              alt={slot.texture}
              className="texture-preview"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          {/* For URL / data textures, show a static label instead of an editable field —
              editing a 200-char URL by hand is useless, and editing it accidentally
              would corrupt the slot. The pickers above are the right way to change it. */}
          {slot.texture && (slot.texture.startsWith('data:') || slot.texture.startsWith('http')) ? (
            <input
              type="text"
              value={`[${textureFolder === 'custom' ? t('custom_texture') : textureFolder === 'heads' ? 'head' : textureFolder}]`}
              readOnly
              title={slot.texture}
            />
          ) : (
            <input
              type="text"
              value={slot.texture || ''}
              onChange={handleTextureChange}
              placeholder={t('texture_placeholder')}
            />
          )}
        </div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => setPickerOpen(true)}
        >
          {t('browse_library')}
        </button>
        <button
          className="btn btn-secondary btn-block"
          style={{ marginTop: 6 }}
          onClick={() => setHeadsPickerOpen(true)}
        >
          {t('browse_heads')}
        </button>
        <div style={{ marginTop: 6 }}>
          <CustomTextureButton
            onLoad={(dataUrl) => onUpdate({ texture: dataUrl, textureFolder: 'custom' })}
          />
        </div>
      </div>

      <div className="property-group">
        <label>{t('display_name')}:</label>
        <input
          type="text"
          value={slot.displayName || ''}
          onChange={handleDisplayNameChange}
          placeholder={t('display_name_placeholder')}
          style={{
            color: getColorHex(slot.displayColor || DEFAULT_DISPLAY_COLOR),
            fontWeight: 500,
          }}
        />
        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          {t('text_color')}:
        </small>
        <MinecraftColorPicker
          value={slot.displayColor || DEFAULT_DISPLAY_COLOR}
          onChange={(color) => onUpdate({ displayColor: color })}
        />
      </div>

      <div className="property-group">
        <label>{t('lore_tooltip')}:</label>
        <textarea
          value={slot.lore || ''}
          onChange={handleLoreChange}
          placeholder={t('lore_placeholder')}
          rows="3"
          style={{
            color: getColorHex(slot.loreColor || DEFAULT_LORE_COLOR),
            fontStyle: 'italic',
          }}
        />
        <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          {t('text_color')}:
        </small>
        <MinecraftColorPicker
          value={slot.loreColor || DEFAULT_LORE_COLOR}
          onChange={(color) => onUpdate({ loreColor: color })}
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

      <HeadsPicker
        isOpen={headsPickerOpen}
        onClose={() => setHeadsPickerOpen(false)}
        onSelect={(headUrl) => onUpdate({ texture: headUrl, textureFolder: 'heads' })}
      />
    </div>
  )
}

export default SlotProperties
