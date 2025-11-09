import { differenceInDays, addDays, format } from 'date-fns'

/**
 * Based on Dr. Mindy Pelz's hormonal cycle framework
 * Calculates which phase of the menstrual cycle the user is currently in
 */
export function getCyclePhase(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null

  const today = new Date()
  const daysSincePeriod = differenceInDays(today, lastPeriodDate)
  const dayInCycle = (daysSincePeriod % cycleLength) + 1

  // Dr. Pelz's framework:
  // Power Phase 1: Days 1-10 (Estrogen begins to rise)
  // Manifestation Phase: Days 11-15 (Estrogen peaks, testosterone surges)
  // Power Phase 2: Days 16-19 (Estrogen drops, progesterone rises)
  // Nurture Phase: Days 20-28 (Progesterone dominates)

  if (dayInCycle >= 1 && dayInCycle <= 10) {
    return {
      name: 'Power Phase 1',
      day: dayInCycle,
      daysInPhase: 10,
      description: 'Estrogen Rising',
      color: '#B0E0E6',
      icon: '⚡',
      hormones: {
        estrogen: 'Rising',
        progesterone: 'Low',
        testosterone: 'Low'
      }
    }
  } else if (dayInCycle >= 11 && dayInCycle <= 15) {
    return {
      name: 'Manifestation Phase',
      day: dayInCycle,
      daysInPhase: 5,
      description: 'Peak Performance',
      color: '#F4D03F',
      icon: '✨',
      hormones: {
        estrogen: 'Peak',
        progesterone: 'Rising',
        testosterone: 'Surge'
      }
    }
  } else if (dayInCycle >= 16 && dayInCycle <= 19) {
    return {
      name: 'Power Phase 2',
      day: dayInCycle,
      daysInPhase: 4,
      description: 'Focused Energy',
      color: '#98D8C8',
      icon: '🎯',
      hormones: {
        estrogen: 'Dropping',
        progesterone: 'Rising',
        testosterone: 'Moderate'
      }
    }
  } else {
    return {
      name: 'Nurture Phase',
      day: dayInCycle,
      daysInPhase: cycleLength - 19,
      description: 'Rest & Rejuvenation',
      color: '#FFB6C1',
      icon: '🌙',
      hormones: {
        estrogen: 'Low',
        progesterone: 'Peak',
        testosterone: 'Low'
      }
    }
  }
}

export function getDaysInCycle(lastPeriodDate) {
  if (!lastPeriodDate) return 0
  const today = new Date()
  return differenceInDays(today, lastPeriodDate) + 1
}

export function getNextPeriodDate(lastPeriodDate, cycleLength = 28) {
  if (!lastPeriodDate) return null
  return addDays(lastPeriodDate, cycleLength)
}

export function getPhaseRecommendations(phase) {
  if (!phase) return null

  const recommendations = {
    'Power Phase 1': {
      work: {
        level: 'high',
        description: 'Great time for planning, organizing, and starting new projects. Your cognitive function is improving.',
        bestFor: ['Strategic planning', 'Learning new skills', 'Organizing tasks', 'Team meetings']
      },
      exercise: {
        level: 'moderate-high',
        description: 'Energy is building. Good for moderate to high-intensity workouts.',
        bestFor: ['Strength training', 'Cardio', 'Yoga', 'Pilates']
      },
      social: {
        level: 'good',
        description: 'Mood is improving. Good time for social activities.',
        bestFor: ['Casual hangouts', 'Networking events', 'Group activities']
      },
      intimacy: {
        level: 'moderate',
        description: 'Libido is increasing as estrogen rises.',
        bestFor: ['Intimate conversations', 'Building connection']
      }
    },
    'Manifestation Phase': {
      work: {
        level: 'peak',
        description: 'PEAK PERFORMANCE! Best time for high-stakes activities. Your brain power, confidence, and verbal skills are at their highest.',
        bestFor: ['Important presentations', 'Negotiations', 'Job interviews', 'Public speaking', 'Creative projects', 'Decision-making']
      },
      exercise: {
        level: 'peak',
        description: 'Maximum energy and strength. Push hard in the gym!',
        bestFor: ['High-intensity training', 'PR attempts', 'Competitions', 'Challenging workouts']
      },
      social: {
        level: 'peak',
        description: 'You\'re at your most charismatic and confident. Perfect for social events!',
        bestFor: ['Important social events', 'Dates', 'Parties', 'Networking', 'Social gatherings']
      },
      intimacy: {
        level: 'peak',
        description: 'Libido is at its peak! Testosterone surge makes this the best time for intimacy.',
        bestFor: ['Intimate moments', 'Deep connection', 'Physical intimacy']
      }
    },
    'Power Phase 2': {
      work: {
        level: 'high',
        description: 'Excellent focus and endurance. Great for detailed work and follow-through.',
        bestFor: ['Deep work', 'Problem-solving', 'Completing projects', 'Administrative tasks']
      },
      exercise: {
        level: 'moderate',
        description: 'Good endurance. Focus on consistency over intensity.',
        bestFor: ['Steady-state cardio', 'Moderate strength training', 'Endurance activities']
      },
      social: {
        level: 'moderate',
        description: 'More introspective. Prefer smaller, meaningful interactions.',
        bestFor: ['One-on-one conversations', 'Close friends', 'Quiet activities']
      },
      intimacy: {
        level: 'moderate',
        description: 'Intimacy is still good, though energy may be more focused inward.',
        bestFor: ['Emotional connection', 'Quality time']
      }
    },
    'Nurture Phase': {
      work: {
        level: 'low-moderate',
        description: 'Time for rest and reflection. Focus on less demanding tasks and self-care.',
        bestFor: ['Reflection', 'Planning for next cycle', 'Gentle tasks', 'Self-care activities']
      },
      exercise: {
        level: 'low',
        description: 'Energy is lower. Focus on gentle movement and recovery.',
        bestFor: ['Gentle yoga', 'Walking', 'Stretching', 'Restorative activities']
      },
      social: {
        level: 'low',
        description: 'You may prefer solitude or very close, supportive relationships.',
        bestFor: ['Quiet time', 'Close support system', 'Self-care', 'Rest']
      },
      intimacy: {
        level: 'low',
        description: 'Libido is typically lower. Focus on emotional support and understanding.',
        bestFor: ['Emotional support', 'Understanding', 'Patience', 'Gentle connection']
      }
    }
  }

  return recommendations[phase.name] || null
}

