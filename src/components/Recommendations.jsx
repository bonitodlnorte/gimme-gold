import { useNavigate } from 'react-router-dom'
import { getPhaseRecommendations, getFertilityInfo } from '../utils/cycleCalculator'
import './Recommendations.css'

function Recommendations({ phase, cycleLength }) {
  const navigate = useNavigate()
  const recommendations = getPhaseRecommendations(phase)
  const fertilityInfo = getFertilityInfo(phase, cycleLength)

  if (!recommendations) return null

  const categories = [
    { key: 'work', icon: '💼', title: 'Work & Career', color: '#B0E0E6' },
    { key: 'exercise', icon: '🏋️', title: 'Exercise & Fitness', color: '#98D8C8' },
    { key: 'social', icon: '👥', title: 'Social Activities', color: '#DDA0DD' },
    { key: 'intimacy', icon: '💕', title: 'Intimacy & Connection', color: '#FFB6C1' }
  ]

  const getLevelBadge = (level) => {
    const badges = {
      peak: { text: 'PEAK TIME', color: '#F4D03F', emoji: '✨' },
      high: { text: 'Great Time', color: '#98D8C8', emoji: '⚡' },
      'moderate-high': { text: 'Good Time', color: '#B0E0E6', emoji: '👍' },
      moderate: { text: 'Moderate', color: '#DDA0DD', emoji: '👌' },
      good: { text: 'Good', color: '#B0E0E6', emoji: '👍' },
      'low-moderate': { text: 'Take It Easy', color: '#FFB6C1', emoji: '🌙' },
      low: { text: 'Rest Time', color: '#FFB6C1', emoji: '🌙' }
    }
    return badges[level] || badges.moderate
  }

  const getFertilityBadge = (level) => {
    const badges = {
      peak: { text: 'PEAK', color: '#F4D03F', emoji: '✨', bgColor: 'rgba(244, 208, 63, 0.15)' },
      'moderate-high': { text: 'HIGH', color: '#98D8C8', emoji: '⚡', bgColor: 'rgba(152, 216, 200, 0.15)' },
      moderate: { text: 'MODERATE', color: '#DDA0DD', emoji: '👌', bgColor: 'rgba(221, 160, 221, 0.15)' },
      low: { text: 'LOW', color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' },
      'very-low': { text: 'VERY LOW', color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' },
      'high-risk': { text: 'HIGH RISK', color: '#FF9F9F', emoji: '⚠️', bgColor: 'rgba(255, 159, 159, 0.15)' },
      safer: { text: 'SAFER', color: '#98D8C8', emoji: '✓', bgColor: 'rgba(152, 216, 200, 0.15)' }
    }
    return badges[level] || badges.moderate
  }

  return (
    <div className="recommendations">
      <h2 className="recommendations-title">Your Personalized Recommendations</h2>
      <p className="recommendations-subtitle">
        Based on your current hormonal phase, here's how to optimize your activities
      </p>

      {fertilityInfo && (
        <div className="fertility-section">
          <h3 className="fertility-section-title">💕 Sexual Health & Fertility</h3>
          
          <div className="fertility-grid">
            <div className="fertility-card libido-card">
              <div className="fertility-card-header">
                <span className="fertility-icon">🔥</span>
                <h4>Best Time for Great Sex</h4>
                <span 
                  className="fertility-badge"
                  style={{
                    backgroundColor: getFertilityBadge(fertilityInfo.libido.level).bgColor,
                    color: getFertilityBadge(fertilityInfo.libido.level).color,
                    borderColor: getFertilityBadge(fertilityInfo.libido.level).color
                  }}
                >
                  {getFertilityBadge(fertilityInfo.libido.level).emoji} {getFertilityBadge(fertilityInfo.libido.level).text}
                </span>
              </div>
              <p className="fertility-description">{fertilityInfo.libido.description}</p>
              <div className="fertility-details">
                <div className="fertility-detail-item">
                  <strong>Best Days:</strong> {fertilityInfo.libido.bestDays}
                </div>
                <div className="fertility-note">{fertilityInfo.libido.note}</div>
              </div>
            </div>

            <div className="fertility-card fertility-card-pregnancy">
              <div className="fertility-card-header">
                <span className="fertility-icon">🤰</span>
                <h4>Best Time to Get Pregnant</h4>
                <span 
                  className="fertility-badge"
                  style={{
                    backgroundColor: getFertilityBadge(fertilityInfo.fertility.level).bgColor,
                    color: getFertilityBadge(fertilityInfo.fertility.level).color,
                    borderColor: getFertilityBadge(fertilityInfo.fertility.level).color
                  }}
                >
                  {getFertilityBadge(fertilityInfo.fertility.level).emoji} {fertilityInfo.fertility.pregnancyRisk}
                </span>
              </div>
              <p className="fertility-description">{fertilityInfo.fertility.description}</p>
              <div className="fertility-details">
                <div className="fertility-detail-item">
                  <strong>Fertile Window:</strong> {fertilityInfo.fertility.bestDays}
                </div>
                <div className="fertility-note">{fertilityInfo.fertility.note}</div>
              </div>
            </div>

            <div className="fertility-card contraception-card">
              <div className="fertility-card-header">
                <span className="fertility-icon">🛡️</span>
                <h4>Avoiding Pregnancy</h4>
                <span 
                  className="fertility-badge"
                  style={{
                    backgroundColor: getFertilityBadge(fertilityInfo.contraception.level).bgColor,
                    color: getFertilityBadge(fertilityInfo.contraception.level).color,
                    borderColor: getFertilityBadge(fertilityInfo.contraception.level).color
                  }}
                >
                  {getFertilityBadge(fertilityInfo.contraception.level).emoji} {fertilityInfo.contraception.safety}
                </span>
              </div>
              <p className="fertility-description">{fertilityInfo.contraception.description}</p>
              <div className="fertility-details">
                <div className="fertility-detail-item">
                  <strong>Safety Level:</strong> {fertilityInfo.contraception.safety}
                </div>
                <div className="fertility-note">{fertilityInfo.contraception.note}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="recommendations-grid">
        {categories.map(category => {
          const rec = recommendations[category.key]
          if (!rec) return null

          const badge = getLevelBadge(rec.level)

          return (
            <div key={category.key} className="recommendation-card">
              <div className="recommendation-header">
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-info">
                  <h3>{category.title}</h3>
                  <span 
                    className="level-badge"
                    style={{ 
                      backgroundColor: `${badge.color}20`,
                      color: badge.color,
                      borderColor: badge.color
                    }}
                  >
                    {badge.emoji} {badge.text}
                  </span>
                </div>
              </div>

              <p className="recommendation-description">{rec.description}</p>

              <div className="best-for">
                <h4>Best For:</h4>
                <ul>
                  {rec.bestFor.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {category.key === 'exercise' && (
                <button
                  className="workout-report-button"
                  onClick={() => navigate('/workout-report', { 
                    state: { phase, cycleLength } 
                  })}
                >
                  🏋️ View Full Workout Performance Report →
                </button>
              )}

              {category.key === 'work' && (
                <button
                  className="work-career-report-button"
                  onClick={() => navigate('/work-career-report', { 
                    state: { phase, cycleLength } 
                  })}
                >
                  💼 View Full Work & Career Performance Report →
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Recommendations

