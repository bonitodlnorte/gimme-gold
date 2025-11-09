import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CycleTracker from './components/CycleTracker'
import PartnerView from './components/PartnerView'
import WorkoutReportPage from './components/WorkoutReportPage'
import WorkCareerReportPage from './components/WorkCareerReportPage'
import CycleLogPage from './components/CycleLogPage'
import LearnPage from './components/LearnPage'
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
  const { t, i18n } = useTranslation()
  const [, forceUpdate] = useState(0)
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

  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChanged = () => {
      forceUpdate(prev => prev + 1)
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng)
    i18n.changeLanguage(lng)
  }

  // Debug: Log current language
  useEffect(() => {
    console.log('Current language:', i18n.language)
    console.log('Language switcher should be visible')
  }, [i18n.language])

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
                         !location.pathname.includes('/partner') &&
                         !location.pathname.includes('/cycle-log') &&
                         !location.pathname.includes('/learn')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img 
            src="/images/Gimme Gold logo no text.png" 
            alt={t('app.logoAlt')} 
            className="app-logo"
          />
          <div className="header-text">
            <h1 className="app-title">
              <span className="gold-text">Gimme</span> Gold
            </h1>
            <p className="app-subtitle">{t('app.subtitle')}</p>
          </div>
        </div>
        <div className="header-actions" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          position: 'relative',
          zIndex: 1000
        }}>
          <div className="language-switcher" style={{
            display: 'flex',
            gap: '0.25rem',
            background: '#FFFFFF',
            border: '3px solid #FF0000',
            borderRadius: '12px',
            padding: '0.5rem',
            minWidth: '120px',
            zIndex: 1001,
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            <button
              className={`lang-button ${i18n.language?.startsWith('en') || i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => {
                console.log('Changing to English')
                changeLanguage('en')
              }}
              aria-label="English"
              style={{
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                background: i18n.language?.startsWith('en') || i18n.language === 'en' ? '#F4D03F' : 'transparent',
                color: i18n.language?.startsWith('en') || i18n.language === 'en' ? '#2C2C2C' : '#6B6B6B',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '40px'
              }}
            >
              EN
            </button>
            <button
              className={`lang-button ${i18n.language?.startsWith('es') || i18n.language === 'es' ? 'active' : ''}`}
              onClick={() => {
                console.log('Changing to Spanish')
                changeLanguage('es')
              }}
              aria-label="Español"
              style={{
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                background: i18n.language?.startsWith('es') || i18n.language === 'es' ? '#F4D03F' : 'transparent',
                color: i18n.language?.startsWith('es') || i18n.language === 'es' ? '#2C2C2C' : '#6B6B6B',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '40px'
              }}
            >
              ES
            </button>
          </div>
          {showViewToggle && (
            <button 
              className="view-toggle"
              onClick={() => setIsPartnerView(!isPartnerView)}
            >
              {isPartnerView ? t('app.myView') : t('app.partnerView')}
            </button>
          )}
        </div>
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
            path="/cycle-log" 
            element={
              <CycleLogPage />
            } 
          />
          <Route 
            path="/learn" 
            element={
              <LearnPage />
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
          {t('app.footer')}{' '}
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