export function getFertilityInfo(phase, cycleLength) {
  if (!phase) return null

  const fertilityInfo = {
    'Power Phase 1': {
      libido: {
        level: 'moderate-high',
        description: 'Libido is increasing as estrogen rises. Good time for intimacy.',
        bestDays: 'Days 1-10',
        note: 'Desire building up as hormones increase'
      },
      fertility: {
        level: 'low',
        description: 'Low fertility period. Ovulation has not occurred yet.',
        bestDays: 'Not fertile',
        pregnancyRisk: 'Very Low',
        note: 'Early cycle phase, ovulation typically occurs around day 14'
      },
      contraception: {
        level: 'safer',
        description: 'Lower risk period, but not completely safe. Sperm can survive up to 5 days.',
        safety: 'Moderate - Use protection',
        note: 'While fertility is low, always use contraception if not trying to conceive'
      }
    },
    'Manifestation Phase': {
      libido: {
        level: 'peak',
        description: 'PEAK LIBIDO! Testosterone surge and peak estrogen create maximum desire and arousal.',
        bestDays: 'Days 11-15',
        note: 'This is your best time for great sex - highest desire and physical response'
      },
      fertility: {
        level: 'peak',
        description: 'PEAK FERTILITY WINDOW! Ovulation typically occurs during this phase. Highest chance of conception.',
        bestDays: 'Days 11-15 (especially days 12-14)',
        pregnancyRisk: 'Very High',
        note: 'Ovulation window - egg is released and viable for 12-24 hours. Sperm can survive 3-5 days, so conception is possible from sex 3-5 days before ovulation too.'
      },
      contraception: {
        level: 'high-risk',
        description: 'HIGHEST RISK PERIOD for pregnancy. Must use reliable contraception if not trying to conceive.',
        safety: 'High Risk - Use reliable protection',
        note: 'This is the most fertile window. Use condoms, birth control, or other reliable methods if avoiding pregnancy.'
      }
    },
    'Power Phase 2': {
      libido: {
        level: 'moderate',
        description: 'Libido is moderate. Still good for intimacy, though energy may be more focused inward.',
        bestDays: 'Days 16-19',
        note: 'Post-ovulation, desire may be more emotionally focused'
      },
      fertility: {
        level: 'low',
        description: 'Fertility decreases after ovulation. Egg is no longer viable after 24 hours post-ovulation.',
        bestDays: 'Not fertile',
        pregnancyRisk: 'Low',
        note: 'Ovulation has passed. Conception unlikely unless ovulation was delayed.'
      },
      contraception: {
        level: 'safer',
        description: 'Lower risk period post-ovulation, but still use protection as cycle can vary.',
        safety: 'Moderate - Use protection',
        note: 'While risk is lower, cycles can vary and ovulation can be delayed. Use protection if not trying to conceive.'
      }
    },
    'Nurture Phase': {
      libido: {
        level: 'low',
        description: 'Libido is typically lower. Focus on emotional connection and gentle intimacy.',
        bestDays: 'Days 20-28',
        note: 'Lower desire due to progesterone dominance. Emotional intimacy may be more important.'
      },
      fertility: {
        level: 'very-low',
        description: 'Very low fertility. Menstruation approaching. Conception extremely unlikely.',
        bestDays: 'Not fertile',
        pregnancyRisk: 'Very Low',
        note: 'Luteal phase - if conception didn\'t occur, period will start soon. Very unlikely to conceive.'
      },
      contraception: {
        level: 'safer',
        description: 'Lower risk period, but still recommended to use protection as cycles can vary.',
        safety: 'Moderate - Use protection',
        note: 'While this is typically a safer period, always use contraception if not trying to conceive, as cycle lengths can vary.'
      }
    }
  }

  return fertilityInfo[phase.name] || null
}

