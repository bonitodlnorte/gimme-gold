import { useTranslation } from 'react-i18next'
import { translatePhaseName, translatePhaseDescription } from '../utils/phaseTranslations'
import './PhaseCard.css'
import HormoneTooltip from './HormoneTooltip'

function PhaseCard({ phase, daysInCycle, cycleLength }) {
  const { t } = useTranslation()
  const progress = (phase.day / cycleLength) * 100

  return (
    <div className="phase-card" style={{ borderColor: phase.color }}>
      <div className="phase-header">
        <div className="phase-icon" style={{ color: phase.color }}>
          {phase.icon}
        </div>
        <div className="phase-info">
          <h3 className="phase-name">{translatePhaseName(phase.name, t)}</h3>
          <p className="phase-description">{translatePhaseDescription(phase.name, t)}</p>
        </div>
      </div>

      <div className="phase-details">
        <div className="cycle-progress">
          <div className="progress-label">
            <span>{t('common.day')} {phase.day} {t('common.of')} {cycleLength}</span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progress}%`,
                backgroundColor: phase.color
              }}
            />
          </div>
        </div>

        <div className="hormones-info">
          <h4>{t('phaseCard.currentHormonalState')}</h4>
          <div className="hormones-grid">
            <div className="hormone-item">
              <HormoneTooltip hormone="estrogen">
                <span className="hormone-label">{t('phaseCard.estrogen')}</span>
              </HormoneTooltip>
              <span className="hormone-value" style={{ color: phase.color }}>
                {phase.hormones.estrogen}
              </span>
            </div>
            <div className="hormone-item">
              <HormoneTooltip hormone="progesterone">
                <span className="hormone-label">{t('phaseCard.progesterone')}</span>
              </HormoneTooltip>
              <span className="hormone-value" style={{ color: phase.color }}>
                {phase.hormones.progesterone}
              </span>
            </div>
            <div className="hormone-item">
              <HormoneTooltip hormone="testosterone">
                <span className="hormone-label">{t('phaseCard.testosterone')}</span>
              </HormoneTooltip>
              <span className="hormone-value" style={{ color: phase.color }}>
                {phase.hormones.testosterone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhaseCard

