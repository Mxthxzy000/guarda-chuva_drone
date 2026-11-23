import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BatteryCharging, CloudRain, MapPin } from 'lucide-react'
import { dataService } from '../services/dataService'
import { AppShell } from '../components/AppShell'
import type { EstacaoRecarga } from '../types'

export function StationsPage() {
  const [stations, setStations] = useState<EstacaoRecarga[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dataService
      .listStations()
      .then(setStations)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stations
    return stations.filter(
      (s) => s.nome.toLowerCase().includes(q) || s.endereco.toLowerCase().includes(q)
    )
  }, [stations, search])

  const totalVagas = useMemo(
    () => stations.reduce((sum, st) => sum + st.vagas, 0),
    [stations]
  )

  return (
    <AppShell
      title="Estações de Recarga"
      subtitle="Rede de pontos de recarga e decolagem dos drones Aeropia em Porto Alegre."
      headerAction={
        <Link to="/dashboard" className="btn btn--primary btn--sm">
          <CloudRain size={16} aria-hidden="true" />
          <span>Chamar Cobertura</span>
        </Link>
      }
    >
      <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Estações ativas</span>
            <MapPin size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stations.length}</div>
          <div className="kpi-card__meta">Pontos operando na cidade</div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Capacidade total</span>
            <BatteryCharging size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{totalVagas} vagas</div>
          <div className="kpi-card__meta">Docas de recarga indutiva</div>
        </article>
      </section>

      <section className="bento-shell">
        <div className="field" style={{ maxWidth: 420 }}>
          <label htmlFor="station-search" className="field__label">
            Buscar por nome ou endereço
          </label>
          <input
            id="station-search"
            type="search"
            className="field__input"
            placeholder="Ex.: Mercado Público, Farroupilha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <article className="panel">
          {loading ? (
            <div className="empty-state">Carregando estações de recarga...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">Nenhuma estação encontrada.</div>
          ) : (
            <div className="station-list">
              {filtered.map((st) => (
                <div key={st.id} className="station-item">
                  <div>
                    <h2 className="station-item__name">{st.nome}</h2>
                    <p className="station-item__addr">{st.endereco}</p>
                  </div>
                  <span className="badge badge--info">{st.vagas} vagas</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </AppShell>
  )
}
