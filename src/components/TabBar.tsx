import { NavLink } from 'react-router-dom'
import './TabBar.css'

/** The three tabs (D23): Hoy, Plan and Aprender. */
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Secciones">
      <NavLink to="/" end>
        Hoy
      </NavLink>
      <NavLink to="/plan">Plan</NavLink>
      <NavLink to="/aprender">Aprender</NavLink>
    </nav>
  )
}
