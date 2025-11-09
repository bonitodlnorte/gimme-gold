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

export function addCycleEntry(date, note = '') {
  const history = getCycleHistory()
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  
  const newEntry = {
    id: Date.now().toString(),
    date: newDate,
    cycleLength: null, // Will be calculated after sorting
    note: note.trim()
  }
  const updatedHistory = [...history, newEntry]
  // Recalculate all cycle lengths after adding new entry
  const recalculated = recalculateCycleLengths(updatedHistory)
  saveCycleHistory(recalculated)
  return recalculated
}

export function recalculateCycleLengths(history) {
  // Sort by date (most recent first)
  const sorted = [...history].sort((a, b) => b.date - a.date)
  
  // Recalculate all cycle lengths
  return sorted.map((entry, index) => {
    if (index === 0) {
      // First entry (most recent) has no previous period, so cycle length is null
      return { ...entry, cycleLength: null }
    } else {
      // Calculate cycle length from previous period
      const previousDate = new Date(sorted[index - 1].date)
      previousDate.setHours(0, 0, 0, 0)
      const currentDate = new Date(entry.date)
      currentDate.setHours(0, 0, 0, 0)
      const diffTime = previousDate - currentDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0 && diffDays < 100) { // Reasonable range
        return { ...entry, cycleLength: diffDays }
      } else {
        return { ...entry, cycleLength: null }
      }
    }
  })
}

export function updateCycleEntry(id, updates) {
  const history = getCycleHistory()
  let updatedHistory = history.map(entry => {
    if (entry.id === id) {
      return {
        ...entry,
        ...updates,
        date: updates.date ? new Date(updates.date) : entry.date
      }
    }
    return entry
  })
  
  // If date was updated, recalculate all cycle lengths
  if (updates.date) {
    updatedHistory = recalculateCycleLengths(updatedHistory)
  }
  
  saveCycleHistory(updatedHistory)
  return updatedHistory
}

export function deleteCycleEntry(id) {
  const history = getCycleHistory()
  const filtered = history.filter(entry => entry.id !== id)
  // Recalculate cycle lengths after deletion
  const recalculated = recalculateCycleLengths(filtered)
  saveCycleHistory(recalculated)
  return recalculated
}

export function calculateAverageCycleLength(history) {
  // Only include entries with cycle length (exclude first entry and current period)
  const entriesWithLength = history.filter(entry => entry.cycleLength !== null)
  if (entriesWithLength.length === 0) return null
  
  // Use only the latest 4 measurements
  const latest4 = entriesWithLength.slice(0, 4)
  const total = latest4.reduce((sum, entry) => sum + entry.cycleLength, 0)
  return Math.round((total / latest4.length) * 10) / 10 // Round to 1 decimal
}

export function calculateCycleTrend(history) {
  // Only include entries with cycle length (exclude first entry and current period)
  const entriesWithLength = history.filter(entry => entry.cycleLength !== null)
  if (entriesWithLength.length < 2) return null
  
  // Get the last 3 cycles for trend calculation
  const recentCycles = entriesWithLength.slice(0, Math.min(3, entriesWithLength.length))
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

