import { useState } from 'react'
import { format, addDays } from 'date-fns'
import PhaseCard from './PhaseCard'
import Recommendations from './Recommendations'
import CycleVisualization from './CycleVisualization'
import EducationalContent from './EducationalContent'
import './CycleTracker.css'

function CycleTracker({ 
  lastPeriodDate, 
  onPeriodStart, 
  cycleLength, 
  onCycleLengthChange,
  currentPhase,
  daysInCycle 
}) {
  const [showEducation, setShowEducation] = useState(false)

  const handleDateChange = (e) => {
    const date = new Date(e.target.value)
    onPeriodStart(date)
  }

  return (
    <div className="cycle-tracker">
      <div className="tracker-header">
        <h2>Your Cycle Tracker</h2>
        <button 
          className="education-toggle"
          onClick={() => setShowEducation(!showEducation)}
        >
          {showEducation ? '📚 Hide Info' : '📚 Learn About Phases'}
        </button>
      </div>

      {showEducation && <EducationalContent />}

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="period-date">Last Period Start Date</label>
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
          <label htmlFor="cycle-length">Cycle Length (days)</label>
          <input
            id="cycle-length"
            type="number"
            min="21"
            max="35"
            value={cycleLength}
            onChange={(e) => onCycleLengthChange(parseInt(e.target.value))}
            className="number-input"
          />
        </div>

        {lastPeriodDate && (
          <div className="next-period-info">
            <h4>📅 Next Period Expected</h4>
            <p className="next-period-date">
              {format(addDays(lastPeriodDate, cycleLength), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="next-period-days">
              In approximately {cycleLength - daysInCycle} day{cycleLength - daysInCycle !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {currentPhase && (
        <>
          <PhaseCard phase={currentPhase} daysInCycle={daysInCycle} cycleLength={cycleLength} />
          <CycleVisualization 
            currentPhase={currentPhase} 
            cycleLength={cycleLength}
            daysInCycle={daysInCycle}
          />
          <div className="share-section">
            <h3 className="share-title">📤 Share Partner View</h3>
            <p className="share-description">
              Share a link to the Partner View with your partner, boss, or colleague so they can understand your cycle and support you better.
            </p>
            <button
              className="share-button whatsapp-share"
              onClick={() => {
                const shareUrl = `${window.location.origin}/partner?date=${format(lastPeriodDate, 'yyyy-MM-dd')}&length=${cycleLength}`
                const message = `Check out my cycle info to understand how to support me better: ${shareUrl}`
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, '_blank')
              }}
            >
              📱 Share via WhatsApp
            </button>
            <button
              className="share-button copy-link"
              onClick={async (e) => {
                const shareUrl = `${window.location.origin}/partner?date=${format(lastPeriodDate, 'yyyy-MM-dd')}&length=${cycleLength}`
                try {
                  await navigator.clipboard.writeText(shareUrl)
                  const button = e.target
                  const originalText = button.textContent
                  button.textContent = '✓ Link Copied!'
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
                  button.textContent = '✓ Link Copied!'
                  setTimeout(() => {
                    button.textContent = originalText
                  }, 2000)
                }
              }}
            >
              📋 Copy Link
            </button>
          </div>
          <Recommendations phase={currentPhase} cycleLength={cycleLength} />
        </>
      )}

      {!lastPeriodDate && (
        <div className="welcome-message">
          <p>👋 Welcome to Gimme Gold!</p>
          <p>Enter the date when your last period started to begin tracking your hormonal cycle and get personalized insights.</p>
        </div>
      )}
    </div>
  )
}

export default CycleTracker

