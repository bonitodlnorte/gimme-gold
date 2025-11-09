import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CycleLog from './CycleLog'
import './CycleLogPage.css'

function CycleLogPage() {
  const location = useLocation()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="cycle-log-page">
      <CycleLog />
    </div>
  )
}

export default CycleLogPage

