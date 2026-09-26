// Export of the user's locally stored data, ahead of the app rebuild.
//
// Format (v1) — the new app's importer depends on this shape, keep it stable:
// {
//   "format": "gimme-gold-export",
//   "version": 1,
//   "exportedAt": "<ISO date>",
//   "data": {
//     "lastPeriodDate": "<ISO date> | null",
//     "cycleLength": <number> | null,
//     "cycleHistory": [{ "id", "date": "<ISO date>", "cycleLength", "note" }]
//   }
// }

const KEYS = {
  lastPeriodDate: 'gimmeGold_lastPeriodDate',
  cycleLength: 'gimmeGold_cycleLength',
  cycleHistory: 'gimmeGold_cycleHistory'
}

export const EXPORTED_AT_KEY = 'gimmeGold_exportedAt'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function hasStoredData() {
  return Boolean(read(KEYS.lastPeriodDate) || read(KEYS.cycleHistory))
}

export function buildExport() {
  let cycleHistory = []
  try {
    cycleHistory = JSON.parse(read(KEYS.cycleHistory) || '[]')
  } catch {
    cycleHistory = []
  }
  const cycleLength = parseInt(read(KEYS.cycleLength), 10)

  return {
    format: 'gimme-gold-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      lastPeriodDate: read(KEYS.lastPeriodDate),
      cycleLength: Number.isFinite(cycleLength) ? cycleLength : null,
      cycleHistory
    }
  }
}

export function exportFileName() {
  return `gimme-gold-${new Date().toISOString().slice(0, 10)}.json`
}

export function markExported() {
  try {
    localStorage.setItem(EXPORTED_AT_KEY, new Date().toISOString())
  } catch {
    // Storage unavailable: the banner will simply show again next visit
  }
}

export function wasExported() {
  return Boolean(read(EXPORTED_AT_KEY))
}
