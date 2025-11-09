import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
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

  // Get phase for a specific day in the cycle
  const getPhaseForDay = (dayNumber) => {
    if (dayNumber >= 1 && dayNumber <= 10) return phases[0]
    if (dayNumber >= 11 && dayNumber <= 15) return phases[1]
    if (dayNumber >= 16 && dayNumber <= 19) return phases[2]
    if (dayNumber >= 20 && dayNumber <= cycleLength) return phases[3]
    return null
  }

  // Get libido indicator for a specific day
  const getLibidoIndicator = (dayNumber) => {
    const phase = getPhaseForDay(dayNumber)
    if (!phase) return null
    
    const fertilityInfo = getFertilityInfo(phase, cycleLength)
    const level = fertilityInfo?.libido?.level || 'low'
    
    if (level === 'peak') return '🌶️🌶️'
    if (level === 'moderate-high' || level === 'moderate') return '🌶️'
    if (level === 'low') return '💀'
    return null
  }

  // Calculate which day of the cycle a date falls on
  const getCycleDay = (date) => {
    const diffTime = date - lastPeriodDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    if (diffDays < 1 || diffDays > cycleLength) return null
    return diffDays
  }

  // Calculate next period date
  const nextPeriodDate = addDays(lastPeriodDate, cycleLength)
  
  // Get calendar month to display (current month or month containing cycle start)
  const today = new Date()
  const cycleStartMonth = startOfMonth(lastPeriodDate)
  const currentMonth = startOfMonth(today)
  
  // Show current month if we're in it, otherwise show the month with the cycle start
  const displayMonth = isSameMonth(today, lastPeriodDate) || 
                       today > lastPeriodDate ? currentMonth : cycleStartMonth

  const monthStart = startOfWeek(startOfMonth(displayMonth), { weekStartsOn: 1 }) // Monday
  const monthEnd = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="cycle-visualization">
      <h3>Your Cycle Overview</h3>
      <div className="cycle-calendar-container">
        <div className="calendar-header">
          <h4 className="calendar-month-title">
            {format(displayMonth, 'MMMM yyyy')}
          </h4>
        </div>
        
        <div className="calendar-grid">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const cycleDay = getCycleDay(date)
            const phase = cycleDay ? getPhaseForDay(cycleDay) : null
            const libidoIndicator = cycleDay ? getLibidoIndicator(cycleDay) : null
            const isToday = isSameDay(date, today)
            const isNextPeriod = isSameDay(date, nextPeriodDate)
            const isCurrentMonth = isSameMonth(date, displayMonth)
            const isPhaseTransition = cycleDay && [1, 11, 16, 20].includes(cycleDay)

            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isNextPeriod ? 'next-period' : ''} ${phase ? 'has-phase' : ''} ${isPhaseTransition ? 'phase-transition' : ''}`}
                style={{
                  backgroundColor: phase ? `${phase.color}30` : 'transparent',
                  borderColor: phase ? phase.color : 'transparent'
                }}
              >
                <div className="calendar-day-number">
                  {format(date, 'd')}
                  {isNextPeriod && <span className="next-period-emoji">🩸</span>}
                </div>
                {cycleDay && (
                  <div className="calendar-day-info">
                    <div className="calendar-day-cycle">Day {cycleDay}</div>
                    {libidoIndicator && (
                      <div className="calendar-day-libido">{libidoIndicator}</div>
                    )}
                    {isPhaseTransition && phase && (
                      <div className="calendar-day-phase">{phase.icon} {phase.displayName}</div>
                    )}
                  </div>
                )}
                {isNextPeriod && !cycleDay && (
                  <div className="calendar-day-info">
                    <div className="next-period-label">Next Period</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#B0E0E6' }}></div>
            <span>Power Phase 1</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#F4D03F' }}></div>
            <span>Manifestation</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#98D8C8' }}></div>
            <span>Power Phase 2</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFB6C1' }}></div>
            <span>Nurture Phase</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CycleVisualization
