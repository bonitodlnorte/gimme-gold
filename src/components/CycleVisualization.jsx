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

  // Calculate angles for circular visualization
  const getPhaseAngle = (startDay, endDay) => {
    const startAngle = ((startDay - 1) / cycleLength) * 360
    const endAngle = (endDay / cycleLength) * 360
    const angle = endAngle - startAngle
    return { startAngle, endAngle, angle }
  }

  // Current day angle (0 degrees is top, clockwise)
  const currentDayAngle = ((daysInCycle - 1) / cycleLength) * 360 - 90 // -90 to start at top

  // Calculate position for current day marker
  const getCurrentDayPosition = (angle) => {
    const radius = 120 // Outer radius
    const centerX = 150
    const centerY = 150
    const radian = (angle * Math.PI) / 180
    const x = centerX + radius * Math.cos(radian)
    const y = centerY + radius * Math.sin(radian)
    return { x, y }
  }

  const currentPos = getCurrentDayPosition(currentDayAngle)

  return (
    <div className="cycle-visualization">
      <h3>Your Cycle Overview</h3>
      <div className="cycle-circle-container">
        <svg className="cycle-circle" viewBox="0 0 300 300" width="300" height="300">
          {/* Phase arcs */}
          {phases.map((phase, index) => {
            const { startAngle, angle } = getPhaseAngle(phase.days[0], phase.days[1])
            const isActive = daysInCycle >= phase.days[0] && daysInCycle <= phase.days[1]
            const midAngle = startAngle + angle / 2 - 90
            const labelRadius = 100
            const labelX = 150 + labelRadius * Math.cos(midAngle * Math.PI / 180)
            const labelY = 150 + labelRadius * Math.sin(midAngle * Math.PI / 180)
            
            // Calculate arc path
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (startAngle + angle - 90) * Math.PI / 180
            const x1 = 150 + 120 * Math.cos(startRad)
            const y1 = 150 + 120 * Math.sin(startRad)
            const x2 = 150 + 120 * Math.cos(endRad)
            const y2 = 150 + 120 * Math.sin(endRad)
            const largeArc = angle > 180 ? 1 : 0
            
            return (
              <g key={index}>
                <path
                  d={`M 150,150 L ${x1},${y1} A 120,120 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={phase.color}
                  fillOpacity="0.3"
                  stroke={phase.color}
                  strokeWidth={isActive ? "3" : "2"}
                  className={`phase-arc ${isActive ? 'active' : ''}`}
                />
                
                {/* Phase label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="phase-label"
                  fill={isActive ? phase.color : '#666'}
                  fontSize="11"
                  fontWeight={isActive ? "600" : "500"}
                >
                  {phase.icon} {phase.displayName}
                  {getLibidoIndicator(phase.name) && (
                    <tspan dx="4" fontSize="12">{getLibidoIndicator(phase.name)}</tspan>
                  )}
                </text>
              </g>
            )
          })}
          
          {/* Current day marker */}
          <circle
            cx={currentPos.x}
            cy={currentPos.y}
            r="8"
            fill="#F4D03F"
            stroke="#FFF"
            strokeWidth="2"
            className="current-day-dot"
          />
          
          {/* Phase transition markers */}
          {[1, 11, 16, 20, cycleLength].map((day) => {
            if (day > cycleLength) return null
            const angle = ((day - 1) / cycleLength) * 360 - 90
            const x1 = 150 + 120 * Math.cos(angle * Math.PI / 180)
            const y1 = 150 + 120 * Math.sin(angle * Math.PI / 180)
            const x2 = 150 + 130 * Math.cos(angle * Math.PI / 180)
            const y2 = 150 + 130 * Math.sin(angle * Math.PI / 180)
            const date = addDays(lastPeriodDate, day - 1)
            const isPhaseTransition = [1, 11, 16, 20].includes(day)
            
            return (
              <g key={`marker-${day}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isPhaseTransition ? "#F4D03F" : "#999"}
                  strokeWidth={isPhaseTransition ? "2" : "1"}
                />
                <text
                  x={150 + 145 * Math.cos(angle * Math.PI / 180)}
                  y={150 + 145 * Math.sin(angle * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill={isPhaseTransition ? "#F4D03F" : "#666"}
                  fontWeight={isPhaseTransition ? "600" : "400"}
                >
                  {format(date, 'MMM d')}
                </text>
              </g>
            )
          })}
        </svg>
        
        <div className="cycle-legend">
          <div className="current-day-info">
            <span className="current-day-label">Today: Day {daysInCycle}</span>
            <span className="current-day-date">{format(addDays(lastPeriodDate, daysInCycle - 1), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CycleVisualization

