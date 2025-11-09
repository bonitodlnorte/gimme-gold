import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EducationalContent from './EducationalContent'
import './LearnPage.css'

function LearnPage() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Extract video ID and timestamp from the YouTube URL
  const videoId = 'e2mQOGzHtQc'
  const startTime = 4199 // seconds

  // Get translation arrays safely
  let womenPoints = []
  let menPoints = []
  
  try {
    const womenPointsData = t('learnPage.womenPoints', { returnObjects: true })
    const menPointsData = t('learnPage.menPoints', { returnObjects: true })
    womenPoints = Array.isArray(womenPointsData) ? womenPointsData : []
    menPoints = Array.isArray(menPointsData) ? menPointsData : []
  } catch (error) {
    console.error('Error loading translations:', error)
    // Fallback values if translations fail
    womenPoints = [
      "Understand your body's natural rhythms and work with them, not against them",
      "Plan important activities during your peak performance phases",
      "Honor your need for rest during the Nurture Phase",
      "Make informed decisions about work, relationships, and self-care",
      "Recognize that your cycle is a superpower, not a limitation"
    ]
    menPoints = [
      "Better understand and support the women in your life",
      "Recognize that hormonal changes are natural and powerful",
      "Plan collaborative activities during peak performance phases",
      "Provide understanding and support during rest phases",
      "Build stronger relationships through empathy and knowledge"
    ]
  }

  // Fallback text if translation fails
  const getText = (key, fallback) => {
    try {
      const translated = t(key)
      return translated && translated !== key ? translated : fallback
    } catch {
      return fallback
    }
  }

  // Debug: Log to console
  console.log('LearnPage rendering', { womenPoints, menPoints })

  return (
    <div className="learn-page" style={{ minHeight: '100vh' }}>
      <div className="learn-page-header">
        <h1>{getText('learnPage.title', '📚 Understanding Hormonal Cycles')}</h1>
        <p className="learn-page-subtitle">
          {getText('learnPage.subtitle', 'Learn how hormonal cycles work and why understanding them matters for everyone')}
        </p>
      </div>

      <div className="video-section">
        <h2>{getText('learnPage.videoTitle', '🎥 Introduction by Dr. Mindy Pelz')}</h2>
        <p className="video-description" dangerouslySetInnerHTML={{
          __html: getText('learnPage.videoDescription', 'Watch Dr. Mindy Pelz explain the concept of hormonal cycle intelligence and why she says <strong> "I\'m going to give you gold"</strong> when teaching about these powerful phases.')
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
            {getText('learnPage.watchOnYouTube', 'Watch on YouTube ↗')}
          </a>
        </p>
      </div>

      <EducationalContent />

      <div className="why-this-matters">
        <h2>{getText('learnPage.whyThisMatters', '💡 Why This Matters for Everyone')}</h2>
        <div className="matters-grid">
          <div className="matters-card">
            <h3>{getText('learnPage.forWomen', '👩 For Women')}</h3>
            <ul>
              {womenPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="matters-card">
            <h3>{getText('learnPage.forMenPartners', '👨 For Men & Partners')}</h3>
            <ul>
              {menPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="education-note">
          <p dangerouslySetInnerHTML={{
            __html: getText('learnPage.educationNote', '<strong>This is knowledge that should be taught in high school.</strong> Understanding hormonal cycles helps everyone work together more effectively, build stronger relationships, and create more supportive environments at home and in the workplace.')
          }} />
        </div>
      </div>
    </div>
  )
}

export default LearnPage

