import { useState } from 'react'
import './HormoneTooltip.css'

const hormoneInfo = {
  estrogen: {
    name: 'Estrogen',
    description: 'A primary female sex hormone that plays a crucial role in the menstrual cycle and overall health.',
    systems: 'Regulates reproductive system, brain function, bone health, cardiovascular system, and skin health.',
    rising: 'When rising: You may feel more energetic, confident, and mentally sharp. Mood improves, verbal skills enhance, and you feel more social and optimistic.',
    falling: 'When falling: Energy may decrease, mood can become more introspective, and you may feel less confident or more sensitive.'
  },
  progesterone: {
    name: 'Progesterone',
    description: 'A hormone that prepares the body for pregnancy and helps maintain the uterine lining.',
    systems: 'Regulates reproductive system, sleep quality, mood stability, and supports pregnancy if it occurs.',
    rising: 'When rising: You may feel calmer, more focused, and introspective. Sleep quality improves, and you have better sustained attention for deep work.',
    falling: 'When falling: You may feel more alert and energetic, but also potentially more anxious or restless. This signals the body to prepare for menstruation.'
  },
  testosterone: {
    name: 'Testosterone',
    description: 'A hormone present in both women and men, though in different amounts. In women, it supports energy, libido, and assertiveness.',
    systems: 'Regulates libido, muscle mass, bone density, energy levels, confidence, and assertiveness.',
    rising: 'When rising: You may feel more confident, assertive, and competitive. Libido increases, energy peaks, and you feel more motivated to take on challenges.',
    falling: 'When falling: You may feel less driven, more introspective, and prefer quieter activities. Energy for high-intensity activities decreases.'
  }
}

function HormoneTooltip({ hormone, children }) {
  const [isVisible, setIsVisible] = useState(false)
  const info = hormoneInfo[hormone]

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
              aria-label="Close tooltip"
            >
              ×
            </button>
          </div>
          <div className="tooltip-content">
            <p className="tooltip-description">{info.description}</p>
            <div className="tooltip-section">
              <strong>Regulates:</strong>
              <p>{info.systems}</p>
            </div>
            <div className="tooltip-section">
              <strong>When Rising:</strong>
              <p>{info.rising}</p>
            </div>
            <div className="tooltip-section">
              <strong>When Falling:</strong>
              <p>{info.falling}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HormoneTooltip

