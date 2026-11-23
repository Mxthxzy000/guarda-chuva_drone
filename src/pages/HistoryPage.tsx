import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CloudRain } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services/dataService'
import { AppShell } from '../components/AppShell'
import type { Atendimento, AtendimentoStatus } from '../types'

const FILTERS: Array<'Todos' | AtendimentoStatus> = [
  'Todos',
  'A caminho',
  'Em atendimento',
  'Concluído',
  'Cancelado',
]

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function statusBadgeClass(status: AtendimentoStatus): string {
  switch (status) {
    case 'A caminho':
      return 'badge badge--info'
    case 'Em atendimento':
      return 'badge badge--success'
    case 'Concluído':
      return 'badge badge--neutral'
    case 'Cancelado':
      return 'badge badge--danger'
  }
}

export function HistoryPage() {
  const { user } = useAuth()
  const [dispatches, setDispatches] = useState<Atendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'Todos' | AtendimentoStatus>('Todos')

  useEffect(() => {
    if (!user) return
    dataService
      .listUserDispatches(user.id)
      .then(setDispatches)
      .finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => {
    if (filter === 'Todos') return dispatches
    return dispatches.filter((d) => d.status === filter)
  }, [dispatches, filter])

  return (
    <AppShell
      title="Histórico de Uso"
      subtitle="Consulte todos os chamados de cobertura realizados pela sua conta."
      headerAction={
        <Link to="/dashboard" className="btn btn--primary btn--sm">
          <CloudRain size={16} aria-hidden="true" />
          <span>Novo chamado</span>
        </Link>
      }
    >
      <section className="bento-shell">
        <div className="bento-toolbar">
          <div className="filter-pills" role="group" aria-label="Filtrar por status">
            {FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-pill${filter === status ? ' filter-pill--active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="badge badge--neutral">
            <Clock size={14} aria-hidden="true" />
            {filtered.length} registro(s)
          </span>
        </div>

        <article className="panel">
          {loading ? (
            <div className="empty-state">Carregando histórico...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              Nenhum atendimento encontrado para o filtro selecionado.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Local</th>
                    <th>Duração</th>
                    <th>Estação de origem</th>
                    <th>Data e hora</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{item.local}</td>
                      <td>{item.duracao_minutos} min</td>
                      <td>{item.estacao_nome || 'Seleção automática'}</td>
                      <td>{formatDateTime(item.criado_em)}</td>
                      <td>
                        <span className={statusBadgeClass(item.status)}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </AppShell>
  )
}
