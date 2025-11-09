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

export function getWorkoutPerformance(phase, cycleLength) {
  if (!phase) return null

  const workoutInfo = {
    'Power Phase 1': {
      performanceLevel: 'moderate-high',
      energyLevel: 'Building',
      strengthLevel: 'Moderate',
      enduranceLevel: 'Good',
      recoverySpeed: 'Fast',
      injuryRisk: 'Low',
      overview: 'Your energy and strength are building as estrogen rises. This is a great time to establish workout routines and build momentum.',
      hormonalFactors: {
        estrogen: 'Rising - improving muscle recovery and energy',
        progesterone: 'Low - minimal impact',
        testosterone: 'Low - strength building gradually',
        cortisol: 'Balanced - good stress response'
      },
      recommendedWorkouts: [
        {
          type: 'Strength Training',
          intensity: 'Moderate to High',
          duration: '45-60 minutes',
          frequency: '3-4x per week',
          focus: 'Building strength, form improvement, progressive overload',
          exercises: ['Compound movements (squats, deadlifts, presses)', 'Moderate weight, 8-12 reps', 'Focus on proper form', 'Full body or upper/lower splits'],
          why: 'Estrogen is rising, improving muscle recovery. Great time to build strength foundation.'
        },
        {
          type: 'Cardio',
          intensity: 'Moderate to High',
          duration: '30-45 minutes',
          frequency: '3-4x per week',
          focus: 'Building cardiovascular fitness, fat burning',
          exercises: ['Running, cycling, HIIT', 'Steady-state cardio', 'Interval training', 'Dance or aerobics'],
          why: 'Energy levels are increasing, making cardio more enjoyable and effective.'
        },
        {
          type: 'Flexibility & Mobility',
          intensity: 'Low to Moderate',
          duration: '20-30 minutes',
          frequency: 'Daily or 5-6x per week',
          focus: 'Improving range of motion, preventing injury',
          exercises: ['Yoga, Pilates, stretching', 'Dynamic warm-ups', 'Foam rolling', 'Mobility drills'],
          why: 'Good time to establish flexibility routines that will support you throughout the cycle.'
        }
      ],
      avoid: [
        'Overtraining - listen to your body as energy builds',
        'Skipping warm-ups - prevent injury while building intensity',
        'Comparing to peak performance days - this is a building phase'
      ],
      tips: [
        'Start with moderate intensity and gradually increase',
        'Focus on form and technique',
        'This is a great time to try new workouts or classes',
        'Your body is primed for building muscle and endurance',
        'Stay hydrated - estrogen affects fluid balance'
      ],
      performanceExpectations: {
        strength: 'Moderate - building foundation',
        endurance: 'Good - improving steadily',
        speed: 'Moderate - building capacity',
        power: 'Moderate - developing explosiveness',
        recovery: 'Fast - estrogen supports recovery'
      }
    },
    'Manifestation Phase': {
      performanceLevel: 'peak',
      energyLevel: 'Peak',
      strengthLevel: 'Peak',
      enduranceLevel: 'Peak',
      recoverySpeed: 'Very Fast',
      injuryRisk: 'Low',
      overview: 'PEAK PERFORMANCE WINDOW! This is your absolute best time for workouts. Estrogen and testosterone are at their highest, giving you maximum strength, power, and endurance.',
      hormonalFactors: {
        estrogen: 'Peak - optimal muscle recovery, increased strength',
        progesterone: 'Rising slightly - minimal impact',
        testosterone: 'Surge - maximum power and strength',
        cortisol: 'Optimal - great stress response and recovery'
      },
      recommendedWorkouts: [
        {
          type: 'Strength Training',
          intensity: 'High to Maximum',
          duration: '60-90 minutes',
          frequency: '4-5x per week',
          focus: 'PR attempts, heavy lifting, maximum strength',
          exercises: ['Heavy compound lifts (1-5 reps)', 'Power movements (cleans, snatches)', 'Maximum effort sets', 'Strength-focused training'],
          why: 'Testosterone surge provides maximum strength. This is when you can lift your heaviest weights and set personal records.'
        },
        {
          type: 'High-Intensity Training',
          intensity: 'Maximum',
          duration: '20-45 minutes',
          frequency: '3-4x per week',
          focus: 'Power output, speed, explosiveness',
          exercises: ['HIIT, CrossFit, circuit training', 'Sprint intervals', 'Plyometrics', 'Competition prep'],
          why: 'Peak hormone levels maximize power output and recovery. Perfect for high-intensity work.'
        },
        {
          type: 'Endurance Training',
          intensity: 'High',
          duration: '45-90 minutes',
          frequency: '3-4x per week',
          focus: 'Long-distance, sustained effort',
          exercises: ['Long runs, cycling, swimming', 'Endurance challenges', 'Race training', 'Aerobic capacity building'],
          why: 'Optimal cardiovascular function and energy levels make endurance work feel easier.'
        },
        {
          type: 'Competition & Challenges',
          intensity: 'Maximum',
          duration: 'Varies',
          frequency: 'As needed',
          focus: 'Competitions, races, personal challenges',
          exercises: ['Races, competitions', 'Fitness challenges', 'PR attempts', 'Skill mastery'],
          why: 'This is THE time to compete or attempt personal bests. Your body is at its absolute peak.'
        }
      ],
      avoid: [
        'Wasting this window on light workouts - push yourself!',
        'Overtraining - even at peak, rest is important',
        'Ignoring form for heavier weights - safety first'
      ],
      tips: [
        'Schedule your most challenging workouts during this phase',
        'Attempt personal records and new challenges',
        'This is the best time for competitions or races',
        'Your body can handle more volume and intensity',
        'Recovery is faster, so you can train more frequently',
        'Take advantage of peak motivation and confidence'
      ],
      performanceExpectations: {
        strength: 'Peak - maximum lifting capacity',
        endurance: 'Peak - best cardiovascular performance',
        speed: 'Peak - fastest times possible',
        power: 'Peak - maximum explosiveness',
        recovery: 'Very Fast - optimal recovery between sessions'
      }
    },
    'Power Phase 2': {
      performanceLevel: 'high',
      energyLevel: 'Stable',
      strengthLevel: 'Good',
      enduranceLevel: 'Excellent',
      recoverySpeed: 'Good',
      injuryRisk: 'Low',
      overview: 'Excellent focus and endurance. While not at peak strength, this phase is perfect for sustained effort, technique work, and building consistency.',
      hormonalFactors: {
        estrogen: 'Dropping - still supportive but declining',
        progesterone: 'Rising - promotes focus and endurance',
        testosterone: 'Moderate - strength still good',
        cortisol: 'Balanced - good for sustained effort'
      },
      recommendedWorkouts: [
        {
          type: 'Endurance Training',
          intensity: 'Moderate to High',
          duration: '45-90 minutes',
          frequency: '4-5x per week',
          focus: 'Sustained effort, aerobic capacity',
          exercises: ['Long steady-state runs', 'Cycling, swimming', 'Endurance circuits', 'Aerobic base building'],
          why: 'Progesterone supports endurance. This is when sustained effort feels most natural.'
        },
        {
          type: 'Strength Training',
          intensity: 'Moderate to High',
          duration: '45-60 minutes',
          frequency: '3-4x per week',
          focus: 'Volume work, technique refinement, muscle building',
          exercises: ['Moderate weight, higher reps (8-15)', 'Full body workouts', 'Accessory work', 'Technique-focused training'],
          why: 'Good strength levels with excellent focus make this perfect for volume and technique work.'
        },
        {
          type: 'Pilates & Core',
          intensity: 'Moderate',
          duration: '30-60 minutes',
          frequency: '4-5x per week',
          focus: 'Core strength, stability, body awareness',
          exercises: ['Pilates, barre, core work', 'Stability training', 'Balance exercises', 'Functional movement'],
          why: 'Enhanced focus and body awareness make this ideal for precision-based workouts.'
        },
        {
          type: 'Yoga & Flexibility',
          intensity: 'Low to Moderate',
          duration: '45-90 minutes',
          frequency: '4-6x per week',
          focus: 'Flexibility, recovery, mental focus',
          exercises: ['Vinyasa, power yoga', 'Yin yoga for recovery', 'Meditation and breathwork', 'Active recovery'],
          why: 'Progesterone promotes calmness and focus, perfect for mindful movement practices.'
        }
      ],
      avoid: [
        'Expecting peak performance - focus on consistency instead',
        'Heavy max-out attempts - strength is declining',
        'Overtraining - recovery is slower than peak phase'
      ],
      tips: [
        'Focus on volume and consistency over intensity',
        'This is excellent for building aerobic base',
        'Great time for technique refinement and skill work',
        'Your focus is enhanced - perfect for complex movements',
        'Endurance feels easier - take advantage of this',
        'Balance intensity with adequate recovery'
      ],
      performanceExpectations: {
        strength: 'Good - slightly below peak',
        endurance: 'Excellent - best for sustained effort',
        speed: 'Good - consistent pace',
        power: 'Moderate - less explosive than peak',
        recovery: 'Good - adequate but slower than peak'
      }
    },
    'Nurture Phase': {
      performanceLevel: 'low-moderate',
      energyLevel: 'Low',
      strengthLevel: 'Lower',
      enduranceLevel: 'Lower',
      recoverySpeed: 'Slower',
      injuryRisk: 'Higher',
      overview: 'Time for rest and recovery. Your body needs gentler movement and more rest. This is crucial for hormonal balance and preventing burnout.',
      hormonalFactors: {
        estrogen: 'Low - reduced energy and strength',
        progesterone: 'Peak - promotes rest and recovery',
        testosterone: 'Low - reduced power and strength',
        cortisol: 'May be elevated - increased stress sensitivity'
      },
      recommendedWorkouts: [
        {
          type: 'Gentle Movement',
          intensity: 'Very Low',
          duration: '20-40 minutes',
          frequency: 'Daily or 5-6x per week',
          focus: 'Maintaining mobility, gentle activity',
          exercises: ['Walking, gentle yoga', 'Stretching, mobility work', 'Light swimming', 'Tai chi, qigong'],
          why: 'Gentle movement supports recovery without taxing your system. Essential for hormonal balance.'
        },
        {
          type: 'Yin & Restorative Yoga',
          intensity: 'Very Low',
          duration: '30-60 minutes',
          frequency: '4-6x per week',
          focus: 'Recovery, stress relief, flexibility',
          exercises: ['Yin yoga, restorative yoga', 'Gentle stretching', 'Meditation', 'Breathwork'],
          why: 'Progesterone dominance makes your body crave rest. Gentle yoga supports this need.'
        },
        {
          type: 'Light Strength',
          intensity: 'Very Low to Low',
          duration: '20-30 minutes',
          frequency: '2-3x per week',
          focus: 'Maintaining muscle, light movement',
          exercises: ['Bodyweight exercises', 'Light resistance bands', 'Very light weights', 'Focus on movement quality'],
          why: 'Light activity maintains muscle without overstressing your system during this recovery phase.'
        },
        {
          type: 'Active Recovery',
          intensity: 'Very Low',
          duration: '15-30 minutes',
          frequency: 'Daily',
          focus: 'Recovery, mobility, stress relief',
          exercises: ['Foam rolling', 'Gentle stretching', 'Walking', 'Breathing exercises'],
          why: 'Active recovery supports your body\'s need for rest while maintaining movement patterns.'
        }
      ],
      avoid: [
        'High-intensity workouts - your body can\'t handle them',
        'Heavy lifting - injury risk is higher',
        'Pushing through fatigue - this causes more harm than good',
        'Comparing to other phases - honor this rest time',
        'Overtraining - this leads to hormonal imbalance'
      ],
      tips: [
        'Listen to your body - if you need rest, take it',
        'This phase is essential for recovery and hormonal balance',
        'Gentle movement is better than no movement',
        'Focus on stress management and self-care',
        'Your body is preparing for menstruation - honor this process',
        'Rest now sets you up for better performance in the next cycle',
        'This is NOT a failure - it\'s a necessary part of the cycle'
      ],
      performanceExpectations: {
        strength: 'Lower - reduced capacity',
        endurance: 'Lower - energy is limited',
        speed: 'Lower - not the time for speed work',
        power: 'Lower - explosive movements feel harder',
        recovery: 'Slower - body needs more rest'
      }
    }
  }

  return workoutInfo[phase.name] || null
}

