import { useState, useEffect } from 'react'
import './App.css'
import InterfaceList from './components/InterfaceList'
import ChestEditor from './components/ChestEditor'
import SlotProperties from './components/SlotProperties'
import NavigationGraph from './components/NavigationGraph'
import InventoryTriggers from './components/InventoryTriggers'
import TestMode from './components/TestMode'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useLang } from './i18n/LanguageContext'

function App() {
  const { t } = useLang()
  const [interfaces, setInterfaces] = useState(() => {
    const saved = localStorage.getItem('minecraftInterfaces')
    return saved ? JSON.parse(saved) : [
      {
        id: 'main_menu',
        name: 'Main Menu',
        rows: 3,
        slots: [],
        description: 'Главное меню'
      }
    ]
  })

  const [triggers, setTriggers] = useState(() => {
    const saved = localStorage.getItem('minecraftTriggers')
    return saved ? JSON.parse(saved) : []
  })

  // Last 10 items applied to any slot — populates the "Recent items" strip
  // in the editor. Each entry: { texture, textureFolder }. New entries push
  // to the front; duplicates are deduped by texture value.
  const [recentItems, setRecentItems] = useState(() => {
    const saved = localStorage.getItem('minecraftRecentItems')
    return saved ? JSON.parse(saved) : []
  })

  const [selectedInterfaceId, setSelectedInterfaceId] = useState(interfaces[0]?.id || 'main_menu')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [activeTab, setActiveTab] = useState('editor') // editor, graph, triggers, test

  // Сохраняем в localStorage
  useEffect(() => {
    localStorage.setItem('minecraftInterfaces', JSON.stringify(interfaces))
  }, [interfaces])

  useEffect(() => {
    localStorage.setItem('minecraftTriggers', JSON.stringify(triggers))
  }, [triggers])

  useEffect(() => {
    localStorage.setItem('minecraftRecentItems', JSON.stringify(recentItems))
  }, [recentItems])

  // Push an item to the front of the recent list, deduping by texture value.
  // Keeps the list at most 10 entries long.
  const pushRecentItem = (texture, textureFolder) => {
    if (!texture) return
    setRecentItems(prev => {
      const filtered = prev.filter(r => r.texture !== texture)
      return [{ texture, textureFolder: textureFolder || 'items' }, ...filtered].slice(0, 10)
    })
  }

  const selectedInterface = interfaces.find(i => i.id === selectedInterfaceId)

  const handleAddInterface = () => {
    const newId = `menu_${Date.now()}`
    const newInterface = {
      id: newId,
      name: `Menu ${interfaces.length + 1}`,
      rows: 3,
      slots: [],
      description: ''
    }
    setInterfaces([...interfaces, newInterface])
    setSelectedInterfaceId(newId)
    setSelectedSlot(null)
  }

  const handleDeleteInterface = (id) => {
    if (interfaces.length === 1) {
      alert('Cannot delete the last interface!')
      return
    }
    const newInterfaces = interfaces.filter(i => i.id !== id)
    setInterfaces(newInterfaces)
    setSelectedInterfaceId(newInterfaces[0].id)
    setSelectedSlot(null)
  }

  const handleUpdateInterface = (id, updates) => {
    setInterfaces(interfaces.map(i =>
      i.id === id ? { ...i, ...updates } : i
    ))
  }

  const handleUpdateSlot = (slotIndex, updates) => {
    if (!selectedInterface) return
    const newSlots = [...selectedInterface.slots]
    const slotPos = newSlots.findIndex(s => s.index === slotIndex)

    if (slotPos !== -1) {
      newSlots[slotPos] = { ...newSlots[slotPos], ...updates }
    } else {
      newSlots.push({ index: slotIndex, ...updates })
    }

    handleUpdateInterface(selectedInterfaceId, { slots: newSlots })

    // If the user just changed the texture, record it in the recents strip.
    if (updates.texture) {
      pushRecentItem(updates.texture, updates.textureFolder)
    }
  }

  const handleDeleteSlot = (slotIndex) => {
    if (!selectedInterface) return
    const newSlots = selectedInterface.slots.filter(s => s.index !== slotIndex)
    handleUpdateInterface(selectedInterfaceId, { slots: newSlots })
    setSelectedSlot(null)
  }

  const handleExport = () => {
    const exportData = { interfaces, triggers, version: 2 }
    const data = JSON.stringify(exportData, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minecraft-ui-config.json'
    a.click()
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        // Support both old (just array) and new (with triggers) formats
        if (Array.isArray(data)) {
          setInterfaces(data)
          setSelectedInterfaceId(data[0]?.id || 'main_menu')
        } else {
          setInterfaces(data.interfaces || [])
          setTriggers(data.triggers || [])
          setSelectedInterfaceId(data.interfaces?.[0]?.id || 'main_menu')
        }
        setSelectedSlot(null)
      } catch (err) {
        alert('Invalid JSON file!')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 {t('app_title')}</h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <button className="btn btn-primary" onClick={handleAddInterface}>{t('new_interface')}</button>
          <div className="export-controls">
            <button className="btn btn-secondary" onClick={handleExport}>📥 {t('export_json')}</button>
            <label className="btn btn-secondary">
              📤 {t('import_json')}
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </header>

      <div className="app-body">
        {(activeTab === 'editor' || activeTab === 'graph') && (
          <aside className="sidebar">
            <InterfaceList
              interfaces={interfaces}
              selectedId={selectedInterfaceId}
              onSelect={setSelectedInterfaceId}
              onAdd={handleAddInterface}
              onDelete={handleDeleteInterface}
            />
          </aside>
        )}

        <main className="content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              {t('tab_editor')}
            </button>
            <button
              className={`tab ${activeTab === 'triggers' ? 'active' : ''}`}
              onClick={() => setActiveTab('triggers')}
            >
              🎒 {t('tab_triggers')}
            </button>
            <button
              className={`tab ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              {t('tab_navigation')}
            </button>
            <button
              className={`tab test-tab ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              {t('tab_test')}
            </button>
          </div>

          {activeTab === 'editor' && selectedInterface && (
            <div className="editor-layout">
              <div className="editor-main">
                <ChestEditor
                  interface={selectedInterface}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  onUpdateInterface={handleUpdateInterface}
                  onUpdateSlot={handleUpdateSlot}
                  triggers={triggers}
                  onGoToTriggers={() => setActiveTab('triggers')}
                  recentItems={recentItems}
                />
              </div>
              <aside className="properties-panel">
                {selectedSlot !== null ? (
                  <SlotProperties
                    interfaceId={selectedInterfaceId}
                    slot={selectedInterface.slots.find(s => s.index === selectedSlot) || { index: selectedSlot }}
                    slotIndex={selectedSlot}
                    allInterfaces={interfaces}
                    onUpdate={(updates) => handleUpdateSlot(selectedSlot, updates)}
                    onDelete={() => handleDeleteSlot(selectedSlot)}
                  />
                ) : (
                  <div className="properties-empty">
                    <p>{t('select_slot_to_edit')}</p>
                  </div>
                )}
              </aside>
            </div>
          )}

          {activeTab === 'graph' && (
            <NavigationGraph
              interfaces={interfaces}
            />
          )}

          {activeTab === 'triggers' && (
            <InventoryTriggers
              triggers={triggers}
              interfaces={interfaces}
              onUpdate={setTriggers}
            />
          )}

          {activeTab === 'test' && (
            <TestMode
              interfaces={interfaces}
              triggers={triggers}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
