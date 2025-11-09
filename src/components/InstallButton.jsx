import { useState, useEffect } from 'react'
import './InstallButton.css'

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true
    setIsInstalled(isStandalone)

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if not installable and not iOS
  if (!deferredPrompt && !isIOS) {
    return null
  }

  return (
    <div className="install-button-container">
      <button 
        className="install-button"
        onClick={handleInstallClick}
        aria-label="Install app"
      >
        <span className="install-icon">📱</span>
        <span className="install-text">
          {isIOS ? 'Add to Home Screen' : 'Install App'}
        </span>
      </button>

      {showIOSInstructions && (
        <div className="ios-instructions">
          <button 
            className="close-instructions"
            onClick={() => setShowIOSInstructions(false)}
            aria-label="Close instructions"
          >
            ×
          </button>
          <h3>📱 Add to Home Screen</h3>
          <ol>
            <li>Tap the <strong>Share</strong> button <span className="ios-icon">📤</span> at the bottom of your screen</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right corner</li>
            <li>Enjoy Gimme Gold as an app! 🎉</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default InstallButton

