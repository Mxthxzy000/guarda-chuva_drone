import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  CloudRain,
  History,
  LogOut,
  MapPin,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

interface AppShellProps {
  title: string
  subtitle?: string
  headerAction?: ReactNode
  children: ReactNode
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AppShell({ title, subtitle, headerAction, children }: AppShellProps) {
  const { user, logout, isLiveSupabase } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar__link${isActive ? ' sidebar__link--active' : ''}`

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo-principal">
        Ir para o conteúdo principal
      </a>

      {/* Barra mobile (fiel ao menu lateral compacto da print mobile-dashboard.png) */}
      <header className="mobile-topbar">
        <div className="mobile-topbar__left">
          <button
            type="button"
            className="mobile-topbar__menu-btn"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" aria-label="Ir para a página inicial Aeropia">
            <img
              src="/brand/logo-texto.png"
              alt="Nimbus Acessórios Urbanos"
              className="mobile-topbar__logo"
            />
          </Link>
        </div>
        <span className="mode-pill">
          <span
            className={`mode-pill__dot${isLiveSupabase ? '' : ' mode-pill__dot--demo'}`}
            aria-hidden="true"
          />
          {isLiveSupabase ? 'Supabase' : 'Demo'}
        </span>
      </header>

      <div
        className={`mobile-backdrop${menuOpen ? ' mobile-backdrop--open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar principal (fiel à print pc-dashboard.png) */}
      <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`} aria-label="Menu principal">
        <div className="sidebar__top">
          <div className="sidebar__brand">
            <Link to="/" onClick={() => setMenuOpen(false)} aria-label="Ir para a página inicial Aeropia">
              <img src="/brand/logo-texto.png" alt="Nimbus Acessórios Urbanos" />
            </Link>
          </div>

          {user && (
            <div className="sidebar__user">
              <div className="sidebar__avatar" aria-hidden="true">
                {getInitials(user.nome)}
              </div>
              <div className="sidebar__user-meta">
                <span className="sidebar__user-name">{user.nome}</span>
                <span className="sidebar__user-sub">
                  {user.role === 'admin' ? 'Administrador' : user.bairro}
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="sidebar__section-label">Menu Principal</div>
            <nav className="sidebar__nav">
              <NavLink
                to="/dashboard"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                <CloudRain size={18} aria-hidden="true" />
                <span>Chamar Cobertura</span>
              </NavLink>

              <NavLink
                to="/historico"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                <History size={18} aria-hidden="true" />
                <span>Histórico de Uso</span>
              </NavLink>

              <NavLink
                to="/estacoes"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                <MapPin size={18} aria-hidden="true" />
                <span>Estações de Recarga</span>
              </NavLink>

              {/* CT-02 e CT-04: item Administrador só aparece para administradores */}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>Administrador</span>
                </NavLink>
              )}
            </nav>
          </div>
        </div>

        <div className="sidebar__bottom">
          <button
            type="button"
            className="sidebar__link"
            onClick={toggleTheme}
            aria-pressed={isLight}
          >
            {isLight ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            <span>{isLight ? 'Modo escuro' : 'Modo claro'}</span>
          </button>

          <NavLink
            to="/perfil"
            className={navClass}
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} aria-hidden="true" />
            <span>Meu Perfil</span>
          </NavLink>

          <button type="button" className="sidebar__link" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main id="conteudo-principal" className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <div className="actions-row">
            {headerAction}
            <ThemeToggle showLabel />
            <span className="mode-pill" title="Status da conexão com banco de dados">
              <span
                className={`mode-pill__dot${isLiveSupabase ? '' : ' mode-pill__dot--demo'}`}
                aria-hidden="true"
              />
              {isLiveSupabase ? 'Supabase conectado' : 'Modo demonstração local'}
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
