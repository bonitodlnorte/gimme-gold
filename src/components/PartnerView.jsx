import { format } from 'date-fns'
import PhaseCard from './PhaseCard'
import { getPhaseRecommendations } from '../utils/cycleCalculator'
import './PartnerView.css'

function PartnerView({ lastPeriodDate, cycleLength, currentPhase, daysInCycle }) {
  if (!lastPeriodDate || !currentPhase) {
    return (
      <div className="partner-view">
        <div className="partner-welcome">
          <h2>👥 Partner View</h2>
          <p>This view helps you understand where your partner is in her cycle and how to best support her.</p>
          <p className="no-data">No cycle data available yet. Ask your partner to set up her cycle tracking first.</p>
        </div>
      </div>
    )
  }

  const recommendations = getPhaseRecommendations(currentPhase)

  const getCommunicationTips = (phaseName) => {
    const tips = {
      'Power Phase 1': {
        approach: 'Supportive and encouraging',
        description: 'She\'s building energy and confidence. Great time for collaborative planning and starting new projects together.',
        do: ['Encourage her ideas', 'Plan activities together', 'Be supportive of new initiatives', 'Engage in meaningful conversations'],
        avoid: ['Being dismissive', 'Rushing decisions', 'Overwhelming with too many tasks']
      },
      'Manifestation Phase': {
        approach: 'Empower and celebrate',
        description: 'She\'s at her peak! This is her time to shine. Support her in high-stakes situations and celebrate her confidence.',
        do: ['Encourage her to take on challenges', 'Support important presentations/meetings', 'Celebrate her achievements', 'Enjoy social activities together', 'Be intimate and connected'],
        avoid: ['Undermining her confidence', 'Scheduling conflicts during this time', 'Being dismissive of her ideas']
      },
      'Power Phase 2': {
        approach: 'Respectful and focused',
        description: 'She has excellent focus and endurance. Great time for deep work and completing projects together.',
        do: ['Respect her need for focus', 'Support her in completing tasks', 'Have meaningful one-on-one conversations', 'Be patient and understanding'],
        avoid: ['Interrupting her flow', 'Demanding immediate attention', 'Being overly social']
      },
      'Nurture Phase': {
        approach: 'Gentle and understanding',
        description: 'She needs rest and self-care. This is a time for patience, understanding, and emotional support.',
        do: ['Offer emotional support', 'Be patient and understanding', 'Help with practical tasks', 'Create a calm environment', 'Respect her need for space'],
        avoid: ['Pushing for high-energy activities', 'Being critical or demanding', 'Expecting peak performance', 'Minimizing her feelings']
      }
    }
    return tips[phaseName] || tips['Nurture Phase']
  }

  const communicationTips = getCommunicationTips(currentPhase.name)

  return (
    <div className="partner-view">
      <div className="partner-header">
        <h2>👥 Partner View</h2>
        <p className="partner-subtitle">
          Understanding her cycle helps you support her better
        </p>
      </div>

      <div className="partner-info-card">
        <div className="current-status">
          <h3>Current Status</h3>
          <p className="status-text">
            She is currently in <strong>{currentPhase.name}</strong> (Day {currentPhase.day} of {cycleLength})
          </p>
          <p className="status-description">{currentPhase.description}</p>
        </div>
      </div>

      <PhaseCard phase={currentPhase} daysInCycle={daysInCycle} cycleLength={cycleLength} />

      <div className="communication-guide">
        <h3>💬 How to Approach Her Right Now</h3>
        <div className="approach-badge" style={{ borderColor: currentPhase.color }}>
          <span style={{ color: currentPhase.color }}>{communicationTips.approach}</span>
        </div>
        <p className="approach-description">{communicationTips.description}</p>

        <div className="tips-grid">
          <div className="tips-section do">
            <h4>✅ Do</h4>
            <ul>
              {communicationTips.do.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="tips-section avoid">
            <h4>❌ Avoid</h4>
            <ul>
              {communicationTips.avoid.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="activity-suggestions">
          <h3>🎯 Activity Suggestions</h3>
          <p className="suggestions-intro">
            Based on her current phase, here are activities that align well with her energy:
          </p>
          
          <div className="suggestions-grid">
            {recommendations.work && (
              <div className="suggestion-card">
                <div className="suggestion-icon">💼</div>
                <h4>Work</h4>
                <p>{recommendations.work.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.work.level === 'peak' && '✨ Peak Performance Time'}
                  {recommendations.work.level === 'high' && '⚡ Great Time'}
                  {recommendations.work.level === 'moderate' && '👍 Good Time'}
                  {recommendations.work.level === 'low-moderate' && '🌙 Take It Easy'}
                  {recommendations.work.level === 'low' && '🌙 Rest Time'}
                </div>
              </div>
            )}

            {recommendations.social && (
              <div className="suggestion-card">
                <div className="suggestion-icon">👥</div>
                <h4>Social</h4>
                <p>{recommendations.social.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.social.level === 'peak' && '✨ Peak Social Time'}
                  {recommendations.social.level === 'good' && '👍 Good Time'}
                  {recommendations.social.level === 'moderate' && '👌 Moderate'}
                  {recommendations.social.level === 'low' && '🌙 Prefer Quiet Time'}
                </div>
              </div>
            )}

            {recommendations.intimacy && (
              <div className="suggestion-card">
                <div className="suggestion-icon">💕</div>
                <h4>Intimacy</h4>
                <p>{recommendations.intimacy.description}</p>
                <div className="suggestion-level" style={{ color: currentPhase.color }}>
                  {recommendations.intimacy.level === 'peak' && '✨ Peak Intimacy Time'}
                  {recommendations.intimacy.level === 'moderate' && '💕 Good Time'}
                  {recommendations.intimacy.level === 'low' && '🌙 Focus on Emotional Support'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hormone-info">
        <h3>🧪 Understanding Her Hormones</h3>
        <div className="hormone-explanation">
          <p>
            Her current hormonal state affects her energy, mood, and cognitive function. 
            Understanding this helps you communicate and interact with her more effectively.
          </p>
          <div className="hormone-details">
            <div className="hormone-detail">
              <strong>Estrogen:</strong> {currentPhase.hormones.estrogen}
              <span className="hormone-note">
                {currentPhase.hormones.estrogen === 'Peak' && ' - Enhances confidence, verbal skills, and cognitive function'}
                {currentPhase.hormones.estrogen === 'Rising' && ' - Building energy and improving mood'}
                {currentPhase.hormones.estrogen === 'Dropping' && ' - Energy shifting, focus increasing'}
                {currentPhase.hormones.estrogen === 'Low' && ' - Time for rest and recovery'}
              </span>
            </div>
            <div className="hormone-detail">
              <strong>Progesterone:</strong> {currentPhase.hormones.progesterone}
              <span className="hormone-note">
                {currentPhase.hormones.progesterone === 'Peak' && ' - Promotes calmness, but may lower energy'}
                {currentPhase.hormones.progesterone === 'Rising' && ' - Increasing focus and introspection'}
                {currentPhase.hormones.progesterone === 'Low' && ' - More active and energetic phase'}
              </span>
            </div>
            <div className="hormone-detail">
              <strong>Testosterone:</strong> {currentPhase.hormones.testosterone}
              <span className="hormone-note">
                {currentPhase.hormones.testosterone === 'Surge' && ' - Boosts confidence, libido, and assertiveness'}
                {currentPhase.hormones.testosterone === 'Moderate' && ' - Balanced levels'}
                {currentPhase.hormones.testosterone === 'Low' && ' - More introspective phase'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerView

