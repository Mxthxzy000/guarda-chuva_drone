import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudRain,
  MapPin,
  Navigation,
  Radio,
  Wind,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services/dataService'
import { AppShell } from '../components/AppShell'
import { TelemetryChart } from '../components/TelemetryChart'
import type { Atendimento, AtendimentoStatus, EstacaoRecarga } from '../types'

const DURATION_PRESETS = [15, 20, 30, 45, 60]

type WeatherPreset = 'moderada' | 'forte' | 'vento'

const WEATHER_SCENARIOS: Record<
  WeatherPreset,
  {
    label: string
    rainPct: number
    windDeg: number
    distanceCm: number
    canopy: string
    suspended: boolean
  }
> = {
  moderada: {
    label: 'Chuva moderada',
    rainPct: 58,
    windDeg: 12,
    distanceCm: 54,
    canopy: 'Aberta (180°)',
    suspended: false,
  },
  forte: {
    label: 'Chuva forte',
    rainPct: 86,
    windDeg: 21,
    distanceCm: 48,
    canopy: 'Aberta (180°)',
    suspended: false,
  },
  vento: {
    label: 'Vento forte (alerta)',
    rainPct: 74,
    windDeg: 34,
    distanceCm: 60,
    canopy: 'Recolhida (0°)',
    suspended: true,
  },
}

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

