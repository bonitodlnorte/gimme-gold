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
      <div className="cycle-bar-container">
        {/* Phase segments bar */}
        <div className="cycle-bar">
          {phases.map((phase, index) => {
            const width = getPhaseWidth(phase.days[0], phase.days[1])
            const position = getPhasePosition(phase.days[0])
            const isActive = daysInCycle >= phase.days[0] && daysInCycle <= phase.days[1]
            const startDate = addDays(lastPeriodDate, phase.days[0] - 1)
            const endDate = addDays(lastPeriodDate, phase.days[1] - 1)

            return (
              <div
                key={index}
                className={`phase-bar-segment ${isActive ? 'active' : ''}`}
                style={{
                  left: `${position}%`,
                  width: `${width}%`,
                  backgroundColor: phase.color,
                  borderColor: phase.color
                }}
              >
                <div className="phase-bar-content">
                  <div className="phase-bar-header">
                    <span className="phase-bar-icon">{phase.icon}</span>
                    <span className="phase-bar-name">{phase.displayName}</span>
                    {getLibidoIndicator(phase.name) && (
                      <span className="phase-bar-libido">{getLibidoIndicator(phase.name)}</span>
                    )}
                  </div>
                  <div className="phase-bar-dates">
                    <span className="phase-date">{format(startDate, 'MMM d')}</span>
                    <span className="phase-date-separator">→</span>
                    <span className="phase-date">{format(endDate, 'MMM d')}</span>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Current day indicator */}
          <div 
            className="current-day-indicator"
            style={{ left: `${currentDayPosition}%` }}
          >
            <div className="current-day-line"></div>
            <div className="current-day-badge">
              <div className="current-day-dot"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Phase transition markers */}
        <div className="phase-transitions">
          {[1, 11, 16, 20, cycleLength].map((day) => {
            if (day > cycleLength) return null
            const date = addDays(lastPeriodDate, day - 1)
            const position = ((day - 1) / cycleLength) * 100
            const isPhaseTransition = [1, 11, 16, 20].includes(day)
            
            return (
              <div
                key={`transition-${day}`}
                className={`transition-marker ${isPhaseTransition ? 'major' : ''}`}
                style={{ left: `${position}%` }}
              >
                <div className="transition-line"></div>
                <div className="transition-label">
                  <span className="transition-day">Day {day}</span>
                  <span className="transition-date">{format(date, 'MMM d')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CycleVisualization

