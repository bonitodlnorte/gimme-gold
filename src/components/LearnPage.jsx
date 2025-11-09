import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EducationalContent from './EducationalContent'
import './LearnPage.css'

function LearnPage() {
  const { t } = useTranslation()
  const location = useLocation()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Extract video ID and timestamp from the YouTube URL
  const videoId = 'e2mQOGzHtQc'
  const startTime = 4199 // seconds

  return (
    <div className="learn-page">
      <div className="learn-page-header">
        <h1>{t('learnPage.title')}</h1>
        <p className="learn-page-subtitle">
          {t('learnPage.subtitle')}
        </p>
      </div>

      <div className="video-section">
        <h2>{t('learnPage.videoTitle')}</h2>
        <p className="video-description" dangerouslySetInnerHTML={{
          __html: t('learnPage.videoDescription')
        }} />
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&rel=0`}
            title="Dr. Mindy Pelz - Hormonal Cycle Intelligence"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="youtube-embed"
          ></iframe>
        </div>
        <p className="video-note">
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}&t=${startTime}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link"
          >
            {t('learnPage.watchOnYouTube')}
          </a>
        </p>
      </div>

      <EducationalContent />

      <div className="why-this-matters">
        <h2>{t('learnPage.whyThisMatters')}</h2>
        <div className="matters-grid">
          <div className="matters-card">
            <h3>{t('learnPage.forWomen')}</h3>
            <ul>
              {t('learnPage.womenPoints', { returnObjects: true }).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="matters-card">
            <h3>{t('learnPage.forMenPartners')}</h3>
            <ul>
              {t('learnPage.menPoints', { returnObjects: true }).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="education-note">
          <p dangerouslySetInnerHTML={{
            __html: t('learnPage.educationNote')
          }} />
        </div>
      </div>
    </div>
  )
}

export default LearnPage