export function DashboardPage() {
  const { user } = useAuth()

  const [stations, setStations] = useState<EstacaoRecarga[]>([])
  const [dispatches, setDispatches] = useState<Atendimento[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Formulário Chamar Cobertura (RF05 / CT-05)
  const [local, setLocal] = useState('')
  const [duracao, setDuracao] = useState('20')
  const [selectedStationId, setSelectedStationId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ local?: string; duracao?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Telemetria climática (sensores previstos no Projeto 08)
  const [weatherPreset, setWeatherPreset] = useState<WeatherPreset>('moderada')
  const weather = WEATHER_SCENARIOS[weatherPreset]

  const loadData = useCallback(async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const [stationsList, dispatchesList] = await Promise.all([
        dataService.listStations(),
        dataService.listUserDispatches(user.id),
      ])
      setStations(stationsList)
      setDispatches(dispatchesList)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeDispatch = useMemo(
    () =>
      dispatches.find((d) => d.status === 'A caminho' || d.status === 'Em atendimento') ?? null,
    [dispatches]
  )

  const totalVagas = useMemo(
    () => stations.reduce((acc, st) => acc + st.vagas, 0),
    [stations]
  )

  const totalMinutos = useMemo(
    () => dispatches.reduce((acc, d) => acc + d.duracao_minutos, 0),
    [dispatches]
  )

  const chartPoints = useMemo(() => {
    if (dispatches.length >= 2) {
      return [...dispatches]
        .slice(0, 7)
        .reverse()
        .map((d, idx) => ({
          label: `#${idx + 1}`,
          value: d.duracao_minutos,
        }))
    }
    return [
      { label: '08h', value: 22 },
      { label: '10h', value: 38 },
      { label: '12h', value: 18 },
      { label: '14h', value: 64 },
      { label: '16h', value: 49 },
      { label: '18h', value: 78 },
      { label: '20h', value: weather.rainPct },
    ]
  }, [dispatches, weather.rainPct])

  const handleCallDrone = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setFormError(null)
    setFormSuccess(null)

    // CT-05: não permite abrir um segundo atendimento enquanto houver um em andamento
    if (activeDispatch) {
      setFormError(
        'Você já possui um atendimento em andamento. Conclua ou cancele o atual antes de chamar outra cobertura.'
      )
      return
    }

    if (weather.suspended) {
      setFormError(
        'Voo temporariamente suspenso por vento forte (inclinação acima de 30° no MPU6050). Aguarde a estabilização climática.'
      )
      return
    }

    const nextErrors: { local?: string; duracao?: string } = {}
    const parsedDuration = Number(duracao)

    if (!local.trim()) {
      nextErrors.local = 'Informe o local onde deseja receber a cobertura.'
    }
    if (!duracao.trim() || !Number.isInteger(parsedDuration) || parsedDuration < 5 || parsedDuration > 180) {
      nextErrors.duracao = 'Informe uma duração inteira entre 5 e 180 minutos.'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const result = await dataService.createDispatch({
        userId: user.id,
        local,
        duracaoMinutos: parsedDuration,
        estacaoId: selectedStationId || stations[0]?.id || null,
      })

      if (!result.ok) {
        setFormError(result.error || 'Não foi possível solicitar o drone.')
        return
      }

      setFormSuccess(result.message || 'Drone acionado com status A caminho.')
      setLocal('')
      await loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdvanceStatus = async (id: string, nextStatus: AtendimentoStatus) => {
    setUpdatingId(id)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await dataService.updateDispatchStatus(id, nextStatus)
      if (!res.ok) {
        setFormError(res.error || 'Erro ao atualizar status.')
        return
      }
      setFormSuccess(`Status do atendimento atualizado para "${nextStatus}".`)
      await loadData()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AppShell
      title="Chamar Cobertura"
      subtitle={`Olá, ${user?.nome ?? 'usuário'} · Bairro ${user?.bairro ?? 'Porto Alegre'}`}
    >
      {/* 4 KPI Cards superiores (layout fiel a pc-dashboard.png e mobile-dashboard.png) */}
      <section className="kpi-grid" aria-label="Resumo operacional">
        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Status do atendimento</span>
            <Radio size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">
            {activeDispatch ? activeDispatch.status : 'Disponível'}
          </div>
          <div className="kpi-card__meta">
            {activeDispatch
              ? `${activeDispatch.local} · ${activeDispatch.duracao_minutos} min`
              : 'Pronto para novo chamado'}
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Estações de recarga</span>
            <MapPin size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stations.length}</div>
          <div className="kpi-card__meta">{totalVagas} vagas disponíveis na rede</div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Sensores climáticos</span>
            {weather.suspended ? (
              <AlertTriangle size={17} color="#f59e0b" aria-hidden="true" />
            ) : (
              <Wind size={17} aria-hidden="true" />
            )}
          </div>
          <div className="kpi-card__value">
            {weather.rainPct}% · {weather.windDeg}°
          </div>
          <div className="kpi-card__meta">
            {weather.suspended ? 'Voo suspenso (vento ≥ 30°)' : 'Condição segura para voo'}
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Meus atendimentos</span>
            <Clock size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{dispatches.length}</div>
          <div className="kpi-card__meta">{totalMinutos} min de cobertura registrados</div>
        </article>
      </section>

      {/* Contêiner Bento principal (fiel ao bloco inferior de pc-dashboard.png) */}
      <section className="bento-shell" aria-label="Operação de cobertura e estações">
        <div className="bento-toolbar">
          <div className="filter-pills" role="group" aria-label="Simulação de sensores climáticos">
            {(Object.keys(WEATHER_SCENARIOS) as WeatherPreset[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`filter-pill${weatherPreset === key ? ' filter-pill--active' : ''}`}
                onClick={() => setWeatherPreset(key)}
              >
                {WEATHER_SCENARIOS[key].label}
              </button>
            ))}
          </div>

          <span className="badge badge--neutral">
            <Activity size={14} aria-hidden="true" />
            Telemetria ESP32 · HC-SR04 · MPU6050
          </span>
        </div>

        {weather.suspended && (
          <div className="alert alert--warning" role="alert">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div>
              <strong>Alerta de vento forte ({weather.windDeg}°):</strong> O acelerômetro MPU6050
              detectou inclinação acima de 30°. O voo autônomo foi suspenso por segurança e a cúpula
              retrátil foi recolhida.
            </div>
          </div>
        )}

        <div className="bento-grid">
          {/* Coluna principal (esquerda) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card de atendimento em andamento (CT-05) */}
            {activeDispatch && (
              <article className="active-call-card" aria-label="Atendimento em andamento">
                <div className="panel__header">
                  <div>
                    <h2 className="panel__title">Atendimento em andamento</h2>
                    <p className="panel__desc">
                      Registrado em {formatDateTime(activeDispatch.criado_em)}
                    </p>
                  </div>
                  <span className={statusBadgeClass(activeDispatch.status)}>
                    {activeDispatch.status}
                  </span>
                </div>

                <div className="sensor-strip">
                  <div className="sensor-item">
                    <span className="sensor-item__label">Local</span>
                    <span className="sensor-item__value">{activeDispatch.local}</span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-item__label">Duração</span>
                    <span className="sensor-item__value">
                      {activeDispatch.duracao_minutos} min
                    </span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-item__label">Distância (HC-SR04)</span>
                    <span className="sensor-item__value">{weather.distanceCm} cm</span>
                  </div>
                  <div className="sensor-item">
                    <span className="sensor-item__label">Cúpula (Servo)</span>
                    <span className="sensor-item__value">{weather.canopy}</span>
                  </div>
                </div>

                <div className="actions-row">
                  {activeDispatch.status === 'A caminho' && (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={updatingId === activeDispatch.id}
                      onClick={() => handleAdvanceStatus(activeDispatch.id, 'Em atendimento')}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>Confirmar chegada do drone</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={updatingId === activeDispatch.id}
                    onClick={() => handleAdvanceStatus(activeDispatch.id, 'Concluído')}
                  >
                    <span>Concluir atendimento</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    disabled={updatingId === activeDispatch.id}
                    onClick={() => handleAdvanceStatus(activeDispatch.id, 'Cancelado')}
                  >
                    <span>Cancelar</span>
                  </button>
                </div>
              </article>
            )}

            {/* Formulário Chamar Cobertura (RF05 / CT-05) */}
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Solicitar guarda-chuva drone</h2>
                  <p className="panel__desc">
                    Informe o ponto de encontro e o tempo de uso para acionar o Aeropia mais próximo.
                  </p>
                </div>
                <CloudRain size={20} color="#0f91fe" aria-hidden="true" />
              </div>

              <form className="auth-form" onSubmit={handleCallDrone} noValidate>
                <div className="form-grid-2">
                  <div className="field">
                    <label htmlFor="call-local" className="field__label">
                      Local
                    </label>
                    <div className="field__control">
                      <span className="field__icon" aria-hidden="true">
                        <Navigation size={18} />
                      </span>
                      <input
                        id="call-local"
                        name="local"
                        type="text"
                        className="field__input field__input--with-icon"
                        placeholder="Ex.: Praça da Matriz"
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.local)}
                        aria-describedby={fieldErrors.local ? 'call-local-err' : undefined}
                      />
                    </div>
                    {fieldErrors.local && (
                      <p id="call-local-err" className="field__error">
                        {fieldErrors.local}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="call-duracao" className="field__label">
                      Duração (minutos)
                    </label>
                    <div className="field__control">
                      <span className="field__icon" aria-hidden="true">
                        <Clock size={18} />
                      </span>
                      <input
                        id="call-duracao"
                        name="duracao"
                        type="number"
                        inputMode="numeric"
                        min={5}
                        max={180}
                        className="field__input field__input--with-icon"
                        placeholder="20"
                        value={duracao}
                        onChange={(e) => setDuracao(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.duracao)}
                        aria-describedby={fieldErrors.duracao ? 'call-duracao-err' : undefined}
                      />
                    </div>
                    {fieldErrors.duracao && (
                      <p id="call-duracao-err" className="field__error">
                        {fieldErrors.duracao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="duration-chips" role="group" aria-label="Durações rápidas">
                  {DURATION_PRESETS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`chip${Number(duracao) === mins ? ' chip--active' : ''}`}
                      onClick={() => setDuracao(String(mins))}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>

                <div className="field">
                  <label htmlFor="call-station" className="field__label">
                    Estação de recarga de origem (opcional)
                  </label>
                  <select
                    id="call-station"
                    className="field__select"
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                  >
                    <option value="">Selecionar estação mais próxima automaticamente</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nome} — {st.endereco} ({st.vagas} vagas)
                      </option>
                    ))}
                  </select>
                </div>

                {activeDispatch && (
                  <div className="alert alert--info" role="status">
                    <span>
                      Há um atendimento ativo ({activeDispatch.status}). Não é possível abrir um
                      segundo atendimento simultâneo.
                    </span>
                  </div>
                )}

                {formError && (
                  <div className="alert alert--error" role="alert">
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="alert alert--success" role="status">
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="actions-row">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={submitting || Boolean(activeDispatch) || weather.suspended}
                  >
                    {submitting ? 'Acionando drone...' : 'Chamar agora'}
                  </button>
                </div>
              </form>
            </article>

            {/* Gráfico minimalista branco sobre escuro (fiel ao pc-dashboard.png) */}
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">
                    {dispatches.length >= 2
                      ? 'Duração dos últimos atendimentos'
                      : 'Intensidade de chuva hoje em Porto Alegre'}
                  </h2>
                  <p className="panel__desc">
                    {dispatches.length >= 2
                      ? 'Tempo em minutos por chamado realizado na sua conta.'
                      : 'Leitura percentual do potenciômetro de chuva (0% a 100%).'}
                  </p>
                </div>
              </div>

              <TelemetryChart
                points={chartPoints}
                unit={dispatches.length >= 2 ? ' min' : '%'}
                ariaLabel="Gráfico de linha com leituras recentes da plataforma Aeropia"
              />
            </article>

            {/* Histórico recente */}
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h2 className="panel__title">Atendimentos recentes</h2>
                  <p className="panel__desc">
                    Seus chamados gravados na tabela de atendimentos.
                  </p>
                </div>
              </div>

              {loadingData ? (
                <div className="empty-state">Carregando atendimentos...</div>
              ) : dispatches.length === 0 ? (
                <div className="empty-state">
                  Nenhum atendimento registrado ainda. Preencha o formulário acima e clique em{' '}
                  <strong>Chamar agora</strong>.
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Local</th>
                        <th>Duração</th>
                        <th>Estação</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dispatches.slice(0, 6).map((item) => (
                        <tr key={item.id}>
                          <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{item.local}</td>
                          <td>{item.duracao_minutos} min</td>
                          <td>{item.estacao_nome || 'Automática'}</td>
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
          </div>

          {/* Coluna direita: Lista viva de Estações de Recarga (CT-04 passo 4!) */}
          <aside className="panel" aria-label="Estações de recarga disponíveis">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Estações de recarga</h2>
                <p className="panel__desc">
                  Clique em uma estação para selecionar como origem do drone.
                </p>
              </div>
            </div>

            {loadingData ? (
              <div className="empty-state">Carregando estações...</div>
            ) : stations.length === 0 ? (
              <div className="empty-state">Nenhuma estação cadastrada no momento.</div>
            ) : (
              <div className="station-list">
                {stations.map((station) => {
                  const isSelected = selectedStationId === station.id
                  return (
                    <button
                      key={station.id}
                      type="button"
                      className={`station-item station-item--selectable${
                        isSelected ? ' station-item--selected' : ''
                      }`}
                      onClick={() =>
                        setSelectedStationId((prev) => (prev === station.id ? '' : station.id))
                      }
                    >
                      <div style={{ minWidth: 0 }}>
                        <h3 className="station-item__name">{station.nome}</h3>
                        <p className="station-item__addr">{station.endereco}</p>
                      </div>
                      <span className="badge badge--info">{station.vagas} vagas</span>
                    </button>
                  )
                })}
              </div>
            )}
          </aside>
        </div>
      </section>
    </AppShell>
  )
}
