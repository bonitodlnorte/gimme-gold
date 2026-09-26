import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  hasStoredData,
  wasExported,
  buildExport,
  exportFileName,
  markExported
} from '../utils/dataExport'
import './ExportBanner.css'

const DISMISS_KEY = 'gimmeGold_exportBannerDismissed'

function isDismissedThisSession() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function ExportBanner() {
  const { t } = useTranslation()
  const location = useLocation()
  const [status, setStatus] = useState(() =>
    hasStoredData() && !wasExported() && !isDismissedThisSession() ? 'idle' : 'hidden'
  )

  // The shared partner view belongs to someone else's data
  if (status === 'hidden' || location.pathname.startsWith('/partner')) return null

  const json = () => JSON.stringify(buildExport(), null, 2)

  const finish = (method) => {
    markExported()
    setStatus(method === 'copy' ? 'copied' : 'saved')
    setTimeout(() => setStatus('hidden'), 4000)
  }

  const handleSave = async () => {
    const content = json()
    const file = new File([content], exportFileName(), { type: 'application/json' })

    // On phones the share sheet lets the user send it to Files, iCloud, WhatsApp or email
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t('exportBanner.shareTitle') })
        finish('file')
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('error')
      }
      return
    }

    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    finish('file')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json())
      finish('copy')
    } catch {
      setStatus('error')
    }
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Without sessionStorage it just stays hidden until reload
    }
    setStatus('hidden')
  }

  if (status === 'saved' || status === 'copied') {
    return (
      <div className="export-banner export-banner--saved" role="status">
        <p className="export-banner-title">
          {t(status === 'copied' ? 'exportBanner.copiedTitle' : 'exportBanner.savedTitle')}
        </p>
        <p className="export-banner-text">
          {t(status === 'copied' ? 'exportBanner.copiedText' : 'exportBanner.savedText')}
        </p>
      </div>
    )
  }

  return (
    <div className="export-banner" role="region" aria-label={t('exportBanner.title')}>
      <div className="export-banner-copy">
        <p className="export-banner-title">{t('exportBanner.title')}</p>
        <p className="export-banner-text">{t('exportBanner.text')}</p>
        {status === 'error' && (
          <p className="export-banner-error">{t('exportBanner.error')}</p>
        )}
      </div>
      <div className="export-banner-actions">
        <button className="export-banner-primary" onClick={handleSave}>
          {t('exportBanner.save')}
        </button>
        <button className="export-banner-secondary" onClick={handleCopy}>
          {t('exportBanner.copy')}
        </button>
        <button className="export-banner-dismiss" onClick={handleDismiss}>
          {t('exportBanner.later')}
        </button>
      </div>
    </div>
  )
}

export default ExportBanner
