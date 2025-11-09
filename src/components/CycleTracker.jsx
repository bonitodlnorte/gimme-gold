import { useState } from 'react'
import { format } from 'date-fns'
import PhaseCard from './PhaseCard'
import Recommendations from './Recommendations'
import CycleVisualization from './CycleVisualization'
import EducationalContent from './EducationalContent'
import WorkoutPerformance from './WorkoutPerformance'
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
      </div>

      {currentPhase && (
        <>
          <PhaseCard phase={currentPhase} daysInCycle={daysInCycle} cycleLength={cycleLength} />
          <CycleVisualization 
            currentPhase={currentPhase} 
            cycleLength={cycleLength}
            daysInCycle={daysInCycle}
          />
          <WorkoutPerformance phase={currentPhase} cycleLength={cycleLength} />
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

