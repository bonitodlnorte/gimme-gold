import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getCycleHistory,
  addCycleEntry,
  deleteCycleEntry,
  updateCycleEntry,
  calculateAverageCycleLength,
  calculateCycleTrend,
  getTrendIcon,
  getTrendText
} from '../utils/cycleHistory'
import './CycleLog.css'

function CycleLog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEntryDate, setNewEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newEntryNote, setNewEntryNote] = useState('')
  const [averageLength, setAverageLength] = useState(null)
  const [trend, setTrend] = useState(null)
  const [currentPeriodDate, setCurrentPeriodDate] = useState(null)

  useEffect(() => {
    loadHistory()
    // Get current period date from localStorage
    const savedDate = localStorage.getItem('gimmeGold_lastPeriodDate')
    if (savedDate) {
      setCurrentPeriodDate(new Date(savedDate))
    }
  }, [])

  const loadHistory = () => {
    const cycleHistory = getCycleHistory()
    // Get current period date
    const savedDate = localStorage.getItem('gimmeGold_lastPeriodDate')
    let currentDate = null
    if (savedDate) {
      currentDate = new Date(savedDate)
      setCurrentPeriodDate(currentDate)
    }
    
    // Sort by date (most recent first) to ensure correct order
    const sortedHistory = [...cycleHistory].sort((a, b) => b.date - a.date)
    
    // Calculate cycle length for the most recent entry using current period date
    const historyWithCurrentPeriod = sortedHistory.map((entry, index) => {
      // If this is the most recent entry (first after sorting) and we have a current period date
      if (index === 0 && currentDate && entry.cycleLength === null) {
        const currentPeriodDate = new Date(currentDate)
        currentPeriodDate.setHours(0, 0, 0, 0)
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        const diffTime = currentPeriodDate - entryDate
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > 0 && diffDays < 100) {
          return { ...entry, cycleLength: diffDays }
        }
      }
      return entry
    })
    
    setHistory(historyWithCurrentPeriod)
    setAverageLength(calculateAverageCycleLength(historyWithCurrentPeriod))
    setTrend(calculateCycleTrend(historyWithCurrentPeriod))
  }

  const handleDelete = (id) => {
    if (window.confirm(t('cycleLog.deleteConfirm'))) {
      deleteCycleEntry(id)
      loadHistory()
    }
  }

  const handleEditStart = (entry) => {
    setEditingId(entry.id)
    setEditNote(entry.note || '')
    setEditDate(format(entry.date, 'yyyy-MM-dd'))
  }

  const handleEditSave = (id) => {
    const updates = {
      note: editNote,
      date: editDate
    }
    
    updateCycleEntry(id, updates)
    // Reload to recalculate cycle lengths
    setTimeout(() => {
      loadHistory()
    }, 100)
    setEditingId(null)
    setEditNote('')
    setEditDate('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditNote('')
    setEditDate('')
  }

  const handleAddEntry = () => {
    if (!newEntryDate) {
      alert(t('cycleLog.pleaseFillDate'))
      return
    }
    
    addCycleEntry(newEntryDate, newEntryNote)
    setShowAddDialog(false)
    setNewEntryDate(format(new Date(), 'yyyy-MM-dd'))
    setNewEntryNote('')
    loadHistory()
  }

  return (
    <div className="cycle-log">
      <div className="cycle-log-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <h1>{t('cycleLog.title')}</h1>
        <p className="cycle-log-subtitle">{t('cycleLog.subtitle')}</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>{t('cycleLog.noHistory')}</h2>
          <p>{t('cycleLog.noHistoryMessage')}</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            {t('cycleLog.goToTracker')}
          </button>
        </div>
      ) : (
        <>
          <div className="cycle-statistics">
            <div className="stat-card">
              <div className="stat-label">{t('cycleLog.averageCycleLength')}</div>
              <div className="stat-value">{averageLength} {t('common.days')}</div>
              <div className="stat-note">{t('cycleLog.basedOnLatest')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t('cycleLog.trend')}</div>
              <div className="stat-value trend-value">
                <span className="trend-icon">{getTrendIcon(trend)}</span>
                {getTrendText(trend)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t('cycleLog.totalCyclesRecorded')}</div>
              <div className="stat-value">{history.length}</div>
            </div>
          </div>

          <div className="cycle-log-table-container">
            <div className="table-header-actions">
              <button
                className="add-entry-button"
                onClick={() => setShowAddDialog(true)}
              >
                {t('cycleLog.addPastCycle')}
              </button>
            </div>
            <table className="cycle-log-table">
              <thead>
                <tr>
                  <th>{t('cycleLog.date')}</th>
                  <th>{t('cycleLog.cycleLength')}</th>
                  <th>{t('cycleLog.note')}</th>
                  <th>{t('cycleLog.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {currentPeriodDate && (
                  <tr className="current-period-row">
                    <td className="date-cell">
                      <div className="date-display">
                        {format(currentPeriodDate, 'EEEE, MMMM d, yyyy')}
                        <span className="current-badge">{t('common.current')}</span>
                      </div>
                    </td>
                    <td className="length-cell">
                      <span className="cycle-length-badge empty">—</span>
                    </td>
                    <td className="note-cell">
                      <div className="note-display">
                        <span className="no-note">{t('cycleLog.currentPeriod')}</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <span className="no-actions">—</span>
                    </td>
                  </tr>
                )}
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="date-cell">
                      {editingId === entry.id ? (
                        <div className="date-edit">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            max={format(new Date(), 'yyyy-MM-dd')}
                            className="date-edit-input"
                          />
                          {editDate && (
                            <p className="date-edit-display">
                              {format(new Date(editDate), 'EEEE, MMMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="date-display">
                          {format(entry.date, 'EEEE, MMMM d, yyyy')}
                        </div>
                      )}
                    </td>
                    <td className="length-cell">
                      {entry.cycleLength !== null ? (
                        <span className="cycle-length-badge">{entry.cycleLength} {t('common.days')}</span>
                      ) : (
                        <span className="cycle-length-badge empty">—</span>
                      )}
                    </td>
                    <td className="note-cell">
                      {editingId === entry.id ? (
                        <div className="note-edit">
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder={t('common.addNote')}
                            rows="2"
                            className="note-input"
                          />
                        </div>
                      ) : (
                        <div className="note-display">
                          {entry.note || (
                            <span className="no-note">{t('common.noNote')}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === entry.id ? (
                        <div className="edit-actions">
                          <button
                            className="save-button"
                            onClick={() => handleEditSave(entry.id)}
                            aria-label="Save"
                          >
                            ✓
                          </button>
                          <button
                            className="cancel-button"
                            onClick={handleEditCancel}
                            aria-label="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="edit-entry-button"
                            onClick={() => handleEditStart(entry)}
                            aria-label="Edit entry"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(entry.id)}
                            aria-label="Delete entry"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAddDialog && (
            <div className="add-dialog-overlay" onClick={() => setShowAddDialog(false)}>
              <div className="add-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{t('cycleLog.addDialogTitle')}</h3>
                <div className="add-dialog-section">
                  <label htmlFor="new-entry-date">{t('cycleLog.periodStartDate')}</label>
                  <input
                    id="new-entry-date"
                    type="date"
                    value={newEntryDate}
                    onChange={(e) => setNewEntryDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="add-dialog-input"
                  />
                  {newEntryDate && (
                    <p className="add-dialog-date-display">
                      {format(new Date(newEntryDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="add-dialog-section">
                  <p className="dialog-info">
                    {t('cycleLog.cycleLengthAuto')}
                  </p>
                </div>
                <div className="add-dialog-section">
                  <label htmlFor="new-entry-note">{t('common.addNote')} ({t('common.optional')}):</label>
                  <textarea
                    id="new-entry-note"
                    value={newEntryNote}
                    onChange={(e) => setNewEntryNote(e.target.value)}
                    placeholder={t('common.addNote')}
                    rows="3"
                    className="add-dialog-textarea"
                  />
                </div>
                <div className="add-dialog-actions">
                  <button
                    className="dialog-cancel-button"
                    onClick={() => {
                      setShowAddDialog(false)
                      setNewEntryDate(format(new Date(), 'yyyy-MM-dd'))
                      setNewEntryNote('')
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    className="dialog-confirm-button"
                    onClick={handleAddEntry}
                  >
                    {t('cycleLog.addEntry')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CycleLog

