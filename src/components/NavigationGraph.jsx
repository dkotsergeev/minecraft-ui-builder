import { useMemo } from 'react'
import { useLang } from '../i18n/LanguageContext'
import './NavigationGraph.css'

function NavigationGraph({ interfaces }) {
  const { t } = useLang()
  const graph = useMemo(() => {
    const edges = []
    const nodes = new Map()

    interfaces.forEach(iface => {
      nodes.set(iface.id, {
        id: iface.id,
        name: iface.name,
        rows: iface.rows
      })

      iface.slots.forEach(slot => {
        if (slot.actionType === 'open_interface' && slot.targetInterface) {
          edges.push({
            from: iface.id,
            to: slot.targetInterface,
            label: `Slot ${slot.index}`,
            displayName: slot.displayName || 'Button'
          })
        }
      })
    })

    return { nodes, edges }
  }, [interfaces])

  const getConnectedInterfaces = (id) => {
    return graph.edges
      .filter(e => e.from === id)
      .map(e => e.to)
  }

  const getBackConnections = (id) => {
    return graph.edges
      .filter(e => e.to === id)
      .map(e => e.from)
  }

  return (
    <div className="navigation-graph">
      <div className="graph-info">
        <h3>{t('navigation_graph')}</h3>
      </div>

      <div className="graph-container">
        {interfaces.length === 0 ? (
          <div className="empty-state">No interfaces</div>
        ) : (
          <div className="graph-list">
            {interfaces.map(iface => (
              <div key={iface.id} className="graph-node">
                <div className="node-header">
                  <h4>{iface.name}</h4>
                  <span className="node-rows">{iface.rows}r × 9c</span>
                </div>

                {iface.slots.length > 0 && (
                  <div className="node-slots">
                    <strong>Buttons:</strong>
                    <ul>
                      {iface.slots.map(slot => (
                        <li key={slot.index}>
                          <span className="slot-num">#{slot.index}</span>
                          <span className="slot-name">{slot.displayName || slot.texture || '(empty)'}</span>
                          {slot.actionType === 'open_interface' && (
                            <span className="action-badge">
                              → {graph.nodes.get(slot.targetInterface)?.name || 'Unknown'}
                            </span>
                          )}
                          {slot.actionType === 'close' && (
                            <span className="action-badge close">Close</span>
                          )}
                          {slot.actionType === 'custom_action' && (
                            <span className="action-badge custom">⚙ {slot.customAction}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {iface.slots.length === 0 && (
                  <div className="node-empty">No buttons configured</div>
                )}

                {getBackConnections(iface.id).length > 0 && (
                  <div className="node-incoming">
                    <strong>Accessible from:</strong>
                    <ul>
                      {getBackConnections(iface.id).map(fromId => (
                        <li key={fromId}>← {graph.nodes.get(fromId)?.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="graph-stats">
        <div className="stat">
          <span className="label">Total Interfaces:</span>
          <span className="value">{interfaces.length}</span>
        </div>
        <div className="stat">
          <span className="label">Total Connections:</span>
          <span className="value">{graph.edges.filter(e => e.from !== e.to).length}</span>
        </div>
        <div className="stat">
          <span className="label">Total Buttons:</span>
          <span className="value">{interfaces.reduce((sum, i) => sum + i.slots.length, 0)}</span>
        </div>
      </div>
    </div>
  )
}

export default NavigationGraph
