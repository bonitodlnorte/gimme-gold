import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { translatePhaseName, translatePhaseDescription } from '../utils/phaseTranslations'
import PhaseCard from './PhaseCard'
import HormoneTooltip from './HormoneTooltip'
import { getPhaseRecommendations } from '../utils/cycleCalculator'
import './PartnerView.css'

function PartnerView({ lastPeriodDate, cycleLength, currentPhase, daysInCycle }) {
  const { t } = useTranslation()
  
  if (!lastPeriodDate || !currentPhase) {
    return (
      <div className="partner-view">
        <div className="partner-welcome">
          <h2>{t('partnerView.title')}</h2>
          <p>{t('partnerView.welcomeMessage')}</p>
          <p className="no-data">{t('partnerView.noData')}</p>
        </div>
      </div>
    )
  }

  const recommendations = getPhaseRecommendations(currentPhase)

  const getCommunicationTips = (phaseName) => {
    const phaseKeyMap = {
      'Power Phase 1': 'powerPhase1',
      'Manifestation Phase': 'manifestationPhase',
      'Power Phase 2': 'powerPhase2',
      'Nurture Phase': 'nurturePhase'
    }
    const key = phaseKeyMap[phaseName] || 'nurturePhase'
    return {
      approach: t(`partnerView.communicationTips.${key}.approach`),
      description: t(`partnerView.communicationTips.${key}.description`),
      do: t(`partnerView.communicationTips.${key}.do`, { returnObjects: true }),
      avoid: t(`partnerView.communicationTips.${key}.avoid`, { returnObjects: true })
    }
  }

  const communicationTips = getCommunicationTips(currentPhase.name)
  const isSensitivePhase = currentPhase.name === 'Nurture Phase'
  
  // Determine if it's the most critical days (last 2-3 days before period)
  const isCriticalDays = isSensitivePhase && currentPhase.day >= (cycleLength - 2)
  const isSuperCautiousPhase = isSensitivePhase && !isCriticalDays

  const getSimpleInstructions = () => {
    if (isCriticalDays) {
      return {
        image: '/images/play-dead-animal.jpeg',
        title: t('partnerView.playDead.title'),
        subtitle: t('partnerView.playDead.subtitle'),
        do: t('partnerView.playDead.do', { returnObjects: true }),
        dont: t('partnerView.playDead.dont', { returnObjects: true })
      }
    } else if (isSuperCautiousPhase) {
      return {
        image: '/images/bomb-squad.jpeg',
        title: t('partnerView.proceedWithCaution.title'),
        subtitle: t('partnerView.proceedWithCaution.subtitle'),
        do: t('partnerView.proceedWithCaution.do', { returnObjects: true }),
        dont: t('partnerView.proceedWithCaution.dont', { returnObjects: true })
      }
    } else if (currentPhase.name === 'Manifestation Phase') {
      return {
        image: null,
        title: t('partnerView.superhero.title'),
        do: t('partnerView.superhero.do', { returnObjects: true }),
        dont: t('partnerView.superhero.dont', { returnObjects: true })
      }
    } else if (currentPhase.name === 'Power Phase 1') {
      return {
        image: null,
        title: t('partnerView.buildingMode.title'),
        do: t('partnerView.buildingMode.do', { returnObjects: true }),
        dont: t('partnerView.buildingMode.dont', { returnObjects: true })
      }
    } else {
      return {
        image: null,
        title: t('partnerView.focusMode.title'),
        do: t('partnerView.focusMode.do', { returnObjects: true }),
        dont: t('partnerView.focusMode.dont', { returnObjects: true })
      }
    }
  }

  const simpleInstructions = getSimpleInstructions()

  return (
    <div className="partner-view">
      <div className="partner-header">
        <h2>{t('partnerView.title')}</h2>
        <p className="partner-subtitle">
          {t('partnerView.subtitle')}
        </p>
      </div>

      <div className="simple-instructions">
        <div className="instructions-content">
          {simpleInstructions.image && (
            <div className="instruction-image-container">
              <img 
                src={simpleInstructions.image} 
                alt={simpleInstructions.title}
                className="instruction-image"
                onError={(e) => {
                  // Fallback if image doesn't load - hide container
                  e.target.parentElement.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="instructions-text">
            <h3 className="instructions-title">{simpleInstructions.title}</h3>
            {isCriticalDays && simpleInstructions.subtitle && (
              <p className="instructions-subtitle">{simpleInstructions.subtitle}</p>
            )}
            {isSuperCautiousPhase && simpleInstructions.subtitle && (
              <p className="instructions-subtitle">{simpleInstructions.subtitle}</p>
            )}
            <div className="instructions-grid">
              <div className="instruction-do">
                <h4>✅ {t('common.do')}</h4>
                <ul>
                  {simpleInstructions.do.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="instruction-dont">
                <h4>❌ {t('common.dont')}</h4>
                <ul>
                  {simpleInstructions.dont.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="partner-info-card">
        <div className="current-status">
          <h3>{t('partnerView.currentStatus')}</h3>
          <p className="status-text" dangerouslySetInnerHTML={{
            __html: t('partnerView.sheIsCurrentlyIn', { 
              phase: translatePhaseName(currentPhase.name, t),
              day: currentPhase.day,
              length: cycleLength
            })
          }} />
          <p className="status-description">{translatePhaseDescription(currentPhase.name, t)}</p>
        </div>
      </div>

      <PhaseCard phase={currentPhase} daysInCycle={daysInCycle} cycleLength={cycleLength} />

      <div className="communication-guide">
        <h3>{t('partnerView.howToApproach')}</h3>
        <div className="approach-badge" style={{ borderColor: currentPhase.color }}>
          <span style={{ color: currentPhase.color }}>{communicationTips.approach}</span>
        </div>
        <p className="approach-description">{communicationTips.description}</p>

        <div className="tips-grid">
          <div className="tips-section do">
            <h4>✅ {t('common.do')}</h4>
            <ul>
              {communicationTips.do.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="tips-section avoid">
            <h4>❌ {t('common.avoid')}</h4>
            <ul>
              {communicationTips.avoid.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="activity-suggestions">
          <h3>{t('partnerView.activitySuggestions')}</h3>
          <p className="suggestions-intro">
            {t('partnerView.suggestionsIntro')}
          </p>
          
          <div className="suggestions-grid">
            {recommendations.work && (
              <div className="suggestion-card">
                <div className="suggestion-icon">💼</div>
                <h4>Work</h4>
                <p>{recommendations.work.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.work.level === 'peak' && '✨ Peak Performance Time'}
                  {recommendations.work.level === 'high' && '⚡ Great Time'}
                  {recommendations.work.level === 'moderate' && '👍 Good Time'}
                  {recommendations.work.level === 'low-moderate' && '🌙 Take It Easy'}
                  {recommendations.work.level === 'low' && '🌙 Rest Time'}
                </div>
              </div>
            )}

            {recommendations.social && (
              <div className="suggestion-card">
                <div className="suggestion-icon">👥</div>
                <h4>Social</h4>
                <p>{recommendations.social.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.social.level === 'peak' && '✨ Peak Social Time'}
                  {recommendations.social.level === 'good' && '👍 Good Time'}
                  {recommendations.social.level === 'moderate' && '👌 Moderate'}
                  {recommendations.social.level === 'low' && '🌙 Prefer Quiet Time'}
                </div>
              </div>
            )}

            {recommendations.intimacy && (
              <div className="suggestion-card">
                <div className="suggestion-icon">💕</div>
                <h4>Intimacy</h4>
                <p>{recommendations.intimacy.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.intimacy.level === 'peak' && '✨ Peak Intimacy Time'}
                  {recommendations.intimacy.level === 'moderate' && '💕 Good Time'}
                  {recommendations.intimacy.level === 'low' && '🌙 Focus on Emotional Support'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hormone-info">
        <h3>{t('partnerView.understandingHormones')}</h3>
        <div className="hormone-explanation">
          <p>
            {t('partnerView.hormoneExplanation')}
          </p>
          <div className="hormone-details">
            <div className="hormone-detail">
              <HormoneTooltip hormone="estrogen">
                <strong>Estrogen:</strong>
              </HormoneTooltip> {currentPhase.hormones.estrogen}
              <span className="hormone-note">
                {currentPhase.hormones.estrogen === 'Peak' && ' - Enhances confidence, verbal skills, and cognitive function'}
                {currentPhase.hormones.estrogen === 'Rising' && ' - Building energy and improving mood'}
                {currentPhase.hormones.estrogen === 'Dropping' && ' - Energy shifting, focus increasing'}
                {currentPhase.hormones.estrogen === 'Low' && ' - Time for rest and recovery'}
              </span>
            </div>
            <div className="hormone-detail">
              <HormoneTooltip hormone="progesterone">
                <strong>Progesterone:</strong>
              </HormoneTooltip> {currentPhase.hormones.progesterone}
              <span className="hormone-note">
                {currentPhase.hormones.progesterone === 'Peak' && ' - Promotes calmness, but may lower energy'}
                {currentPhase.hormones.progesterone === 'Rising' && ' - Increasing focus and introspection'}
                {currentPhase.hormones.progesterone === 'Low' && ' - More active and energetic phase'}
              </span>
            </div>
            <div className="hormone-detail">
              <HormoneTooltip hormone="testosterone">
                <strong>Testosterone:</strong>
              </HormoneTooltip> {currentPhase.hormones.testosterone}
              <span className="hormone-note">
                {currentPhase.hormones.testosterone === 'Surge' && ' - Boosts confidence, libido, and assertiveness'}
                {currentPhase.hormones.testosterone === 'Moderate' && ' - Balanced levels'}
                {currentPhase.hormones.testosterone === 'Low' && ' - More introspective phase'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerView

