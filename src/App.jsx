import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import CycleTracker from './components/CycleTracker'
import PartnerView from './components/PartnerView'
import WorkoutReportPage from './components/WorkoutReportPage'
import WorkCareerReportPage from './components/WorkCareerReportPage'
import InstallButton from './components/InstallButton'
import { getCyclePhase, getDaysInCycle } from './utils/cycleCalculator'
import './App.css'

// Component for shared partner view (reads from URL params)
function SharedPartnerView() {
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date')
  const lengthParam = searchParams.get('length')

  let lastPeriodDate = null
  let cycleLength = 28

  if (dateParam) {
    lastPeriodDate = new Date(dateParam)
  }
  if (lengthParam) {
    cycleLength = parseInt(lengthParam) || 28
  }

  const currentPhase = lastPeriodDate ? getCyclePhase(lastPeriodDate, cycleLength) : null
  const daysInCycle = lastPeriodDate ? getDaysInCycle(lastPeriodDate) : 0

  return (
    <PartnerView 
      lastPeriodDate={lastPeriodDate}
      cycleLength={cycleLength}
      currentPhase={currentPhase}
      daysInCycle={daysInCycle}
    />
  )
}

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

  const location = useLocation()
  const navigate = useNavigate()

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

  // Hide header toggle on report pages and shared partner view
  const showViewToggle = !location.pathname.includes('/workout-report') && 
                         !location.pathname.includes('/work-career-report') && 
                         !location.pathname.includes('/partner')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img 
            src="/images/Gimme Gold logo no text.png" 
            alt="Gimme Gold Logo" 
            className="app-logo"
          />
          <div className="header-text">
            <h1 className="app-title">
              <span className="gold-text">Gimme</span> Gold
            </h1>
            <p className="app-subtitle">Hormonal Cycle Intelligence</p>
          </div>
        </div>
        {showViewToggle && (
          <button 
            className="view-toggle"
            onClick={() => setIsPartnerView(!isPartnerView)}
          >
            {isPartnerView ? '👤 My View' : '👥 Partner View'}
          </button>
        )}
      </header>

      <main className="app-main">
        <Routes>
          <Route 
            path="/workout-report" 
            element={
              <WorkoutReportPage />
            } 
          />
          <Route 
            path="/work-career-report" 
            element={
              <WorkCareerReportPage />
            } 
          />
          <Route 
            path="/partner" 
            element={
              <SharedPartnerView />
            } 
          />
          <Route 
            path="/" 
            element={
              isPartnerView ? (
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
              )
            } 
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          Created with <span className="heart">❤️</span> and AI by{' '}
          <a 
            href="https://www.korokota.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            Korokota.com
          </a>
        </p>
      </footer>

      <InstallButton />
    </div>
  )
}

export default App

