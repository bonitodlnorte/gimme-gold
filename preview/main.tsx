import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CicloScreen } from '../src/screens/Ciclo'
import { cycleStatus } from '../src/domain/cycle'
import { addDays, today } from '../src/domain/dates'
import '../src/styles/global.css'
const day = Number(new URLSearchParams(location.search).get('day') ?? 17)
const start = addDays(today(), -(day - 1))
const periods = [{ start, end: addDays(start, 4) }, { start: addDays(start, -28), end: addDays(start, -24) }]
const status = cycleStatus(periods, { declaredLength: 28, contraception: 'no' }, today())!
const noop = async () => {}
createRoot(document.getElementById('root')!).render(
  <MemoryRouter><Routes><Route path="*" element={<CicloScreen status={status} contraception="no" periods={periods} onPeriodStarted={noop} onPeriodEnded={noop} />} /></Routes></MemoryRouter>,
)