export function getWorkCareerPerformance(phase, cycleLength) {
  if (!phase) return null

  const workInfo = {
    'Power Phase 1': {
      performanceLevel: 'high',
      cognitiveLevel: 'Building',
      communicationLevel: 'Good',
      decisionMakingLevel: 'Good',
      creativityLevel: 'Moderate',
      overview: 'Your cognitive function and energy are building as estrogen rises. Great time for planning, organizing, and setting up systems. Your brain is becoming sharper and more focused.',
      hormonalFactors: {
        estrogen: 'Rising - improving cognitive function and verbal skills',
        progesterone: 'Low - minimal impact',
        testosterone: 'Low - building confidence gradually',
        cortisol: 'Balanced - good stress response'
      },
      recommendedActivities: [
        {
          type: 'Planning & Strategy',
          timing: 'Best Time',
          duration: '2-4 hours',
          focus: 'Strategic planning, goal setting, system design',
          activities: ['Annual/quarterly planning', 'Project roadmaps', 'Process improvements', 'Team structure planning', 'Budget planning'],
          why: 'Estrogen is rising, improving your ability to see the big picture and plan strategically. Your cognitive function is improving daily.'
        },
        {
          type: 'Meetings',
          timing: 'Good Time',
          duration: '30-60 minutes',
          focus: 'Collaborative meetings, brainstorming, team alignment',
          activities: ['Team meetings', 'Brainstorming sessions', 'Planning meetings', 'Status updates', 'Collaborative discussions'],
          why: 'Your communication skills are improving. Good for collaborative work and building consensus.'
        },
        {
          type: 'Creative Work',
          timing: 'Moderate',
          duration: '1-3 hours',
          focus: 'Ideation, concept development, creative exploration',
          activities: ['Brainstorming', 'Concept development', 'Creative exploration', 'Design thinking', 'Innovation sessions'],
          why: 'Creativity is building but not at peak. Good for exploring ideas and concepts.'
        },
        {
          type: 'Crucial Conversations',
          timing: 'Moderate',
          duration: '30-60 minutes',
          focus: 'Important discussions, feedback, negotiations',
          activities: ['Performance reviews', 'Difficult conversations', 'Negotiations', 'Feedback sessions', 'Conflict resolution'],
          why: 'Your communication is improving, but wait for peak phase for highest-stakes conversations.'
        },
        {
          type: 'Administrative Tasks',
          timing: 'Excellent',
          duration: '1-2 hours',
          focus: 'Organization, documentation, routine work',
          activities: ['Email organization', 'Documentation', 'Data entry', 'Filing and organizing', 'Routine tasks'],
          why: 'Your focus and organization skills are improving. Perfect for catching up on administrative work.'
        }
      ],
      avoid: [
        'Scheduling high-stakes presentations - save for Manifestation Phase',
        'Important negotiations - wait for peak confidence',
        'Major decision-making - gather info now, decide later',
        'Overcommitting - energy is still building'
      ],
      tips: [
        'Use this phase to prepare for peak performance days',
        'Schedule important meetings for Days 11-15 if possible',
        'Focus on planning and preparation',
        'Your cognitive function improves daily - take advantage',
        'Set up systems and processes that will support you later',
        'This is a great time for learning and skill development'
      ],
      performanceExpectations: {
        planning: 'Excellent - strategic thinking improving',
        meetings: 'Good - communication skills building',
        creativity: 'Moderate - ideas flowing but not at peak',
        decisionMaking: 'Good - but wait for peak phase for major decisions',
        presentations: 'Moderate - save important ones for peak phase',
        negotiations: 'Moderate - wait for peak confidence'
      }
    },
    'Manifestation Phase': {
      performanceLevel: 'peak',
      cognitiveLevel: 'Peak',
      communicationLevel: 'Peak',
      decisionMakingLevel: 'Peak',
      creativityLevel: 'Peak',
      overview: 'PEAK PERFORMANCE WINDOW! This is your absolute best time for work. Your brain power, confidence, verbal skills, and decision-making are at their highest. Schedule your most important work here.',
      hormonalFactors: {
        estrogen: 'Peak - optimal cognitive function, verbal skills, confidence',
        progesterone: 'Rising slightly - minimal impact',
        testosterone: 'Surge - maximum confidence and assertiveness',
        cortisol: 'Optimal - excellent stress response'
      },
      recommendedActivities: [
        {
          type: 'Presentations & Public Speaking',
          timing: 'PEAK TIME',
          duration: '30-90 minutes',
          focus: 'High-stakes presentations, pitches, public speaking',
          activities: ['Client presentations', 'Board meetings', 'Conference talks', 'Sales pitches', 'Product launches', 'Keynote speeches'],
          why: 'Your verbal skills, confidence, and charisma are at their absolute peak. This is when you shine brightest.'
        },
        {
          type: 'Negotiations & Deals',
          timing: 'PEAK TIME',
          duration: '1-3 hours',
          focus: 'Important negotiations, contract discussions, deal-making',
          activities: ['Salary negotiations', 'Contract negotiations', 'Partnership deals', 'Vendor negotiations', 'Investment discussions'],
          why: 'Testosterone surge gives you maximum confidence and assertiveness. Perfect for high-stakes negotiations.'
        },
        {
          type: 'Crucial Conversations',
          timing: 'PEAK TIME',
          duration: '30-90 minutes',
          focus: 'Difficult conversations, feedback, conflict resolution',
          activities: ['Performance reviews', 'Difficult feedback', 'Conflict resolution', 'Relationship conversations', 'Boundary setting'],
          why: 'Your communication skills and confidence are at peak. You can handle difficult conversations with clarity and assertiveness.'
        },
        {
          type: 'Decision-Making',
          timing: 'PEAK TIME',
          duration: 'Varies',
          focus: 'Major decisions, strategic choices, important commitments',
          activities: ['Major business decisions', 'Strategic choices', 'Hiring decisions', 'Investment decisions', 'Partnership decisions'],
          why: 'Your cognitive function is at its highest. You can process complex information and make clear, confident decisions.'
        },
        {
          type: 'Creative Work',
          timing: 'PEAK TIME',
          duration: '2-4 hours',
          focus: 'High-impact creative work, innovation, problem-solving',
          activities: ['Creative strategy', 'Innovation projects', 'Problem-solving', 'Design work', 'Content creation', 'Campaign development'],
          why: 'Peak cognitive function and confidence make this ideal for breakthrough creative work.'
        },
        {
          type: 'Meetings',
          timing: 'PEAK TIME',
          duration: '30-90 minutes',
          focus: 'Important meetings, client meetings, leadership meetings',
          activities: ['Client meetings', 'Leadership meetings', 'Important discussions', 'Stakeholder meetings', 'Strategic meetings'],
          why: 'You\'re at your most charismatic and persuasive. Perfect for important meetings where you need to influence and inspire.'
        }
      ],
      avoid: [
        'Wasting this window on routine tasks - delegate those',
        'Scheduling low-priority meetings - protect this time',
        'Overcommitting - focus on high-impact work',
        'Multitasking - focus on one important thing at a time'
      ],
      tips: [
        'Block this time for your most important work',
        'Schedule presentations, negotiations, and crucial conversations here',
        'This is THE time to ask for raises, promotions, or opportunities',
        'Your confidence is at peak - take calculated risks',
        'Protect this time - say no to low-priority requests',
        'Use this phase to make major decisions',
        'Your verbal skills are at their best - leverage them'
      ],
      performanceExpectations: {
        planning: 'Peak - but focus on execution, not planning',
        meetings: 'Peak - most charismatic and persuasive',
        creativity: 'Peak - breakthrough ideas and solutions',
        decisionMaking: 'Peak - clear, confident decisions',
        presentations: 'Peak - best performance possible',
        negotiations: 'Peak - maximum confidence and assertiveness'
      }
    },
    'Power Phase 2': {
      performanceLevel: 'high',
      cognitiveLevel: 'Excellent Focus',
      communicationLevel: 'Good',
      decisionMakingLevel: 'Good',
      creativityLevel: 'Moderate',
      overview: 'Excellent focus and endurance. While not at peak, this phase is perfect for deep work, completing projects, and following through on commitments. Your ability to concentrate is enhanced.',
      hormonalFactors: {
        estrogen: 'Dropping - still supportive but declining',
        progesterone: 'Rising - promotes focus and introspection',
        testosterone: 'Moderate - confidence still good',
        cortisol: 'Balanced - good for sustained effort'
      },
      recommendedActivities: [
        {
          type: 'Deep Work & Focus',
          timing: 'Excellent',
          duration: '2-4 hours',
          focus: 'Complex problem-solving, detailed work, analysis',
          activities: ['Data analysis', 'Research', 'Writing', 'Coding', 'Financial analysis', 'Report writing'],
          why: 'Progesterone promotes deep focus and concentration. Perfect for work requiring sustained attention.'
        },
        {
          type: 'Project Completion',
          timing: 'Excellent',
          duration: '3-6 hours',
          focus: 'Finishing projects, following through, execution',
          activities: ['Project completion', 'Task execution', 'Implementation', 'Follow-through', 'Deliverable creation'],
          why: 'Your focus and endurance are excellent. Perfect for completing work started in earlier phases.'
        },
        {
          type: 'Meetings',
          timing: 'Good',
          duration: '30-60 minutes',
          focus: 'One-on-one meetings, detailed discussions, follow-ups',
          activities: ['One-on-one meetings', 'Follow-up meetings', 'Detailed discussions', 'Status reviews', 'Progress check-ins'],
          why: 'Good focus makes you effective in smaller, more focused meetings.'
        },
        {
          type: 'Administrative & Organization',
          timing: 'Excellent',
          duration: '1-3 hours',
          focus: 'Organization, documentation, process improvement',
          activities: ['Documentation', 'Process improvement', 'System optimization', 'Quality control', 'Review and refinement'],
          why: 'Enhanced focus makes this ideal for detailed organizational work.'
        },
        {
          type: 'Creative Work',
          timing: 'Moderate',
          duration: '1-3 hours',
          focus: 'Refinement, editing, iteration',
          activities: ['Editing and refinement', 'Iteration', 'Quality improvement', 'Polishing work', 'Detail work'],
          why: 'Good for refining and improving creative work, though not ideal for breakthrough creativity.'
        },
        {
          type: 'Crucial Conversations',
          timing: 'Moderate',
          duration: '30-60 minutes',
          focus: 'Follow-up conversations, routine feedback',
          activities: ['Follow-up conversations', 'Routine feedback', 'Status updates', 'Progress discussions'],
          why: 'Good for routine conversations, but save high-stakes ones for peak phase.'
        }
      ],
      avoid: [
        'Scheduling important presentations - confidence is declining',
        'Major negotiations - wait for next peak phase',
        'Expecting peak creativity - focus on execution instead',
        'Overcommitting to new projects - focus on completion'
      ],
      tips: [
        'Focus on completing work started in earlier phases',
        'This is excellent for deep, focused work',
        'Use your enhanced focus for complex problem-solving',
        'Great time for documentation and process improvement',
        'Your endurance is good - tackle longer tasks',
        'Protect your focus time - minimize interruptions'
      ],
      performanceExpectations: {
        planning: 'Good - but focus on execution',
        meetings: 'Good - effective in focused settings',
        creativity: 'Moderate - better for refinement than creation',
        decisionMaking: 'Good - but less confident than peak',
        presentations: 'Moderate - save important ones for peak',
        negotiations: 'Moderate - confidence declining'
      }
    },
    'Nurture Phase': {
      performanceLevel: 'low-moderate',
      cognitiveLevel: 'Lower',
      communicationLevel: 'Sensitive',
      decisionMakingLevel: 'Lower',
      creativityLevel: 'Lower',
      overview: 'Time for rest and reflection. Your energy and cognitive function are lower. Focus on less demanding tasks, reflection, and planning for the next cycle. This phase is crucial for recovery.',
      hormonalFactors: {
        estrogen: 'Low - reduced energy and cognitive function',
        progesterone: 'Peak - promotes rest and introspection',
        testosterone: 'Low - reduced confidence and assertiveness',
        cortisol: 'May be elevated - increased stress sensitivity'
      },
      recommendedActivities: [
        {
          type: 'Reflection & Planning',
          timing: 'Good',
          duration: '1-2 hours',
          focus: 'Reflection, review, planning for next cycle',
          activities: ['Cycle review', 'Lessons learned', 'Planning for next cycle', 'Goal reflection', 'Personal development'],
          why: 'Progesterone promotes introspection. Good time to reflect and plan, but avoid major decisions.'
        },
        {
          type: 'Gentle Tasks',
          timing: 'Best',
          duration: '1-2 hours',
          focus: 'Low-stress tasks, routine work, maintenance',
          activities: ['Email cleanup', 'Light reading', 'Routine tasks', 'Maintenance work', 'Simple organization'],
          why: 'Your energy is lower. Focus on tasks that don\'t require high cognitive load.'
        },
        {
          type: 'Meetings',
          timing: 'Avoid if Possible',
          duration: 'Keep Short',
          focus: 'Only essential meetings, keep brief',
          activities: ['Essential meetings only', 'Brief check-ins', 'Simple updates'],
          why: 'Your energy and focus are lower. Avoid meetings if possible, or keep them very brief.'
        },
        {
          type: 'Creative Work',
          timing: 'Not Recommended',
          duration: 'N/A',
          focus: 'Rest and recovery',
          activities: ['Rest', 'Recovery', 'Self-care'],
          why: 'Your creativity and energy are at their lowest. This is not the time for creative work.'
        },
        {
          type: 'Crucial Conversations',
          timing: 'Avoid',
          duration: 'N/A',
          focus: 'Postpone if possible',
          activities: ['Postpone difficult conversations', 'Reschedule if possible'],
          why: 'Your emotional sensitivity is higher and confidence is lower. Postpone difficult conversations if possible.'
        },
        {
          type: 'Decision-Making',
          timing: 'Avoid Major Decisions',
          duration: 'N/A',
          focus: 'Postpone major decisions',
          activities: ['Postpone major decisions', 'Gather information instead'],
          why: 'Your cognitive function is lower and emotional sensitivity is higher. Avoid major decisions during this phase.'
        }
      ],
      avoid: [
        'Scheduling important meetings - reschedule if possible',
        'Major presentations - save for next peak phase',
        'Negotiations - confidence is at lowest',
        'Difficult conversations - emotional sensitivity is high',
        'Major decisions - cognitive function is lower',
        'Creative work - energy and creativity are low',
        'Overcommitting - honor your need for rest'
      ],
      tips: [
        'This phase is essential for recovery - honor it',
        'Reschedule important meetings if possible',
        'Focus on reflection and planning, not execution',
        'Your emotional sensitivity is higher - be gentle with yourself',
        'This is NOT a failure - it\'s a necessary part of the cycle',
        'Use this time to rest and prepare for the next cycle',
        'Avoid making major decisions - wait for peak phase',
        'Protect your energy - say no to non-essential requests'
      ],
      performanceExpectations: {
        planning: 'Moderate - good for reflection, not action planning',
        meetings: 'Lower - avoid if possible',
        creativity: 'Lower - not the time for creative work',
        decisionMaking: 'Lower - avoid major decisions',
        presentations: 'Lower - reschedule if possible',
        negotiations: 'Lower - confidence is at lowest'
      }
    }
  }

  return workInfo[phase.name] || null
}

