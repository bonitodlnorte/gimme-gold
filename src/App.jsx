import { useState, useEffect } from 'react'
import CycleTracker from './components/CycleTracker'
import PartnerView from './components/PartnerView'
import { getCyclePhase, getDaysInCycle } from './utils/cycleCalculator'
import './App.css'

function App() {
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const saved = localStorage.getItem('gimmeGold_lastPeriodDate')
    return saved ? new Date(saved) : null
  })
  const [isPartnerView, setIsPartnerView] = useState(false)
  const [cycleLength, setCycleLength] = useState(() => {
    const saved = localStorage.getItem('gimmeGold_cycleLength')
    return saved ? parseInt(saved) : 28
  })

  useEffect(() => {
    if (lastPeriodDate) {
      localStorage.setItem('gimmeGold_lastPeriodDate', lastPeriodDate.toISOString())
    }
  }, [lastPeriodDate])

  useEffect(() => {
    localStorage.setItem('gimmeGold_cycleLength', cycleLength.toString())
  }, [cycleLength])

  const handlePeriodStart = (date) => {
    setLastPeriodDate(date)
  }

  const currentPhase = lastPeriodDate ? getCyclePhase(lastPeriodDate, cycleLength) : null
  const daysInCycle = lastPeriodDate ? getDaysInCycle(lastPeriodDate) : 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="gold-text">Gimme</span> Gold
          </h1>
          <p className="app-subtitle">Hormonal Cycle Intelligence</p>
        </div>
        <button 
          className="view-toggle"
          onClick={() => setIsPartnerView(!isPartnerView)}
        >
          {isPartnerView ? '👤 My View' : '👥 Partner View'}
        </button>
      </header>

      <main className="app-main">
        {isPartnerView ? (
          <PartnerView 
            lastPeriodDate={lastPeriodDate}
            cycleLength={cycleLength}
            currentPhase={currentPhase}
            daysInCycle={daysInCycle}
          />
        ) : (
          <CycleTracker
            lastPeriodDate={lastPeriodDate}
            onPeriodStart={handlePeriodStart}
            cycleLength={cycleLength}
            onCycleLengthChange={setCycleLength}
            currentPhase={currentPhase}
            daysInCycle={daysInCycle}
          />
        )}
      </main>
    </div>
  )
}

export default App

