import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  getCycleHistory,
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
  }

  const handleEditSave = (id) => {
    updateCycleEntry(id, { note: editNote })
    setEditingId(null)
    setEditNote('')
    loadHistory()
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditNote('')
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
                      <div className="date-display">
                        {format(entry.date, 'EEEE, MMMM d, yyyy')}
                      </div>
                    </td>
                    <td className="length-cell">
                      <span className="cycle-length-badge">{entry.cycleLength} days</span>
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
                          <div className="note-actions">
                            <button
                              className="save-button"
                              onClick={() => handleEditSave(entry.id)}
                            >
                              ✓ Save
                            </button>
                            <button
                              className="cancel-button"
                              onClick={handleEditCancel}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="note-display">
                          {entry.note || (
                            <span className="no-note">No note</span>
                          )}
                          <button
                            className="edit-note-button"
                            onClick={() => handleEditStart(entry)}
                            aria-label="Edit note"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(entry.id)}
                        aria-label="Delete entry"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default CycleLog

