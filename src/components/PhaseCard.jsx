import './PhaseCard.css'
import HormoneTooltip from './HormoneTooltip'

function PhaseCard({ phase, daysInCycle, cycleLength }) {
  const progress = (phase.day / cycleLength) * 100

  return (
    <div className="phase-card" style={{ borderColor: phase.color }}>
      <div className="phase-header">
        <div className="phase-icon" style={{ color: phase.color }}>
          {phase.icon}
        </div>
        <div className="phase-info">
          <h3 className="phase-name">{phase.name}</h3>
          <p className="phase-description">{phase.description}</p>
        </div>
      </div>

      <div className="phase-details">
        <div className="cycle-progress">
          <div className="progress-label">
            <span>Day {phase.day} of {cycleLength}</span>
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
          <h4>Current Hormonal State</h4>
          <div className="hormones-grid">
            <div className="hormone-item">
              <HormoneTooltip hormone="estrogen">
                <span className="hormone-label">Estrogen</span>
              </HormoneTooltip>
              <span className="hormone-value" style={{ color: phase.color }}>
                {phase.hormones.estrogen}
              </span>
            </div>
            <div className="hormone-item">
              <HormoneTooltip hormone="progesterone">
                <span className="hormone-label">Progesterone</span>
              </HormoneTooltip>
              <span className="hormone-value" style={{ color: phase.color }}>
                {phase.hormones.progesterone}
              </span>
            </div>
            <div className="hormone-item">
              <HormoneTooltip hormone="testosterone">
                <span className="hormone-label">Testosterone</span>
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

