import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  BatteryCharging,
  CloudRain,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { dataService } from '../services/dataService'
import { AppShell } from '../components/AppShell'
import type { AdminStats, EstacaoRecarga } from '../types'

interface StationFormErrors {
  nome?: string
  endereco?: string
  vagas?: string
}

export function AdminPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [stations, setStations] = useState<EstacaoRecarga[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Formulário CRUD Estação de Recarga (RF04 / CT-04)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [vagas, setVagas] = useState('')
  const [errors, setErrors] = useState<StationFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadAdminData = useCallback(async () => {
    // CT-04: nunca carregar dados administrativos se não for admin
    if (!isAdmin) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [stationsList, adminStats] = await Promise.all([
        dataService.listStations(),
        dataService.getAdminStats(),
      ])
      setStations(stationsList)
      setStats(adminStats)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  // Bloqueio estrito para usuário comum (CT-04 passo 6)
  if (!isAdmin) {
    return (
      <AppShell title="Acesso restrito">
        <section className="restricted-card" role="alert" aria-labelledby="restricted-heading">
          <div className="restricted-card__icon" aria-hidden="true">
            <Lock size={26} />
          </div>
          <h2 id="restricted-heading" className="panel__title" style={{ fontSize: 22 }}>
            Acesso restrito ao administrador
          </h2>
          <p className="panel__desc" style={{ maxWidth: 400 }}>
            Sua conta ({user?.email}) possui perfil de usuário comum. Apenas administradores podem
            gerenciar estações de recarga.
          </p>
          <Link to="/dashboard" className="btn btn--primary">
            Voltar para Chamar Cobertura
          </Link>
        </section>
      </AppShell>
    )
  }

  const resetForm = () => {
    setEditingId(null)
    setNome('')
    setEndereco('')
    setVagas('')
    setErrors({})
  }

  const startEdit = (station: EstacaoRecarga) => {
    setEditingId(station.id)
    setNome(station.nome)
    setEndereco(station.endereco)
    setVagas(String(station.vagas))
    setErrors({})
    setFormError(null)
    setFormSuccess(null)
    setConfirmDeleteId(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    // CT-04: Campos obrigatórios (nome, endereço e vagas) vazios são recusados
    const nextErrors: StationFormErrors = {}
    const parsedVagas = Number(vagas)

    if (!nome.trim()) {
      nextErrors.nome = 'Informe o nome da estação de recarga.'
    }
    if (!endereco.trim()) {
      nextErrors.endereco = 'Informe o endereço da estação.'
    }
    if (!vagas.trim() || !Number.isInteger(parsedVagas) || parsedVagas <= 0) {
      nextErrors.vagas = 'Informe um número inteiro de vagas maior que zero.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const result = editingId
        ? await dataService.updateStation(editingId, {
          nome,
          endereco,
          vagas: parsedVagas,
        })
        : await dataService.createStation({
          nome,
          endereco,
          vagas: parsedVagas,
        })

      if (!result.ok) {
        setFormError(result.error || 'Não foi possível salvar a estação.')
        return
      }

      setFormSuccess(
        result.message ||
        (editingId ? 'Estação atualizada com sucesso.' : 'Estação cadastrada com sucesso.')
      )
      resetForm()
      await loadAdminData()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setFormError(null)
    setFormSuccess(null)
    const result = await dataService.deleteStation(id)
    if (!result.ok) {
      setFormError(result.error || 'Erro ao excluir a estação.')
      return
    }
    if (editingId === id) resetForm()
    setConfirmDeleteId(null)
    setFormSuccess(result.message || 'Estação excluída com sucesso.')
    await loadAdminData()
  }

  return (
    <AppShell
      title="Administrador"
      subtitle="Gerencie as estações de recarga exibidas em Chamar Cobertura."
    >
      <section className="kpi-grid" aria-label="Métricas administrativas">
        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Estações cadastradas</span>
            <MapPin size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stats?.totalEstacoes ?? stations.length}</div>
          <div className="kpi-card__meta">Sincronizadas com Chamar Cobertura</div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Total de vagas</span>
            <BatteryCharging size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stats?.totalVagas ?? 0}</div>
          <div className="kpi-card__meta">Capacidade somada da rede</div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Usuários cadastrados</span>
            <Users size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stats?.totalUsuarios ?? 0}</div>
          <div className="kpi-card__meta">Perfis ativos na plataforma</div>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__head">
            <span>Atendimentos</span>
            <CloudRain size={17} aria-hidden="true" />
          </div>
          <div className="kpi-card__value">{stats?.totalAtendimentos ?? 0}</div>
          <div className="kpi-card__meta">{stats?.atendimentosAtivos ?? 0} em andamento</div>
        </article>
      </section>

      <section className="bento-shell">
        <div className="bento-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)' }}>
          {/* Formulário de cadastro / edição */}
          <article className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">
                  {editingId ? 'Editar estação de recarga' : 'Nova estação de recarga'}
                </h2>
                <p className="panel__desc">
                  Todos os campos são obrigatórios e refletem imediatamente no site.
                </p>
              </div>
              <Plus size={18} color="var(--accent)" aria-hidden="true" />
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="st-nome" className="field__label">
                  Nome da estação
                </label>
                <input
                  id="st-nome"
                  type="text"
                  className="field__input"
                  placeholder="Ex.: Estação Mercado Público"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(errors.nome)}
                  aria-describedby={errors.nome ? 'st-nome-err' : undefined}
                />
                {errors.nome && (
                  <p id="st-nome-err" className="field__error">
                    {errors.nome}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="st-endereco" className="field__label">
                  Endereço
                </label>
                <input
                  id="st-endereco"
                  type="text"
                  className="field__input"
                  placeholder="Ex.: Largo Glênio Peres"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  aria-invalid={Boolean(errors.endereco)}
                  aria-describedby={errors.endereco ? 'st-endereco-err' : undefined}
                />
                {errors.endereco && (
                  <p id="st-endereco-err" className="field__error">
                    {errors.endereco}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="st-vagas" className="field__label">
                  Vagas
                </label>
                <input
                  id="st-vagas"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="field__input"
                  placeholder="Ex.: 6"
                  value={vagas}
                  onChange={(e) => setVagas(e.target.value)}
                  aria-invalid={Boolean(errors.vagas)}
                  aria-describedby={errors.vagas ? 'st-vagas-err' : undefined}
                />
                {errors.vagas && (
                  <p id="st-vagas-err" className="field__error">
                    {errors.vagas}
                  </p>
                )}
              </div>

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
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving
                    ? 'Salvando...'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Salvar estação'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </article>

          {/* Lista gerenciável de estações */}
          <article className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Estações cadastradas</h2>
                <p className="panel__desc">
                  Edite ou exclua registros existentes.
                </p>
              </div>
              <span className="badge badge--neutral">{stations.length} registro(s)</span>
            </div>

            {loading ? (
              <div className="empty-state">Carregando estações...</div>
            ) : stations.length === 0 ? (
              <div className="empty-state">
                Nenhuma estação cadastrada. Utilize o formulário ao lado para incluir a primeira.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Endereço</th>
                      <th>Vagas</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((st) => (
                      <tr key={st.id}>
                        <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{st.nome}</td>
                        <td>{st.endereco}</td>
                        <td>
                          <span className="badge badge--info">{st.vagas} vagas</span>
                        </td>
                        <td>
                          <div className="data-table__actions">
                            {confirmDeleteId === st.id ? (
                              <>
                                <button
                                  type="button"
                                  className="btn btn--danger btn--sm"
                                  onClick={() => handleDelete(st.id)}
                                >
                                  Confirmar exclusão
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--secondary btn--sm"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn btn--secondary btn--sm"
                                  onClick={() => startEdit(st)}
                                >
                                  <Pencil size={14} aria-hidden="true" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--danger btn--sm"
                                  onClick={() => setConfirmDeleteId(st.id)}
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                  <span>Excluir</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      </section>
    </AppShell>
  )
}
