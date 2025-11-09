import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import EducationalContent from './EducationalContent'
import './LearnPage.css'

function LearnPage() {
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
        <h1>📚 Understanding Hormonal Cycles</h1>
        <p className="learn-page-subtitle">
          Learn how hormonal cycles work and why understanding them matters for everyone
        </p>
      </div>

      <div className="video-section">
        <h2>🎥 Introduction by Dr. Mindy Pelz</h2>
        <p className="video-description">
          Watch Dr. Mindy Pelz explain the concept of hormonal cycle intelligence and why she says 
          <strong> "I'm going to give you gold"</strong> when teaching about these powerful phases.
        </p>
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
            Watch on YouTube ↗
          </a>
        </p>
      </div>

      <EducationalContent />

      <div className="why-this-matters">
        <h2>💡 Why This Matters for Everyone</h2>
        <div className="matters-grid">
          <div className="matters-card">
            <h3>👩 For Women</h3>
            <ul>
              <li>Understand your body's natural rhythms and work with them, not against them</li>
              <li>Plan important activities during your peak performance phases</li>
              <li>Honor your need for rest during the Nurture Phase</li>
              <li>Make informed decisions about work, relationships, and self-care</li>
              <li>Recognize that your cycle is a superpower, not a limitation</li>
            </ul>
          </div>
          <div className="matters-card">
            <h3>👨 For Men & Partners</h3>
            <ul>
              <li>Better understand and support the women in your life</li>
              <li>Recognize that hormonal changes are natural and powerful</li>
              <li>Plan collaborative activities during peak performance phases</li>
              <li>Provide understanding and support during rest phases</li>
              <li>Build stronger relationships through empathy and knowledge</li>
            </ul>
          </div>
        </div>
        <div className="education-note">
          <p>
            <strong>This is knowledge that should be taught in high school.</strong> Understanding hormonal cycles 
            helps everyone work together more effectively, build stronger relationships, and create more supportive 
            environments at home and in the workplace.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearnPage

