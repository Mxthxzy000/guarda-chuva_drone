import { Link } from 'react-router-dom'
import { KeyRound, Mail, MapPin, Shield, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/AppShell'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <AppShell title="Meu Perfil" subtitle="Dados da sua conta na plataforma Nimbus Aeropia.">
      <section className="bento-shell" style={{ maxWidth: 720 }}>
        <article className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Informações cadastrais</h2>
            <span className={`badge ${user?.role === 'admin' ? 'badge--info' : 'badge--neutral'}`}>
              {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>

          <div className="station-list">
            <div className="station-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <User size={18} color="#8e95a2" aria-hidden="true" />
                <div>
                  <span className="sensor-item__label">Nome completo</span>
                  <div className="station-item__name">{user?.nome}</div>
                </div>
              </div>
            </div>

            <div className="station-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={18} color="#8e95a2" aria-hidden="true" />
                <div>
                  <span className="sensor-item__label">E-mail</span>
                  <div className="station-item__name">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="station-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={18} color="#8e95a2" aria-hidden="true" />
                <div>
                  <span className="sensor-item__label">Bairro</span>
                  <div className="station-item__name">{user?.bairro}</div>
                </div>
              </div>
            </div>

            <div className="station-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Shield size={18} color="#8e95a2" aria-hidden="true" />
                <div>
                  <span className="sensor-item__label">Nível de acesso</span>
                  <div className="station-item__name">
                    {user?.role === 'admin'
                      ? 'Administrador (acesso ao gerenciamento de estações)'
                      : 'Usuário comum (Chamar Cobertura e Histórico)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="actions-row" style={{ marginTop: 6 }}>
            <Link to="/redefinir-senha" className="btn btn--secondary">
              <KeyRound size={16} aria-hidden="true" />
              <span>Alterar senha</span>
            </Link>
          </div>
        </article>
      </section>
    </AppShell>
  )
}
