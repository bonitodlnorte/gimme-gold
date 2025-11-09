/**
 * Helper function to get translation key for a phase name
 */
export function getPhaseTranslationKey(phaseName) {
  const phaseKeyMap = {
    'Power Phase 1': 'phases.powerPhase1',
    'Manifestation Phase': 'phases.manifestationPhase',
    'Power Phase 2': 'phases.powerPhase2',
    'Nurture Phase': 'phases.nurturePhase'
  }
  return phaseKeyMap[phaseName] || phaseName
}

/**
 * Helper function to translate phase name
 */
export function translatePhaseName(phaseName, t) {
  const key = getPhaseTranslationKey(phaseName)
  return t(`${key}.name`)
}

/**
 * Helper function to translate phase description
 */
export function translatePhaseDescription(phaseName, t) {
  const key = getPhaseTranslationKey(phaseName)
  return t(`${key}.description`)
}

