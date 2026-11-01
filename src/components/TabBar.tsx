import { NavLink } from 'react-router-dom'
import './TabBar.css'

/** The two tabs (D16): Ciclo and Aprender. */
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Secciones">
      <NavLink to="/" end>
        Ciclo
      </NavLink>
      <NavLink to="/aprender">Aprender</NavLink>
    </nav>
  )
}
