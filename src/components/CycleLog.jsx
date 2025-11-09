import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCycleLength, setEditCycleLength] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEntryDate, setNewEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newEntryCycleLength, setNewEntryCycleLength] = useState('')
  const [newEntryNote, setNewEntryNote] = useState('')
  const [averageLength, setAverageLength] = useState(null)
  const [trend, setTrend] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const cycleHistory = getCycleHistory()
    setHistory(cycleHistory)
    setAverageLength(calculateAverageCycleLength(cycleHistory))
    setTrend(calculateCycleTrend(cycleHistory))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this cycle entry?')) {
      deleteCycleEntry(id)
      loadHistory()
    }
  }

  const handleEditStart = (entry) => {
    setEditingId(entry.id)
    setEditNote(entry.note || '')
    setEditDate(format(entry.date, 'yyyy-MM-dd'))
    setEditCycleLength(entry.cycleLength.toString())
  }

  const handleEditSave = (id) => {
    const updates = {
      note: editNote,
      date: editDate,
      cycleLength: parseInt(editCycleLength)
    }
    
    // Validate cycle length
    if (updates.cycleLength < 15 || updates.cycleLength > 45) {
      alert('Cycle length must be between 15 and 45 days')
      return
    }
    
    updateCycleEntry(id, updates)
    setEditingId(null)
    setEditNote('')
    setEditDate('')
    setEditCycleLength('')
    loadHistory()
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditNote('')
    setEditDate('')
    setEditCycleLength('')
  }

  const handleAddEntry = () => {
    if (!newEntryDate || !newEntryCycleLength) {
      alert('Please fill in both date and cycle length')
      return
    }
    
    const cycleLength = parseInt(newEntryCycleLength)
    if (cycleLength < 15 || cycleLength > 45) {
      alert('Cycle length must be between 15 and 45 days')
      return
    }
    
    addCycleEntry(newEntryDate, cycleLength, newEntryNote)
    setShowAddDialog(false)
    setNewEntryDate(format(new Date(), 'yyyy-MM-dd'))
    setNewEntryCycleLength('')
    setNewEntryNote('')
    loadHistory()
  }

  return (
    <div className="cycle-log">
      <div className="cycle-log-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>📊 Cycle Log</h1>
        <p className="cycle-log-subtitle">Track your cycle history and patterns</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>No Cycle History Yet</h2>
          <p>Start tracking by recording your periods in the main tracker.</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            Go to Cycle Tracker
          </button>
        </div>
      ) : (
        <>
          <div className="cycle-statistics">
            <div className="stat-card">
              <div className="stat-label">Average Cycle Length</div>
              <div className="stat-value">{averageLength} days</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Trend</div>
              <div className="stat-value trend-value">
                <span className="trend-icon">{getTrendIcon(trend)}</span>
                {getTrendText(trend)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Cycles Recorded</div>
              <div className="stat-value">{history.length}</div>
            </div>
          </div>

          <div className="cycle-log-table-container">
            <div className="table-header-actions">
              <button
                className="add-entry-button"
                onClick={() => setShowAddDialog(true)}
              >
                ➕ Add Past Cycle
              </button>
            </div>
            <table className="cycle-log-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cycle Length</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
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
                      {editingId === entry.id ? (
                        <div className="length-edit">
                          <input
                            type="number"
                            min="15"
                            max="45"
                            value={editCycleLength}
                            onChange={(e) => setEditCycleLength(e.target.value)}
                            className="length-edit-input"
                          />
                          <span> days</span>
                        </div>
                      ) : (
                        <span className="cycle-length-badge">{entry.cycleLength} days</span>
                      )}
                    </td>
                    <td className="note-cell">
                      {editingId === entry.id ? (
                        <div className="note-edit">
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Add a note..."
                            rows="2"
                            className="note-input"
                          />
                        </div>
                      ) : (
                        <div className="note-display">
                          {entry.note || (
                            <span className="no-note">No note</span>
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
                <h3>➕ Add Past Cycle</h3>
                <div className="add-dialog-section">
                  <label htmlFor="new-entry-date">Period Start Date:</label>
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
                  <label htmlFor="new-entry-length">Cycle Length (days):</label>
                  <input
                    id="new-entry-length"
                    type="number"
                    min="15"
                    max="45"
                    value={newEntryCycleLength}
                    onChange={(e) => setNewEntryCycleLength(e.target.value)}
                    placeholder="e.g., 28"
                    className="add-dialog-input"
                  />
                </div>
                <div className="add-dialog-section">
                  <label htmlFor="new-entry-note">Note (optional):</label>
                  <textarea
                    id="new-entry-note"
                    value={newEntryNote}
                    onChange={(e) => setNewEntryNote(e.target.value)}
                    placeholder="Add a note..."
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
                      setNewEntryCycleLength('')
                      setNewEntryNote('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="dialog-confirm-button"
                    onClick={handleAddEntry}
                  >
                    ✓ Add Entry
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

