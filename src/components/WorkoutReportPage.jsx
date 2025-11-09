import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCyclePhase } from '../utils/cycleCalculator'
import WorkoutPerformance from './WorkoutPerformance'
import './WorkoutReportPage.css'

function WorkoutReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  let { phase, cycleLength } = location.state || {}

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // If no state, try to reconstruct from localStorage (fallback for direct navigation)
  if (!phase) {
    const savedDate = localStorage.getItem('gimmeGold_lastPeriodDate')
    const savedLength = localStorage.getItem('gimmeGold_cycleLength')
    if (savedDate && savedLength) {
      const lastPeriodDate = new Date(savedDate)
      cycleLength = parseInt(savedLength) || 28
      phase = getCyclePhase(lastPeriodDate, cycleLength)
    }
  }

  if (!phase) {
    return (
      <div className="workout-report-page">
        <div className="workout-report-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>🏋️ Workout Performance Report</h1>
        </div>
        <div className="no-data-message">
          <p>No cycle data available. Please set up your cycle tracking first.</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            Go to Cycle Tracker
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-report-page">
      <div className="workout-report-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Recommendations
        </button>
        <h1>🏋️ Full Workout Performance Report</h1>
      </div>
      <WorkoutPerformance phase={phase} cycleLength={cycleLength} />
    </div>
  )
}

export default WorkoutReportPage

