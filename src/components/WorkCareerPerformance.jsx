import { getWorkCareerPerformance } from '../utils/cycleCalculator'
import './WorkCareerPerformance.css'

function WorkCareerPerformance({ phase, cycleLength }) {
  const workInfo = getWorkCareerPerformance(phase, cycleLength)

  if (!workInfo) return null

  const getPerformanceBadge = (level) => {
    const badges = {
      peak: { text: 'PEAK PERFORMANCE', color: '#F4D03F', emoji: '✨', bgColor: 'rgba(244, 208, 63, 0.15)' },
      high: { text: 'EXCELLENT', color: '#B0E0E6', emoji: '👍', bgColor: 'rgba(176, 224, 230, 0.15)' },
      'low-moderate': { text: 'REST & RECOVERY', color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' }
    }
    return badges[level] || badges.high
  }

  const performanceBadge = getPerformanceBadge(workInfo.performanceLevel)

  return (
    <div className="work-career-performance">
      <div className="work-career-header">
        <h2 className="work-career-title">💼 Work & Career Performance Report</h2>
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

      <p className="work-career-overview">{workInfo.overview}</p>

      <div className="performance-metrics">
        <div className="metric-card">
          <div className="metric-icon">🧠</div>
          <div className="metric-info">
            <div className="metric-label">Cognitive Level</div>
            <div className="metric-value">{workInfo.cognitiveLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-info">
            <div className="metric-label">Communication</div>
            <div className="metric-value">{workInfo.communicationLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-info">
            <div className="metric-label">Decision Making</div>
            <div className="metric-value">{workInfo.decisionMakingLevel}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🎨</div>
          <div className="metric-info">
            <div className="metric-label">Creativity</div>
            <div className="metric-value">{workInfo.creativityLevel}</div>
          </div>
        </div>
      </div>

      <div className="hormonal-factors">
        <h3 className="section-title">Hormonal Factors Affecting Work Performance</h3>
        <div className="hormones-grid">
          <div className="hormone-factor">
            <strong>Estrogen:</strong> {workInfo.hormonalFactors.estrogen}
          </div>
          <div className="hormone-factor">
            <strong>Progesterone:</strong> {workInfo.hormonalFactors.progesterone}
          </div>
          <div className="hormone-factor">
            <strong>Testosterone:</strong> {workInfo.hormonalFactors.testosterone}
          </div>
          <div className="hormone-factor">
            <strong>Cortisol:</strong> {workInfo.hormonalFactors.cortisol}
          </div>
        </div>
      </div>

      <div className="recommended-activities">
        <h3 className="section-title">Recommended Work Activities</h3>
        <div className="activities-grid">
          {workInfo.recommendedActivities.map((activity, index) => (
            <div key={index} className="activity-card">
              <div className="activity-card-header">
                <h4 className="activity-type">{activity.type}</h4>
                <span className="activity-timing">{activity.timing}</span>
              </div>
              <div className="activity-details">
                <div className="activity-detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{activity.duration}</span>
                </div>
              </div>
              <div className="activity-focus">
                <strong>Focus:</strong> {activity.focus}
              </div>
              <div className="activity-list">
                <strong>Best Activities:</strong>
                <ul>
                  {activity.activities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="activity-why">
                <strong>Why:</strong> {activity.why}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="performance-expectations">
        <h3 className="section-title">Performance Expectations</h3>
        <div className="expectations-grid">
          <div className="expectation-item">
            <span className="expectation-label">Planning:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.planning}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Meetings:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.meetings}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Creativity:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.creativity}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Decision Making:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.decisionMaking}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Presentations:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.presentations}</span>
          </div>
          <div className="expectation-item">
            <span className="expectation-label">Negotiations:</span>
            <span className="expectation-value">{workInfo.performanceExpectations.negotiations}</span>
          </div>
        </div>
      </div>

      <div className="work-tips-section">
        <div className="tips-column">
          <h3 className="section-title">💡 Pro Tips</h3>
          <ul className="tips-list">
            {workInfo.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="tips-column">
          <h3 className="section-title">⚠️ Things to Avoid</h3>
          <ul className="avoid-list">
            {workInfo.avoid.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WorkCareerPerformance

