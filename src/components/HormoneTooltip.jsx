import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './HormoneTooltip.css'

function HormoneTooltip({ hormone, children }) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  
  const getHormoneInfo = (hormoneName) => {
    return {
      name: t(`hormoneTooltip.${hormoneName}.name`),
      description: t(`hormoneTooltip.${hormoneName}.description`),
      systems: t(`hormoneTooltip.${hormoneName}.systems`),
      rising: t(`hormoneTooltip.${hormoneName}.rising`),
      falling: t(`hormoneTooltip.${hormoneName}.falling`)
    }
  }
  
  const info = getHormoneInfo(hormone)

  if (!info) return children

  return (
    <div 
      className="hormone-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(!isVisible)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="hormone-tooltip" role="tooltip">
          <div className="tooltip-header">
            <h4>{info.name}</h4>
            <button 
              className="tooltip-close"
              onClick={() => setIsVisible(false)}
              aria-label={t('hormoneTooltip.close')}
            >
              ×
            </button>
          </div>
          <div className="tooltip-content">
            <p className="tooltip-description">{info.description}</p>
            <div className="tooltip-section">
              <strong>{t('hormoneTooltip.regulates')}</strong>
              <p>{info.systems}</p>
            </div>
            <div className="tooltip-section">
              <strong>{t('hormoneTooltip.whenRising')}</strong>
              <p>{info.rising}</p>
            </div>
            <div className="tooltip-section">
              <strong>{t('hormoneTooltip.whenFalling')}</strong>
              <p>{info.falling}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HormoneTooltip

