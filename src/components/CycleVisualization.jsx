import { addDays, format } from 'date-fns'
import { getFertilityInfo } from '../utils/cycleCalculator'
import './CycleVisualization.css'

function CycleVisualization({ currentPhase, cycleLength, daysInCycle, lastPeriodDate }) {
  if (!lastPeriodDate) return null

  const phases = [
    { name: 'Power Phase 1', days: [1, 10], color: '#B0E0E6', icon: '⚡' },
    { name: 'Manifestation', days: [11, 15], color: '#F4D03F', icon: '✨' },
    { name: 'Power Phase 2', days: [16, 19], color: '#98D8C8', icon: '🎯' },
    { name: 'Nurture Phase', days: [20, cycleLength], color: '#FFB6C1', icon: '🌙' }
  ]

  // Get libido levels for each phase
  const getLibidoLevel = (phaseName) => {
    const phase = { name: phaseName }
    const fertilityInfo = getFertilityInfo(phase, cycleLength)
    return fertilityInfo?.libido?.level || 'low'
  }

  // Determine if a day has high libido
  const getLibidoForDay = (day) => {
    if (day >= 1 && day <= 10) {
      const level = getLibidoLevel('Power Phase 1')
      return level === 'moderate-high' ? 1 : 0
    } else if (day >= 11 && day <= 15) {
      const level = getLibidoLevel('Manifestation Phase')
      return level === 'peak' ? 2 : 0
    } else if (day >= 16 && day <= 19) {
      const level = getLibidoLevel('Power Phase 2')
      return level === 'moderate' ? 1 : 0
    }
    return 0
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
                title={phase.name}
              >
                <span className="phase-segment-icon">{phase.icon}</span>
                <span className="phase-segment-label">{phase.name}</span>
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
        
        {/* Libido indicators */}
        <div className="libido-indicators">
          {Array.from({ length: cycleLength }, (_, i) => i + 1).map(day => {
            const libidoLevel = getLibidoForDay(day)
            if (libidoLevel > 0) {
              return (
                <div 
                  key={`libido-${day}`} 
                  className="libido-marker" 
                  style={{ left: `${((day - 1) / cycleLength) * 100}%` }}
                  title={`High libido - Day ${day}`}
                >
                  {libidoLevel === 2 ? '🌶️🌶️' : '🌶️'}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

export default CycleVisualization

