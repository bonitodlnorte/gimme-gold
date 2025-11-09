import { addDays, format } from 'date-fns'
import { getFertilityInfo } from '../utils/cycleCalculator'
import './CycleVisualization.css'

function CycleVisualization({ currentPhase, cycleLength, daysInCycle, lastPeriodDate }) {
  if (!lastPeriodDate) return null

  const phases = [
    { name: 'Power Phase 1', displayName: 'Power Phase 1', days: [1, 10], color: '#B0E0E6', icon: '⚡' },
    { name: 'Manifestation Phase', displayName: 'Manifestation', days: [11, 15], color: '#F4D03F', icon: '✨' },
    { name: 'Power Phase 2', displayName: 'Power Phase 2', days: [16, 19], color: '#98D8C8', icon: '🎯' },
    { name: 'Nurture Phase', displayName: 'Nurture Phase', days: [20, cycleLength], color: '#FFB6C1', icon: '🌙' }
  ]

  // Get libido levels for each phase
  const getLibidoLevel = (phaseName) => {
    const phase = { name: phaseName }
    const fertilityInfo = getFertilityInfo(phase, cycleLength)
    return fertilityInfo?.libido?.level || 'low'
  }

  // Get libido indicator for each phase
  const getLibidoIndicator = (phaseName) => {
    const level = getLibidoLevel(phaseName)
    if (level === 'peak') return '🌶️🌶️'
    if (level === 'moderate-high' || level === 'moderate') return '🌶️'
    if (level === 'low') return '💀'
    return null
  }

  const getPhaseWidth = (startDay, endDay) => {
    return ((endDay - startDay + 1) / cycleLength) * 100
  }

  const getPhasePosition = (startDay) => {
    return ((startDay - 1) / cycleLength) * 100
  }

  const currentDayPosition = ((daysInCycle - 1) / cycleLength) * 100

  return (
    <div className="cycle-visualization">
      <h3>Your Cycle Overview</h3>
      <div className="cycle-timeline">
        <div className="phases-container">
          {phases.map((phase, index) => {
            const width = getPhaseWidth(phase.days[0], phase.days[1])
            const position = getPhasePosition(phase.days[0])
            const isActive = daysInCycle >= phase.days[0] && daysInCycle <= phase.days[1]

            return (
              <div
                key={index}
                className={`phase-segment ${isActive ? 'active' : ''}`}
                style={{
                  left: `${position}%`,
                  width: `${width}%`,
                  backgroundColor: `${phase.color}40`,
                  borderColor: phase.color
                }}
                title={phase.displayName}
              >
                <span className="phase-segment-icon">{phase.icon}</span>
                <span className="phase-segment-label">
                  {phase.displayName}
                  {getLibidoIndicator(phase.name) && (
                    <span className="libido-indicator">{getLibidoIndicator(phase.name)}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
        <div 
          className="current-day-marker"
          style={{ left: `${currentDayPosition}%` }}
        >
          <div className="marker-dot"></div>
          <div className="marker-label">Today (Day {daysInCycle})</div>
        </div>
        <div className="cycle-days">
          {/* Phase transition dates */}
          {(() => {
            const transitions = [1, 11, 16, 20]
            if (cycleLength > 20) transitions.push(cycleLength)
            return transitions.map((day) => {
              const date = addDays(lastPeriodDate, day - 1)
              const isPhaseTransition = [1, 11, 16, 20].includes(day)
              return (
                <div 
                  key={`date-${day}`} 
                  className={`day-marker ${isPhaseTransition ? 'phase-transition' : ''}`} 
                  style={{ left: `${((day - 1) / cycleLength) * 100}%` }}
                >
                  <span className="day-number">{day}</span>
                  <span className="day-date">{format(date, 'MMM d')}</span>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}

export default CycleVisualization

