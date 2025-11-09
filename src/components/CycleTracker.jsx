import { useState, useEffect } from 'react'
import { format, addDays, differenceInDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PhaseCard from './PhaseCard'
import Recommendations from './Recommendations'
import CycleVisualization from './CycleVisualization'
import { getCycleHistory, addCycleEntry, calculateAverageCycleLength } from '../utils/cycleHistory'
import './CycleTracker.css'

function CycleTracker({ 
  lastPeriodDate, 
  onPeriodStart, 
  cycleLength, 
  onCycleLengthChange,
  currentPhase,
  daysInCycle 
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [recordNote, setRecordNote] = useState('')
  const [recordDate, setRecordDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [averageCycleLength, setAverageCycleLength] = useState(null)

  // Update cycle length to average when component loads or history changes
  useEffect(() => {
    const updateCycleLengthFromAverage = () => {
      const history = getCycleHistory()
      if (history.length > 0) {
        // Get current period date to calculate the most recent entry's cycle length
        const savedDate = localStorage.getItem('gimmeGold_lastPeriodDate')
        let currentDate = null
        if (savedDate) {
          currentDate = new Date(savedDate)
        }
        
        // Sort by date (most recent first)
        const sortedHistory = [...history].sort((a, b) => b.date - a.date)
        
        // Calculate cycle length for the most recent entry using current period date
        const historyWithCurrentPeriod = sortedHistory.map((entry, index) => {
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
        
        const average = calculateAverageCycleLength(historyWithCurrentPeriod)
        setAverageCycleLength(average)
        // Only auto-update if cycle length hasn't been manually set
        // Check if cycle length matches a recent average (within 1 day)
        if (average && Math.abs(cycleLength - average) > 1) {
          // User has manually set it, don't auto-update
        } else if (average && average !== cycleLength) {
          onCycleLengthChange(Math.round(average))
        }
      } else {
        setAverageCycleLength(null)
      }
    }

    updateCycleLengthFromAverage()
    
    // Listen for storage changes (when cycle log is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'gimmeGold_cycleHistory') {
        updateCycleLengthFromAverage()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(updateCycleLengthFromAverage, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [cycleLength, onCycleLengthChange])

  const handleDateChange = (e) => {
    const date = new Date(e.target.value)
    onPeriodStart(date)
  }

  const handleRecordNewPeriod = () => {
    if (!lastPeriodDate) {
      alert(t('cycleTracker.pleaseSetPeriodDate'))
      return
    }
    setRecordDate(format(new Date(), 'yyyy-MM-dd'))
    setShowRecordDialog(true)
  }

  const confirmRecordNewPeriod = () => {
    const newPeriodDate = new Date(recordDate)
    newPeriodDate.setHours(0, 0, 0, 0) // Reset time to start of day
    
    // Store the previous period date before updating
    const previousPeriodDate = new Date(lastPeriodDate)
    previousPeriodDate.setHours(0, 0, 0, 0)
    
    // Calculate actual cycle length from previous period to new period date
    const actualCycleLength = differenceInDays(newPeriodDate, previousPeriodDate)
    
    // Validate cycle length is reasonable (between 15 and 45 days)
    if (actualCycleLength < 15 || actualCycleLength > 45) {
      alert(t('cycleTracker.unusualCycleLength', { days: actualCycleLength }))
      return
    }
    
    // Add to cycle history with the previous period date (cycle length calculated automatically)
    addCycleEntry(previousPeriodDate, recordNote)
    
    // Update to new period date
    onPeriodStart(newPeriodDate)
    
    // Update cycle length to the average of all recorded cycles
    // Wait a bit for the history to be saved, then recalculate
    setTimeout(() => {
      const history = getCycleHistory()
      if (history.length > 0) {
        // Sort by date (most recent first)
        const sortedHistory = [...history].sort((a, b) => b.date - a.date)
        
        // Calculate cycle length for the most recent entry using new period date
        const historyWithCurrentPeriod = sortedHistory.map((entry, index) => {
          if (index === 0 && entry.cycleLength === null) {
            const currentPeriodDate = new Date(newPeriodDate)
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
        
        const newAverage = calculateAverageCycleLength(historyWithCurrentPeriod)
        if (newAverage) {
          onCycleLengthChange(Math.round(newAverage))
        }
      }
    }, 100)
    
    setShowRecordDialog(false)
    setRecordNote('')
    setRecordDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="cycle-tracker">
      <div className="tracker-header">
        <h2>{t('cycleTracker.title')}</h2>
        <div className="header-actions">
          <button 
            className="cycle-log-button"
            onClick={() => navigate('/cycle-log')}
          >
            {t('cycleTracker.viewCycleLog')}
          </button>
          <button 
            className="education-toggle"
            onClick={() => navigate('/learn')}
          >
            {t('cycleTracker.learnAboutPhases')}
          </button>
        </div>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="period-date">{t('cycleTracker.lastPeriodStartDate')}</label>
          <input
            id="period-date"
            type="date"
            value={lastPeriodDate ? format(lastPeriodDate, 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="date-input"
          />
          {lastPeriodDate && (
            <p className="date-display">
              {format(lastPeriodDate, 'EEEE, MMMM d, yyyy')}
            </p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="cycle-length">{t('cycleTracker.cycleLength')}</label>
          <div className="cycle-length-input-wrapper">
            <input
              id="cycle-length"
              type="number"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => onCycleLengthChange(parseInt(e.target.value))}
              className="number-input"
            />
            {averageCycleLength && (
              <button
                className="set-average-button"
                onClick={() => onCycleLengthChange(Math.round(averageCycleLength))}
                title={t('cycleTracker.setToAverage') + `: ${averageCycleLength} ${t('common.days')} (${t('cycleLog.basedOnLatest')})`}
              >
                {t('cycleTracker.setToAverage')} ({Math.round(averageCycleLength)})
              </button>
            )}
          </div>
          {averageCycleLength && (
            <p className="cycle-length-note">
              {t('cycleTracker.averageNote', { average: averageCycleLength.toFixed(1) })}
            </p>
          )}
        </div>

        {lastPeriodDate && (
          <div className="input-group next-period-group">
            <label>📅 {t('cycleTracker.nextPeriodExpected')}</label>
            <div className="next-period-content">
              <p className="next-period-date">
                {format(addDays(lastPeriodDate, cycleLength), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="next-period-days">
                {t('cycleTracker.inApproximately', { days: cycleLength - daysInCycle, count: cycleLength - daysInCycle })}
              </p>
              <button
                className="record-period-button"
                onClick={handleRecordNewPeriod}
              >
                {t('cycleTracker.registerNewPeriod')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showRecordDialog && (
        <div className="record-dialog-overlay" onClick={() => setShowRecordDialog(false)}>
          <div className="record-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{t('cycleTracker.recordNewPeriod')}</h3>
            <p className="dialog-info">
              {t('cycleTracker.recordDialogInfo')}
            </p>
            <div className="dialog-date-section">
              <label htmlFor="record-date">{t('cycleTracker.periodStartDate')}</label>
              <input
                id="record-date"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="dialog-date-input"
              />
              {recordDate && (
                <p className="dialog-date-display">
                  {format(new Date(recordDate), 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="dialog-note-section">
              <label htmlFor="record-note">{t('cycleTracker.addNoteOptional')}</label>
              <textarea
                id="record-note"
                value={recordNote}
                onChange={(e) => setRecordNote(e.target.value)}
                placeholder={t('cycleTracker.notePlaceholder')}
                rows="3"
                className="dialog-note-input"
              />
            </div>
            <div className="dialog-actions">
              <button
                className="dialog-cancel-button"
                onClick={() => {
                  setShowRecordDialog(false)
                  setRecordNote('')
                  setRecordDate(format(new Date(), 'yyyy-MM-dd'))
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="dialog-confirm-button"
                onClick={confirmRecordNewPeriod}
              >
                {t('cycleTracker.recordPeriod')}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentPhase && (
        <>
          <PhaseCard phase={currentPhase} daysInCycle={daysInCycle} cycleLength={cycleLength} />
          <CycleVisualization 
            currentPhase={currentPhase} 
            cycleLength={cycleLength}
            daysInCycle={daysInCycle}
            lastPeriodDate={lastPeriodDate}
          />
          <div className="share-section">
            <h3 className="share-title">{t('cycleTracker.sharePartnerView')}</h3>
            <p className="share-description">
              {t('cycleTracker.shareDescription')}
            </p>
            <button
              className="share-button whatsapp-share"
              onClick={() => {
                const shareUrl = `${window.location.origin}/partner?date=${format(lastPeriodDate, 'yyyy-MM-dd')}&length=${cycleLength}`
                const message = t('cycleTracker.shareMessage', { url: shareUrl })
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, '_blank')
              }}
            >
              {t('cycleTracker.shareViaWhatsApp')}
            </button>
            <button
              className="share-button copy-link"
              onClick={async (e) => {
                const shareUrl = `${window.location.origin}/partner?date=${format(lastPeriodDate, 'yyyy-MM-dd')}&length=${cycleLength}`
                try {
                  await navigator.clipboard.writeText(shareUrl)
                  const button = e.target
                  const originalText = button.textContent
                  button.textContent = t('cycleTracker.linkCopied')
                  button.style.background = 'var(--accent-green)'
                  button.style.borderColor = 'var(--accent-green)'
                  button.style.color = 'white'
                  setTimeout(() => {
                    button.textContent = originalText
                    button.style.background = ''
                    button.style.borderColor = ''
                    button.style.color = ''
                  }, 2000)
                } catch (err) {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea')
                  textArea.value = shareUrl
                  document.body.appendChild(textArea)
                  textArea.select()
                  document.execCommand('copy')
                  document.body.removeChild(textArea)
                  const button = e.target
                  const originalText = button.textContent
                  button.textContent = t('cycleTracker.linkCopied')
                  setTimeout(() => {
                    button.textContent = originalText
                  }, 2000)
                }
              }}
            >
              {t('cycleTracker.copyLink')}
            </button>
          </div>
          <Recommendations phase={currentPhase} cycleLength={cycleLength} />
        </>
      )}

      {!lastPeriodDate && (
        <div className="welcome-message">
          <p>{t('cycleTracker.welcome')}</p>
          <p>{t('cycleTracker.welcomeMessage')}</p>
        </div>
      )}
    </div>
  )
}

export default CycleTracker

