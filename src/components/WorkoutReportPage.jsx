import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCyclePhase } from '../utils/cycleCalculator'
import WorkoutPerformance from './WorkoutPerformance'
import './WorkoutReportPage.css'

function WorkoutReportPage() {
  const { t } = useTranslation()
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
            {t('common.back')}
          </button>
          <h1>{t('workoutReport.title')}</h1>
        </div>
        <div className="no-data-message">
          <p>{t('workoutReport.noData')}</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            {t('workoutReport.goToTracker')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-report-page">
      <div className="workout-report-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          {t('common.back')} {t('recommendations.title', { defaultValue: 'to Recommendations' })}
        </button>
        <h1>{t('workoutReport.title')}</h1>
      </div>
      <WorkoutPerformance phase={phase} cycleLength={cycleLength} />
    </div>
  )
}

export default WorkoutReportPage

