import './EducationalContent.css'
import HormoneTooltip from './HormoneTooltip'

function EducationalContent() {
  const phases = [
    {
      name: 'Power Phase 1',
      days: 'Days 1-10',
      icon: '⚡',
      color: '#B0E0E6',
      hormones: {
        estrogen: 'Rising',
        progesterone: 'Low',
        testosterone: 'Low'
      },
      description: 'Estrogen begins to rise, enhancing energy and cognitive functions. This is a time of building momentum.',
      whatHappens: [
        'Estrogen levels start increasing',
        'Energy and mood begin to improve',
        'Cognitive function enhances',
        'Serotonin and dopamine levels rise',
        'Body prepares for ovulation'
      ],
      whyItMatters: 'This phase sets the foundation for peak performance. As estrogen rises, you gain clarity, energy, and confidence.'
    },
    {
      name: 'Manifestation Phase',
      days: 'Days 11-15',
      icon: '✨',
      color: '#F4D03F',
      hormones: {
        estrogen: 'Peak',
        progesterone: 'Rising',
        testosterone: 'Surge'
      },
      description: 'PEAK PERFORMANCE! Estrogen peaks, testosterone surges, and progesterone slightly increases. This is your time to shine.',
      whatHappens: [
        'Estrogen reaches its highest point',
        'Testosterone surges significantly',
        'Brain power and verbal skills peak',
        'Confidence and assertiveness increase',
        'Libido reaches its peak',
        'Detoxification processes are enhanced',
        'Ovulation typically occurs'
      ],
      whyItMatters: 'This is your superpower phase. Your brain is operating at maximum capacity, making it the ideal time for important presentations, negotiations, creative work, and high-stakes activities.'
    },
    {
      name: 'Power Phase 2',
      days: 'Days 16-19',
      icon: '🎯',
      color: '#98D8C8',
      hormones: {
        estrogen: 'Dropping',
        progesterone: 'Rising',
        testosterone: 'Moderate'
      },
      description: 'Estrogen drops while progesterone rises, supporting focus and endurance. Great for deep work and follow-through.',
      whatHappens: [
        'Estrogen levels begin to decline',
        'Progesterone starts rising',
        'Focus and concentration improve',
        'Endurance is enhanced',
        'More introspective energy',
        'Body prepares for potential pregnancy'
      ],
      whyItMatters: 'While not as flashy as the Manifestation Phase, this is excellent for sustained focus, problem-solving, and completing complex projects.'
    },
    {
      name: 'Nurture Phase',
      days: 'Days 20-28',
      icon: '🌙',
      color: '#FFB6C1',
      hormones: {
        estrogen: 'Low',
        progesterone: 'Peak',
        testosterone: 'Low'
      },
      description: 'Progesterone dominates, promoting rest and rejuvenation. This is a time for self-care and reflection.',
      whatHappens: [
        'Progesterone reaches its peak',
        'Estrogen and testosterone are low',
        'Energy levels naturally decrease',
        'Body prepares for menstruation',
        'Increased need for rest and recovery',
        'More emotional sensitivity',
        'Intuition may be heightened'
      ],
      whyItMatters: 'This phase is crucial for recovery and preparation for the next cycle. Resting during this time supports hormonal balance and overall health.'
    }
  ]

  return (
    <div className="educational-content">
      <div className="education-header">
        <h3>📚 Understanding Hormonal Cycles</h3>
        <p className="education-intro">
          Based on Dr. Mindy Pelz's research, the menstrual cycle is divided into four distinct phases, 
          each with unique hormonal patterns that affect energy, mood, cognition, and performance. 
          Understanding these phases helps both women and their partners, colleagues, and loved ones 
          work together more effectively and build stronger, more supportive relationships.
        </p>
      </div>

      <div className="phases-education">
        {phases.map((phase, index) => (
          <div key={index} className="phase-education-card" style={{ borderColor: phase.color }}>
            <div className="phase-education-header">
              <div className="phase-education-icon" style={{ color: phase.color }}>
                {phase.icon}
              </div>
              <div>
                <h4>{phase.name}</h4>
                <span className="phase-days">{phase.days}</span>
              </div>
            </div>

            <p className="phase-description-text">{phase.description}</p>

            <div className="hormones-breakdown">
              <h5>Hormonal State:</h5>
              <div className="hormones-list">
                <div className="hormone-badge">
                  <HormoneTooltip hormone="estrogen">
                    <span className="hormone-name">Estrogen:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.estrogen}</strong>
                </div>
                <div className="hormone-badge">
                  <HormoneTooltip hormone="progesterone">
                    <span className="hormone-name">Progesterone:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.progesterone}</strong>
                </div>
                <div className="hormone-badge">
                  <HormoneTooltip hormone="testosterone">
                    <span className="hormone-name">Testosterone:</span>
                  </HormoneTooltip>
                  <strong style={{ color: phase.color }}>{phase.hormones.testosterone}</strong>
                </div>
              </div>
            </div>

            <div className="what-happens">
              <h5>What's Happening:</h5>
              <ul>
                {phase.whatHappens.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="why-matters">
              <h5>Why This Matters:</h5>
              <p>{phase.whyItMatters}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="key-takeaways">
        <h4>💡 Key Takeaways</h4>
        <ul>
          <li><strong>The cycle is a superpower, not a limitation.</strong> Understanding these phases helps work with the body's natural rhythms, not against them.</li>
          <li><strong>Plan strategically.</strong> Schedule important meetings, presentations, and high-stakes activities during the Manifestation Phase (Days 11-15) when cognitive function and confidence peak.</li>
          <li><strong>Honor the Nurture Phase.</strong> Rest and self-care during Days 20-28 are essential for hormonal balance and long-term health. This is a time for recovery, not pushing through.</li>
          <li><strong>Every phase has value.</strong> Each phase offers unique strengths - from building energy to peak performance to deep focus to rest. There's no "bad" phase, only different opportunities.</li>
          <li><strong>Knowledge empowers everyone.</strong> When partners, colleagues, and loved ones understand hormonal cycles, they can provide better support, plan collaborative activities more effectively, and build stronger relationships based on empathy and understanding.</li>
          <li><strong>This should be taught in high school.</strong> Understanding hormonal cycles is fundamental knowledge that benefits everyone - women, men, partners, and society as a whole.</li>
        </ul>
      </div>
    </div>
  )
}

export default EducationalContent

