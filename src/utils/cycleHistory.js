// Cycle History Management Utilities

const STORAGE_KEY = 'gimmeGold_cycleHistory'

export function getCycleHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const history = JSON.parse(stored)
    // Convert date strings back to Date objects
    return history.map(entry => ({
      ...entry,
      date: new Date(entry.date)
    }))
  } catch (error) {
    console.error('Error loading cycle history:', error)
    return []
  }
}

export function saveCycleHistory(history) {
  try {
    // Convert Date objects to ISO strings for storage
    const serialized = history.map(entry => ({
      ...entry,
      date: entry.date.toISOString()
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
  } catch (error) {
    console.error('Error saving cycle history:', error)
  }
}

export function addCycleEntry(date, cycleLength, note = '') {
  const history = getCycleHistory()
  const newEntry = {
    id: Date.now().toString(),
    date: new Date(date),
    cycleLength: cycleLength,
    note: note.trim()
  }
  const updatedHistory = [...history, newEntry].sort((a, b) => b.date - a.date) // Most recent first
  saveCycleHistory(updatedHistory)
  return updatedHistory
}

export function updateCycleEntry(id, updates) {
  const history = getCycleHistory()
  const updatedHistory = history.map(entry => {
    if (entry.id === id) {
      return {
        ...entry,
        ...updates,
        date: updates.date ? new Date(updates.date) : entry.date
      }
    }
    return entry
  })
  saveCycleHistory(updatedHistory)
  return updatedHistory
}

export function deleteCycleEntry(id) {
  const history = getCycleHistory()
  const updatedHistory = history.filter(entry => entry.id !== id)
  saveCycleHistory(updatedHistory)
  return updatedHistory
}

export function calculateAverageCycleLength(history) {
  if (history.length === 0) return null
  const total = history.reduce((sum, entry) => sum + entry.cycleLength, 0)
  return Math.round((total / history.length) * 10) / 10 // Round to 1 decimal
}

export function calculateCycleTrend(history) {
  if (history.length < 2) return null
  
  // Get the last 3 cycles for trend calculation
  const recentCycles = history.slice(0, Math.min(3, history.length))
  const cycleLengths = recentCycles.map(entry => entry.cycleLength)
  
  // Calculate if trend is increasing, decreasing, or stable
  if (cycleLengths.length === 2) {
    const diff = cycleLengths[0] - cycleLengths[1]
    if (Math.abs(diff) < 1) return 'stable'
    return diff > 0 ? 'lengthening' : 'shortening'
  }
  
  // For 3+ cycles, use linear regression
  const avgFirst = (cycleLengths[0] + cycleLengths[1]) / 2
  const avgLast = (cycleLengths[cycleLengths.length - 2] + cycleLengths[cycleLengths.length - 1]) / 2
  const diff = avgLast - avgFirst
  
  if (Math.abs(diff) < 1) return 'stable'
  return diff > 0 ? 'lengthening' : 'shortening'
}

export function getTrendIcon(trend) {
  switch (trend) {
    case 'shortening':
      return '📉'
    case 'lengthening':
      return '📈'
    case 'stable':
      return '➡️'
    default:
      return ''
  }
}

export function getTrendText(trend) {
  switch (trend) {
    case 'shortening':
      return 'Shortening'
    case 'lengthening':
      return 'Lengthening'
    case 'stable':
      return 'Stable'
    default:
      return 'No trend data'
  }
}

