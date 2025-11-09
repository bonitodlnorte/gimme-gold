import { useTranslation } from 'react-i18next'
import { translatePhaseName, translatePhaseDescription } from '../utils/phaseTranslations'
import './EducationalContent.css'
import HormoneTooltip from './HormoneTooltip'

function EducationalContent() {
  const { t } = useTranslation()
  const phaseKeys = ['powerPhase1', 'manifestationPhase', 'powerPhase2', 'nurturePhase']
  const phaseIcons = ['⚡', '✨', '🎯', '🌙']
  const phaseColors = ['#B0E0E6', '#F4D03F', '#98D8C8', '#FFB6C1']
  const phaseNames = ['Power Phase 1', 'Manifestation Phase', 'Power Phase 2', 'Nurture Phase']
  
  const phases = phaseKeys.map((key, index) => ({
    name: phaseNames[index],
    days: t(`educationalContent.phases.${key}.days`),
    icon: phaseIcons[index],
    color: phaseColors[index],
    hormones: {
      estrogen: t(`phases.${key}.hormones.estrogen`),
      progesterone: t(`phases.${key}.hormones.progesterone`),
      testosterone: t(`phases.${key}.hormones.testosterone`)
    },
    description: t(`educationalContent.phases.${key}.description`),
    whatHappens: t(`educationalContent.phases.${key}.whatHappens`, { returnObjects: true }),
    whyItMatters: t(`educationalContent.phases.${key}.whyItMatters`)
  }))

  return (
    <div className="educational-content">
      <div className="education-header">
        <h3>{t('educationalContent.title')}</h3>
        <p className="education-intro">
          {t('educationalContent.intro')}
        </p>
      </div>

      <div className="phases-education">
        {phases.map((phase, index) => (
          <div key={index} className="phase-education-card" style={{ borderColor: phase.color }}>
            <div className="phase-education-header">
              <div className="phase-education-icon" style={{ color: phase.color }}>
                {phase.icon}
              </div>
              <div>
                <h4>{translatePhaseName(phase.name, t)}</h4>
                <span className="phase-days">{phase.days}</span>
              </div>
            </div>

            <p className="phase-description-text">{phase.description}</p>

            <div className="hormones-breakdown">
              <h5>{t('educationalContent.hormonalState')}</h5>
              <div className="hormones-list">
                <div className="hormone-badge">
                  <HormoneTooltip hormone="estrogen">
                    <span className="hormone-name">{t('phaseCard.estrogen')}:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.estrogen}</strong>
                </div>
                <div className="hormone-badge">
                  <HormoneTooltip hormone="progesterone">
                    <span className="hormone-name">{t('phaseCard.progesterone')}:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.progesterone}</strong>
                </div>
                <div className="hormone-badge">
                  <HormoneTooltip hormone="testosterone">
                    <span className="hormone-name">{t('phaseCard.testosterone')}:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.testosterone}</strong>
                </div>
              </div>
            </div>

            <div className="what-happens">
              <h5>{t('educationalContent.whatsHappening')}</h5>
              <ul>
                {Array.isArray(phase.whatHappens) ? phase.whatHappens.map((item, idx) => (
                  <li key={idx}>{item}</li>
                )) : null}
              </ul>
            </div>

            <div className="why-matters">
              <h5>{t('educationalContent.whyThisMatters')}</h5>
              <p>{phase.whyItMatters}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="key-takeaways">
        <h4>{t('educationalContent.keyTakeaways')}</h4>
        <ul>
          {(() => {
            try {
              const translationResult = t('educationalContent.takeaways', { returnObjects: true })
              // Ensure we have a valid array
              const itemsArray = Array.isArray(translationResult) ? translationResult : []
              
              if (itemsArray.length === 0) {
                return null
              }
              
              return itemsArray.map((listItem, idx) => {
                // Safely convert to string
                const content = listItem != null ? String(listItem) : ''
                return <li key={idx} dangerouslySetInnerHTML={{ __html: content }} />
              })
            } catch (err) {
              console.error('Error loading takeaways:', err)
              return null
            }
          })()}
        </ul>
      </div>
    </div>
  )
}

export default EducationalContent
