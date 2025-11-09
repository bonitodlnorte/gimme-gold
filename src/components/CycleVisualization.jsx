import './CycleVisualization.css'

function CycleVisualization({ currentPhase, cycleLength, daysInCycle }) {
  const phases = [
    { name: 'Power Phase 1', days: [1, 10], color: '#B0E0E6', icon: '⚡' },
    { name: 'Manifestation', days: [11, 15], color: '#F4D03F', icon: '✨' },
    { name: 'Power Phase 2', days: [16, 19], color: '#98D8C8', icon: '🎯' },
    { name: 'Nurture Phase', days: [20, cycleLength], color: '#FFB6C1', icon: '🌙' }
  ]

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
          {Array.from({ length: cycleLength }, (_, i) => i + 1).map(day => {
            if (day % 5 === 0 || day === 1 || day === cycleLength) {
              return (
                <div key={day} className="day-marker" style={{ left: `${((day - 1) / cycleLength) * 100}%` }}>
                  <span>{day}</span>
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

