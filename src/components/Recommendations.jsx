import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPhaseRecommendations, getFertilityInfo } from '../utils/cycleCalculator'
import './Recommendations.css'

function Recommendations({ phase, cycleLength }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const recommendations = getPhaseRecommendations(phase)
  const fertilityInfo = getFertilityInfo(phase, cycleLength)

  if (!recommendations) return null

  const categories = [
    { key: 'work', icon: '💼', title: t('recommendations.workCareer'), color: '#B0E0E6' },
    { key: 'exercise', icon: '🏋️', title: t('recommendations.exerciseFitness'), color: '#98D8C8' },
    { key: 'social', icon: '👥', title: t('recommendations.socialActivities'), color: '#DDA0DD' },
    { key: 'intimacy', icon: '💕', title: t('recommendations.intimacyConnection'), color: '#FFB6C1' }
  ]

  const getLevelBadge = (level) => {
    const badges = {
      peak: { text: t('recommendations.levels.peak'), color: '#F4D03F', emoji: '✨' },
      high: { text: t('recommendations.levels.greatTime'), color: '#98D8C8', emoji: '⚡' },
      'moderate-high': { text: t('recommendations.levels.goodTime'), color: '#B0E0E6', emoji: '👍' },
      moderate: { text: t('recommendations.levels.moderate'), color: '#DDA0DD', emoji: '👌' },
      good: { text: t('recommendations.levels.good'), color: '#B0E0E6', emoji: '👍' },
      'low-moderate': { text: t('recommendations.levels.takeItEasy'), color: '#FFB6C1', emoji: '🌙' },
      low: { text: t('recommendations.levels.restTime'), color: '#FFB6C1', emoji: '🌙' }
    }
    return badges[level] || badges.moderate
  }

  const getFertilityBadge = (level) => {
    const badges = {
      peak: { text: t('recommendations.fertilityLevels.peak'), color: '#F4D03F', emoji: '✨', bgColor: 'rgba(244, 208, 63, 0.15)' },
      'moderate-high': { text: t('recommendations.fertilityLevels.high'), color: '#98D8C8', emoji: '⚡', bgColor: 'rgba(152, 216, 200, 0.15)' },
      moderate: { text: t('recommendations.fertilityLevels.moderate'), color: '#DDA0DD', emoji: '👌', bgColor: 'rgba(221, 160, 221, 0.15)' },
      low: { text: t('recommendations.fertilityLevels.low'), color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' },
      'very-low': { text: t('recommendations.fertilityLevels.veryLow'), color: '#FFB6C1', emoji: '🌙', bgColor: 'rgba(255, 182, 193, 0.15)' },
      'high-risk': { text: t('recommendations.fertilityLevels.highRisk'), color: '#FF9F9F', emoji: '⚠️', bgColor: 'rgba(255, 159, 159, 0.15)' },
      safer: { text: t('recommendations.fertilityLevels.safer'), color: '#98D8C8', emoji: '✓', bgColor: 'rgba(152, 216, 200, 0.15)' }
    }
    return badges[level] || badges.moderate
  }

  return (
    <div className="recommendations">
      <h2 className="recommendations-title">{t('recommendations.title')}</h2>
      <p className="recommendations-subtitle">
        {t('recommendations.subtitle')}
      </p>

      {fertilityInfo && (
        <div className="fertility-section">
          <h3 className="fertility-section-title">{t('recommendations.sexualHealthFertility')}</h3>
          
          <div className="fertility-grid">
            <div className="fertility-card libido-card">
              <div className="fertility-card-header">
                <span className="fertility-icon">🔥</span>
                <h4>{t('recommendations.bestTimeForGreatSex')}</h4>
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
                  <strong>{t('recommendations.bestDays')}</strong> {fertilityInfo.libido.bestDays}
                </div>
                <div className="fertility-note">{fertilityInfo.libido.note}</div>
              </div>
            </div>

            <div className="fertility-card fertility-card-pregnancy">
              <div className="fertility-card-header">
                <span className="fertility-icon">🤰</span>
                <h4>{t('recommendations.bestTimeToGetPregnant')}</h4>
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
                  <strong>{t('recommendations.fertileWindow')}</strong> {fertilityInfo.fertility.bestDays}
                </div>
                <div className="fertility-note">{fertilityInfo.fertility.note}</div>
              </div>
            </div>

            <div className="fertility-card contraception-card">
              <div className="fertility-card-header">
                <span className="fertility-icon">🛡️</span>
                <h4>{t('recommendations.avoidingPregnancy')}</h4>
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
                  <strong>{t('recommendations.safetyLevel')}</strong> {fertilityInfo.contraception.safety}
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
                <h4>{t('recommendations.bestFor')}</h4>
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
                  {t('recommendations.viewFullWorkoutReport')}
                </button>
              )}

              {category.key === 'work' && (
                <button
                  className="work-career-report-button"
                  onClick={() => navigate('/work-career-report', { 
                    state: { phase, cycleLength } 
                  })}
                >
                  {t('recommendations.viewFullWorkCareerReport')}
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

