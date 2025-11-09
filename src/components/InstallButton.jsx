import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './InstallButton.css'

function InstallButton() {
  const { t } = useTranslation()
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
          {isIOS ? t('installButton.addToHomeScreen') : t('installButton.installApp')}
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
          <h3>{t('installButton.title')}</h3>
          <ol>
            {t('installButton.instructions', { returnObjects: true }).map((instruction, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: instruction }} />
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default InstallButton

