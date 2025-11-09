import { useTranslation } from 'react-i18next'
import { getWorkoutPerformance } from '../utils/cycleCalculator'
import './WorkoutPerformance.css'

function WorkoutPerformance({ phase, cycleLength }) {
  const { t } = useTranslation()
  const workoutInfo = getWorkoutPerformance(phase, cycleLength)

  if (!workoutInfo) return null

  const getPerformanceBadge = (level) => {
    const badges = {
      peak: { text: t('workoutReport.performanceMetrics.peak', { defaultValue: 'PEAK PERFORMANCE' }), color: '#F4D03F', emoji: '✨', bgColor: 'rgba(244, 208, 63, 0.15)' },
      'moderate-high': { text: t('workoutReport.performanceMetrics.building', { defaultValue: 'BUILDING' }), color: '#98D8C8', emoji: '⚡', bgColor: 'rgba(152, 216, 200, 0.15)' },
      high: { text: t('workoutReport.performanceMetrics.excellent', { defaultValue: 'EXCELLENT' }), color: '#B0E0E6', emoji: '👍', bgColor: 'rgba(176, 224, 230, 0.15)' },
      'low-moderate': { text: t('workoutReport.performanceMetrics.restRecovery', { defaultValue: 'REST & RECOVERY' }), color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' }
    }
    return badges[level] || badges.high
  }

  const performanceBadge = getPerformanceBadge(workoutInfo.performanceLevel)

  return (
    <div className="workout-performance">
      <div className="workout-header">
        <h2 className="workout-title">{t('workoutReport.title')}</h2>
        <div 
          className="performance-badge-large"
          style={{
            backgroundColor: performanceBadge.bgColor,
            color: performanceBadge.color,
            borderColor: performanceBadge.color
          }}
        >
          {performanceBadge.emoji} {performanceBadge.text}
        </div>
      </div>

      <p className="workout-overview">{workoutInfo.overview}</p>

      <div className="performance-metrics">
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-info">
            <div className="metric-label">{t('workoutReport.performanceMetrics.energyLevel')}</div>
            <div className="metric-value">{workoutInfo.energyLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💪</div>
          <div className="metric-info">
            <div className="metric-label">{t('workoutReport.performanceMetrics.strength')}</div>
            <div className="metric-value">{workoutInfo.strengthLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏃</div>
          <div className="metric-info">
            <div className="metric-label">{t('workoutReport.performanceMetrics.endurance')}</div>
            <div className="metric-value">{workoutInfo.enduranceLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔄</div>
          <div className="metric-info">
            <div className="metric-label">{t('workoutReport.performanceMetrics.recovery')}</div>
            <div className="metric-value">{workoutInfo.recoverySpeed}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-info">
            <div className="metric-label">{t('workoutReport.performanceMetrics.injuryRisk')}</div>
            <div className="metric-value">{workoutInfo.injuryRisk}</div>
          </div>
        </div>
      </div>

      <div className="hormonal-factors">
        <h3 className="section-title">{t('workoutReport.hormonalFactors')}</h3>
        <div className="hormones-grid">
          <div className="hormone-factor">
            <strong>{t('phaseCard.estrogen')}:</strong> {workoutInfo.hormonalFactors.estrogen}
          </div>
          <div className="hormone-factor">
            <strong>{t('phaseCard.progesterone')}:</strong> {workoutInfo.hormonalFactors.progesterone}
          </div>
          <div className="hormone-factor">
            <strong>{t('phaseCard.testosterone')}:</strong> {workoutInfo.hormonalFactors.testosterone}
          </div>
          <div className="hormone-factor">
            <strong>Cortisol:</strong> {workoutInfo.hormonalFactors.cortisol}
          </div>
        </div>
      </div>

      <div className="recommended-workouts">
        <h3 className="section-title">{t('workoutReport.recommendedWorkouts')}</h3>
        <div className="workouts-grid">
          {workoutInfo.recommendedWorkouts.map((workout, index) => (
            <div key={index} className="workout-card">
              <div className="workout-card-header">
                <h4 className="workout-type">{workout.type}</h4>
                <span className="workout-intensity">{workout.intensity}</span>
              </div>
              <div className="workout-details">
                <div className="workout-detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{workout.duration}</span>
                </div>
                <div className="workout-detail-item">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">{workout.frequency}</span>
                </div>
              </div>
              <div className="workout-focus">
                <strong>Focus:</strong> {workout.focus}
              </div>
              <div className="workout-exercises">
                <strong>Best Exercises:</strong>
                <ul>
                  {workout.exercises.map((exercise, idx) => (
                    <li key={idx}>{exercise}</li>
                  ))}
                </ul>
              </div>
              <div className="workout-why">
                <strong>Why:</strong> {workout.why}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="performance-expectations">
        <h3 className="section-title">Performance Expectations</h3>
        <div className="expectations-grid">
          <div className="expectation-item">
            <span className="expectation-label">Strength:</span>
            <span className="expectation-value">{workoutInfo.performanceExpectations.strength}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Endurance:</span>
            <span className="expectation-value">{workoutInfo.performanceExpectations.endurance}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Speed:</span>
            <span className="expectation-value">{workoutInfo.performanceExpectations.speed}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Power:</span>
            <span className="expectation-value">{workoutInfo.performanceExpectations.power}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Recovery:</span>
            <span className="expectation-value">{workoutInfo.performanceExpectations.recovery}</span>
          </div>
        </div>
      </div>

      <div className="workout-tips-section">
        <div className="tips-column">
          <h3 className="section-title">💡 Pro Tips</h3>
          <ul className="tips-list">
            {workoutInfo.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="tips-column">
          <h3 className="section-title">⚠️ Things to Avoid</h3>
          <ul className="avoid-list">
            {workoutInfo.avoid.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WorkoutPerformance

